import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  notionId: text("notion_id").notNull().unique(),
  importance: text("importance"),
  category: text("category"),
  category1: text("category1"),
  lesson: text("lesson").notNull(),
  notionUrl: text("notion_url").notNull()
});

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export const notionLessonSchema = z.object({
  id: z.string(),
  url: z.string(),
  properties: z.object({
    Importance: z.object({
      select: z.object({
        name: z.string()
      }).nullable()
    }),
    Category: z.object({
      select: z.object({
        name: z.string()
      }).nullable()
    }),
    Category1: z.object({
      select: z.object({
        name: z.string()
      }).nullable()
    }),
    Lesson: z.object({
      rich_text: z.array(z.object({
        plain_text: z.string()
      }))
    })
  })
});

export type NotionLesson = z.infer<typeof notionLessonSchema>;
