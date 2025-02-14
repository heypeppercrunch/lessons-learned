import type { Lesson } from "@shared/schema";
import { LessonCard } from "./lesson-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonGridProps {
  lessons: Lesson[];
  isLoading: boolean;
}

export function LessonGrid({ lessons, isLoading }: LessonGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-8 w-28 ml-auto" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
