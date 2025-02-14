import type { Express } from "express";
import { createServer } from "http";
import { Client } from "@notionhq/client";
import { storage } from "./storage";
import { lessonResponseSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
  throw new Error("Missing required environment variables");
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

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

        const lessonContent = props.Lesson?.rich_text?.[0]?.plain_text;
        if (!lessonContent) {
          console.log("Skipping entry with no lesson content:", page.id);
          continue;
        }

        await storage.insertLesson({
          notionId: page.id,
          lesson: lessonContent,
          importance: props.Importance?.select?.name || null,
          category: props.Category?.select?.name || null,
          category1: props.Category1?.select?.name || null,
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