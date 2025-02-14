import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Lesson } from "@shared/schema";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  lesson: Lesson;
}

export function LessonCard({ lesson }: Props) {
  const tags = [
    lesson.importance && { label: lesson.importance, color: "bg-yellow-500" },
    lesson.category && { label: lesson.category, color: "bg-blue-500" },
    lesson.category1 && { label: lesson.category1, color: "bg-green-500" }
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <Badge key={i} className={`${tag?.color} text-white`}>
                {tag?.label}
              </Badge>
            ))}
          </div>
          <CardTitle className="line-clamp-2 text-lg">
            {lesson.lesson}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Full Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Lesson Details</span>
                  <a 
                    href={lesson.notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, i) => (
                    <Badge key={i} className={`${tag?.color} text-white`}>
                      {tag?.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-lg">{lesson.lesson}</p>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}
