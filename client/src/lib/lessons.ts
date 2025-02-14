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
