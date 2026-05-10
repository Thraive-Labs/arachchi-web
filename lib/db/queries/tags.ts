import { eq } from "drizzle-orm";
import { db } from "../client";
import { tags } from "../schema";

export async function getVisibleTags() {
  return db
    .select()
    .from(tags)
    .where(eq(tags.isVisible, true))
    .orderBy(tags.position);
}

export async function getTagBySlug(slug: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  return tag ?? null;
}
