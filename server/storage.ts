import { lessons, type Lesson, type InsertLesson } from "@shared/schema";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  insertLesson(lesson: InsertLesson): Promise<Lesson>;
  clearLessons(): Promise<void>;
  getRandomLessons(count: number): Promise<Lesson[]>;
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

  async insertLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.currentId++;
    const newLesson = { ...lesson, id };
    this.lessons.set(id, newLesson);
    return newLesson;
  }

  async clearLessons(): Promise<void> {
    this.lessons.clear();
  }

  async getRandomLessons(count: number): Promise<Lesson[]> {
    const allLessons = Array.from(this.lessons.values());
    const shuffled = allLessons.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const storage = new MemStorage();
