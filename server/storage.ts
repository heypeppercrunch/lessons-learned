import { lessons, type Lesson, type InsertLesson } from "@shared/schema";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  insertLesson(lesson: InsertLesson): Promise<Lesson>;
  clearLessons(): Promise<void>;
  getRandomLessons(count: number): Promise<Lesson[]>;
  updateLessonContent(id: number, content: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private lessons: Map<number, Lesson>;
  private contentCache: Map<string, string>;
  private currentId: number;

  constructor() {
    this.lessons = new Map();
    this.contentCache = new Map();
    this.currentId = 1;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async insertLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.currentId++;
    const newLesson: Lesson = {
      ...lesson,
      id,
      importance: lesson.importance || null,
      category: lesson.category || null,
      category1: lesson.category1 || null,
      content: lesson.content || null
    };

    if (lesson.content) {
      this.contentCache.set(lesson.notionId, lesson.content);
    }

    this.lessons.set(id, newLesson);
    return newLesson;
  }

  async updateLessonContent(id: number, content: string): Promise<void> {
    const lesson = this.lessons.get(id);
    if (lesson) {
      lesson.content = content;
      this.contentCache.set(lesson.notionId, content);
      this.lessons.set(id, lesson);
    }
  }

  async clearLessons(): Promise<void> {
    this.lessons.clear();
    this.contentCache.clear();
  }

  async getRandomLessons(count: number): Promise<Lesson[]> {
    const allLessons = Array.from(this.lessons.values());
    const shuffled = allLessons.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getCachedContent(notionId: string): string | undefined {
    return this.contentCache.get(notionId);
  }
}

export const storage = new MemStorage();