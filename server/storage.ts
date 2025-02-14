import { lessons, type Lesson, type InsertLesson } from "@shared/schema";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  insertLesson(lesson: InsertLesson): Promise<Lesson>;
  clearLessons(): Promise<void>;
}

export class MemStorage implements IStorage {
  private lessons: Map<number, Lesson>;
  private currentId: number;

  constructor() {
    this.lessons = new Map();
    this.currentId = 1;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async insertLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async clearLessons(): Promise<void> {
    this.lessons.clear();
  }
}

export const storage = new MemStorage();
