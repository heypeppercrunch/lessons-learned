import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { type Lesson } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLessonContent } from "@/lib/lessons";
import { Button } from "./ui/button";

interface Props {
  lesson: Lesson;
}

export function LessonCard({ lesson }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: content, isLoading } = useLessonContent(isExpanded ? lesson.id : 0);

  const tags = [
    lesson.importance && { label: lesson.importance, color: "bg-yellow-500" },
    lesson.category && { label: lesson.category, color: "bg-blue-500" },
    lesson.category1 && { label: lesson.category1, color: "bg-green-500" }
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Badge key={i} className={`${tag.color} text-white`}>
                  {tag.label}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <a 
                href={lesson.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
          <CardTitle className="text-xl leading-normal">
            {lesson.lesson}
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent className="text-muted-foreground whitespace-pre-wrap">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              content
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}