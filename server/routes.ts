import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Client } from "@notionhq/client";
import { notionLessonSchema, type InsertLesson } from "@shared/schema";
import { z } from "zod";

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY environment variable not set");
}

if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("NOTION_DATABASE_ID environment variable not set");
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/lessons/refresh", async (req, res) => {
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
      });

      await storage.clearLessons();

      const lessons = response.results.map((result) => {
        const parsed = notionLessonSchema.parse(result);
        const lesson: InsertLesson = {
          notionId: parsed.id,
          importance: parsed.properties.Importance.select?.name || null,
          category: parsed.properties.Category.select?.name || null,
          category1: parsed.properties.Category1.select?.name || null,
          lesson: parsed.properties.Lesson.rich_text[0]?.plain_text || "",
          notionUrl: parsed.url
        };
        return lesson;
      });

      for (const lesson of lessons) {
        await storage.insertLesson(lesson);
      }

      res.json({ message: "Lessons refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing lessons:", error);
      if (error instanceof z.ZodError) {
        res.status(500).json({ message: "Invalid data from Notion API" });
      } else {
        res.status(500).json({ message: "Failed to refresh lessons" });
      }
    }
  });

  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      const randomLessons = lessons
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      res.json(randomLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
