import type { Express } from "express";
import { createServer } from "http";
import { Client } from "@notionhq/client";
import { storage } from "./storage";
import { lessonResponseSchema } from "@shared/schema";

if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
  throw new Error("Missing required environment variables");
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getPageContent(pageId: string): Promise<string> {
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    // Combine all block contents into a single string
    const content = blocks.results.map(block => {
      // Type assertion since we know these blocks are from Notion
      const b = block as any;
      if (b.type === 'paragraph') {
        return b.paragraph.rich_text.map((t: any) => t.plain_text).join('');
      }
      return '';
    }).filter(Boolean).join('\n\n');

    return content;
  } catch (error) {
    console.error(`Error fetching content for page ${pageId}:`, error);
    return '';
  }
}

interface MemStorage {
  clearLessons(): Promise<void>;
  insertLesson(lesson: any): Promise<void>;
  getLessons(): Promise<any[]>;
  getRandomLessons(count: number): Promise<any[]>;
  getCachedContent(notionId: string): string | null;
  updateLessonContent(lessonId: number, content: string): Promise<void>;
}

async function getAllNotionPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;

    // Add a small delay to avoid rate limiting
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allPages;
}

export async function registerRoutes(app: Express) {
  app.get("/api/lessons/refresh", async (req, res) => {
    try {
      console.log("Fetching from database:", DATABASE_ID);
      const allPages = await getAllNotionPages();

      console.log("Total entries found:", allPages.length);
      await storage.clearLessons();

      // First, insert all lessons without content for faster initial load
      for (const page of allPages) {
        const props = page.properties as Record<string, any>;
        const lessonContent = props.Lesson?.title?.[0]?.plain_text;

        if (!lessonContent) {
          console.log("Skipping entry with no lesson content:", page.id);
          continue;
        }

        await storage.insertLesson({
          notionId: page.id,
          lesson: lessonContent,
          content: null, // Don't fetch content immediately
          importance: props.Importance?.multi_select?.[0]?.name || null,
          category: props.Category?.multi_select?.[0]?.name || null,
          category1: props.Category1?.multi_select?.[0]?.name || null,
          notionUrl: (page as any).url || "",
          properties: props
        });
      }

      const lessons = await storage.getLessons();
      console.log("Successfully loaded lessons:", lessons.length);
      res.json({ lessons });
    } catch (error) {
      console.error("Error fetching from Notion:", error);
      res.status(500).json({ message: "Failed to fetch lessons from Notion" });
    }
  });

  // Add new endpoint to fetch content for a specific lesson
  app.get("/api/lessons/:id/content", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lessons = await storage.getLessons();
      const lesson = lessons.find(l => l.id === lessonId);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Check if content is already cached
      const cachedContent = (storage as MemStorage).getCachedContent(lesson.notionId);
      if (cachedContent) {
        return res.json({ content: cachedContent });
      }

      // If not cached, fetch from Notion
      const content = await getPageContent(lesson.notionId);
      await storage.updateLessonContent(lessonId, content);
      res.json({ content });
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      res.status(500).json({ message: "Failed to fetch lesson content" });
    }
  });

  app.get("/api/lessons/random", async (req, res) => {
    try {
      const count = Number(req.query.count) || 2; // Changed default from 3 to 2
      const lessons = await storage.getRandomLessons(count);
      const response = { lessons };

      const parsed = lessonResponseSchema.parse(response);
      res.json(parsed);
    } catch (error) {
      console.error("Error getting random lessons:", error);
      res.status(500).json({ message: "Failed to get random lessons" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}