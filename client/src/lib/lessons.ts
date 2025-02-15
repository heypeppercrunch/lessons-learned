import { useQuery, useMutation } from "@tanstack/react-query";
import { lessonResponseSchema } from "@shared/schema";
import { apiRequest } from "./queryClient";

export function useRandomLessons() {
  return useQuery({
    queryKey: ["/api/lessons/random"],
    select: (data) => lessonResponseSchema.parse(data)
  });
}

export function useRefreshLessons() {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("GET", "/api/lessons/refresh");
    }
  });
}

export function useLessonContent(lessonId: number) {
  return useQuery({
    queryKey: ["/api/lessons", lessonId, "content"],
    enabled: !!lessonId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/lessons/${lessonId}/content`);
      const data = await res.json();
      return data.content;
    }
  });
}