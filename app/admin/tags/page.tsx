import type { Metadata } from "next";
import { getAdminTags } from "@/lib/db/queries/admin";
import { TagsManager } from "./TagsManager";

export const metadata: Metadata = { title: "Admin — Tags" };

export default async function AdminTagsPage() {
  const allTags = await getAdminTags();
  return <TagsManager initialTags={allTags} />;
}
