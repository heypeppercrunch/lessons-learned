import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  notionId: text("notion_id").notNull().unique(),
  lesson: text("lesson").notNull(),
  content: text("content"),  // Add content field
  importance: text("importance"),
  category: text("category"),
  category1: text("category1"),
  notionUrl: text("notion_url").notNull(),
  properties: jsonb("properties").notNull()
});

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export const lessonResponseSchema = z.object({
  lessons: z.array(z.object({
    id: z.number(),
    notionId: z.string(),
    lesson: z.string(),
    content: z.string().nullable(),
    importance: z.string().nullable(),
    category: z.string().nullable(),
    category1: z.string().nullable(),
    notionUrl: z.string(),
    properties: z.record(z.any())
  }))
});