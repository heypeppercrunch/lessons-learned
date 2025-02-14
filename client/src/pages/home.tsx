import { useQuery, useMutation } from "@tanstack/react-query";
import { LessonGrid } from "@/components/lesson-grid";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Home() {
  const { toast } = useToast();

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/lessons/refresh");
      if (!res.ok) throw new Error("Failed to refresh lessons");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      toast({
        title: "Lessons Refreshed",
        description: "New lessons have been fetched from Notion",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh lessons from Notion",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Daily Lessons Review
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Reflect on three random lessons from your collection
          </p>
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Refresh Lessons
          </Button>
        </motion.div>

        <LessonGrid 
          lessons={lessons || []} 
          isLoading={lessonsLoading || refreshMutation.isPending} 
        />
      </main>
    </div>
  );
}
