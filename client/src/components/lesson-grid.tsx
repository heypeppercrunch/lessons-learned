import { LessonCard } from "./lesson-card";
import { Button } from "@/components/ui/button";
import { useRandomLessons, useRefreshLessons } from "@/lib/lessons";
import { queryClient } from "@/lib/queryClient";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export function LessonGrid() {
  const { data, isLoading } = useRandomLessons();
  const refresh = useRefreshLessons();

  // Initial load of lessons from Notion
  useEffect(() => {
    const initializeLessons = async () => {
      if (!data?.lessons.length) {
        await refresh.mutateAsync();
        queryClient.invalidateQueries({ queryKey: ["/api/lessons/random"] });
      }
    };

    initializeLessons();
  }, [data?.lessons.length]);

  const handleRefresh = async () => {
    await refresh.mutateAsync();
    queryClient.invalidateQueries({ queryKey: ["/api/lessons/random"] });
  };

  if (isLoading || refresh.isPending) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data?.lessons.length) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No lessons found.</p>
        <Button onClick={handleRefresh}>Refresh Lessons</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleRefresh}
          disabled={refresh.isPending}
          className="gap-2"
        >
          {refresh.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Get New Lessons
        </Button>
      </div>
    </div>
  );
}