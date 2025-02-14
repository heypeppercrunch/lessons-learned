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

export async function registerRoutes(app: Express) {
  app.get("/api/lessons/refresh", async (req, res) => {
    try {
      console.log("Fetching from database:", DATABASE_ID);
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
      });

      console.log("Total entries found:", response.results.length);

      await storage.clearLessons();

      for (const page of response.results) {
        // Type assertion to access properties safely
        const props = page.properties as Record<string, any>;

        // Log the properties to help debug
        console.log("Properties for entry:", page.id, JSON.stringify(props));

        const lessonContent = props.Lesson?.title?.[0]?.plain_text;
        if (!lessonContent) {
          console.log("Skipping entry with no lesson content:", page.id);
          continue;
        }

        // Fetch the full page content
        const pageContent = await getPageContent(page.id);

        await storage.insertLesson({
          notionId: page.id,
          lesson: lessonContent,
          content: pageContent,
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

  app.get("/api/lessons/random", async (req, res) => {
    try {
      const count = Number(req.query.count) || 3;
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