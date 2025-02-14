import { LessonGrid } from "@/components/lesson-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Daily Lessons Review
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review and reflect on your collected wisdom. Each refresh brings new insights from your Notion database.
          </p>
        </div>
        
        <LessonGrid />
      </div>
    </div>
  );
}
