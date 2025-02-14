import { Client } from "@notionhq/client";

if (!import.meta.env.VITE_NOTION_API_KEY) {
  throw new Error("VITE_NOTION_API_KEY environment variable not set");
}

if (!import.meta.env.VITE_NOTION_DATABASE_ID) {
  throw new Error("VITE_NOTION_DATABASE_ID environment variable not set");
}

export const notion = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY,
});

export const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
