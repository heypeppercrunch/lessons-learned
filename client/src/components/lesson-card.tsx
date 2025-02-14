import type { Lesson } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {lesson.importance && (
              <Badge variant="secondary" className="capitalize">
                {lesson.importance}
              </Badge>
            )}
            {lesson.category && (
              <Badge variant="outline" className="capitalize">
                {lesson.category}
              </Badge>
            )}
            {lesson.category1 && (
              <Badge variant="outline" className="capitalize">
                {lesson.category1}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lesson.lesson}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => window.open(lesson.notionUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Notion
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
