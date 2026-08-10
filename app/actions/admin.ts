"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  products,
  productVariants,
  productImages,
  productTags,
  tags,
  orders,
  users,
  wishlists,
} from "@/lib/db/schema";
import { getResend, FROM_ADDRESS } from "@/lib/email/client";
import { backInStockHtml } from "@/lib/email/templates/back-in-stock";
import { getUser } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/lib/auth/server";

export type AdminActionState = { error?: string; success?: string } | null;

// ── Auth guard ─────────────────────────────────────────────────────────────────

export async function requireStaff() {
  const authUser = await getUser();
  if (!authUser) throw new Error("Unauthorized");
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);
  if (!dbUser || !["staff", "admin"].includes(dbUser.role)) throw new Error("Forbidden");
  return authUser;
}

// ── Products ──────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  shortDescription: z.string().min(1, "Short description is required").max(500),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().uuid().nullable().optional(),
  basePriceCents: z.number().int().positive("Price must be positive"),
  compareAtPriceCents: z.number().int().positive().nullable().optional(),
  seoTitle: z.string().max(60).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  isActive: z.boolean(),
  tagIds: z.array(z.string().uuid()),
  relatedProductIds: z.array(z.string().uuid()),
}).strict();

export type ProductFormData = z.infer<typeof productSchema>;

export async function saveProductAction(
  productId: string | null,
  data: ProductFormData,
): Promise<{ error?: string; id?: string }> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const result = productSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid data." };

  const { tagIds, relatedProductIds, ...productData } = result.data;

  if (productId) {
    // Update
    await db
      .update(products)
      .set({ ...productData, relatedProductIds, updatedAt: new Date() })
      .where(eq(products.id, productId));

    // Replace tags
    await db.delete(productTags).where(eq(productTags.productId, productId));
    if (tagIds.length > 0) {
      await db.insert(productTags).values(tagIds.map((tagId) => ({ productId, tagId })));
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${productData.slug}`);
    return { id: productId };
  } else {
    // Create
    const [created] = await db
      .insert(products)
      .values({
        ...productData,
        relatedProductIds,
        description: productData.description,
      })
      .returning({ id: products.id });

    if (!created) return { error: "Failed to create product." };

    if (tagIds.length > 0) {
      await db.insert(productTags).values(tagIds.map((tagId) => ({ productId: created.id, tagId })));
    }

    revalidatePath("/admin/products");
    return { id: created.id };
  }
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const productId = formData.get("productId") as string;
  if (!productId) return;
  await db.update(products).set({ isActive: false }).where(eq(products.id, productId));
  revalidatePath("/admin/products");
}

// ── Variants ──────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  sku: z.string().min(1, "SKU is required").max(100),
  size: z.string().max(20).nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  colorHex: z.string().max(20).nullable().optional(),
  priceCents: z.number().int().positive(),
  stockQuantity: z.number().int().min(0),
  isActive: z.boolean(),
}).strict();

export async function saveVariantAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const result = variantSchema.safeParse({
    id: formData.get("id") ?? undefined,
    productId: formData.get("productId"),
    sku: formData.get("sku"),
    size: formData.get("size") || null,
    color: formData.get("color") || null,
    colorHex: formData.get("colorHex") || null,
    priceCents: Number(formData.get("priceCents")),
    stockQuantity: Number(formData.get("stockQuantity")),
    isActive: formData.get("isActive") === "true",
  });

  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid data." };

  const { id, ...data } = result.data;

  if (id) {
    await db.update(productVariants).set(data).where(eq(productVariants.id, id));
  } else {
    await db.insert(productVariants).values(data);
  }

  revalidatePath(`/admin/products/${result.data.productId}`);
  return { success: "Variant saved." };
}

export async function deleteVariantAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }
  const id = formData.get("variantId") as string;
  if (!id) return { error: "Missing variant ID." };
  await db.update(productVariants).set({ isActive: false }).where(eq(productVariants.id, id));
  revalidatePath("/admin/products");
  return { success: "Variant deactivated." };
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
): Promise<{ error?: string; url?: string; id?: string }> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };
  if (!file.type.startsWith("image/")) return { error: "File must be an image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `products/${productId}/${Date.now()}.${ext}`;

  const supabase = await createSupabaseServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);

  // Check if this product has any images yet
  const existing = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);

  const isPrimary = existing.length === 0;
  const alt = formData.get("alt") as string | null;
  const color = (formData.get("color") as string | null)?.trim() || null;

  const [inserted] = await db
    .insert(productImages)
    .values({ productId, url: publicUrl, alt: alt ?? "", position: existing.length, isPrimary, color })
    .returning({ id: productImages.id });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/product/${productId}`);
  return { url: publicUrl, id: inserted?.id };
}

export async function setImageColorAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const imageId = formData.get("imageId") as string;
  const productId = formData.get("productId") as string;
  const color = (formData.get("color") as string | null)?.trim() || null;
  if (!imageId) return;

  await db.update(productImages).set({ color }).where(eq(productImages.id, imageId));
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImageAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const id = formData.get("imageId") as string;
  if (!id) return;
  await db.delete(productImages).where(eq(productImages.id, id));
  revalidatePath("/admin/products");
}

export async function setPrimaryImageAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const imageId = formData.get("imageId") as string;
  const productId = formData.get("productId") as string;
  if (!imageId || !productId) return;

  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(eq(productImages.productId, productId));
  await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));

  revalidatePath(`/admin/products/${productId}`);
}

// ── Tags ──────────────────────────────────────────────────────────────────────

const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional().nullable(),
  isVisible: z.boolean(),
  position: z.number().int().min(0),
}).strict();

export async function saveTagAction(
  tagId: string | null,
  data: z.infer<typeof tagSchema>,
): Promise<{ error?: string; id?: string }> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const result = tagSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid data." };

  if (tagId) {
    await db.update(tags).set(result.data).where(eq(tags.id, tagId));
    revalidatePath("/admin/tags");
    return { id: tagId };
  } else {
    const [created] = await db.insert(tags).values(result.data).returning({ id: tags.id });
    revalidatePath("/admin/tags");
    return { id: created?.id };
  }
}

export async function toggleTagVisibilityAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }
  const id = formData.get("tagId") as string;
  const current = formData.get("isVisible") === "true";
  if (!id) return { error: "Missing tag ID." };
  await db.update(tags).set({ isVisible: !current }).where(eq(tags.id, id));
  revalidatePath("/admin/tags");
  return { success: "Visibility updated." };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function updateOrderStatusAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as typeof orders.status._.data;
  const trackingNumber = (formData.get("trackingNumber") as string | null) || null;
  const trackingUrl = (formData.get("trackingUrl") as string | null) || null;

  if (!orderId || !status) return { error: "Missing parameters." };

  await db
    .update(orders)
    .set({ status, trackingNumber, trackingUrl, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: "Order updated." };
}

// ── Users / Roles ─────────────────────────────────────────────────────────────

async function requireAdmin() {
  const authUser = await getUser();
  if (!authUser) throw new Error("Unauthorized");
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);
  if (!dbUser || dbUser.role !== "admin") throw new Error("Forbidden");
  return authUser;
}

export async function updateUserRoleAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let currentAdmin;
  try {
    currentAdmin = await requireAdmin();
  } catch {
    return { error: "Unauthorized." };
  }
  const targetId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  if (!targetId || !role) return { error: "Missing parameters." };
  if (!["customer", "staff", "admin"].includes(role)) return { error: "Invalid role." };
  if (targetId === currentAdmin.id) return { error: "You cannot change your own role." };

  await db
    .update(users)
    .set({ role: role as "customer" | "staff" | "admin" })
    .where(eq(users.id, targetId));

  revalidatePath("/admin/customers");
  return { success: "Role updated." };
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function updateStockAction(
  prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }
  const variantId = formData.get("variantId") as string;
  const qty = Number(formData.get("quantity"));
  if (!variantId || isNaN(qty) || qty < 0) return { error: "Invalid input." };

  // Fetch current state before update so we can detect 0 → positive transition
  const [variantRow] = await db
    .select({
      stockQuantity: productVariants.stockQuantity,
      size: productVariants.size,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.id, variantId))
    .limit(1);

  await db
    .update(productVariants)
    .set({ stockQuantity: qty })
    .where(eq(productVariants.id, variantId));

  // Send back-in-stock notifications when stock goes from 0 to positive
  if (variantRow && variantRow.stockQuantity === 0 && qty > 0) {
    try {
      const wishlistUsers = await db
        .select({ email: users.email })
        .from(wishlists)
        .innerJoin(users, eq(users.id, wishlists.userId))
        .where(eq(wishlists.variantId, variantId));

      if (wishlistUsers.length > 0) {
        const resend = getResend();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
        const productUrl = `${siteUrl}/product/${variantRow.productSlug}`;

        await Promise.allSettled(
          wishlistUsers.map(({ email }) =>
            resend.emails.send({
              from: FROM_ADDRESS,
              to: email,
              subject: `Back in stock: ${variantRow.productName}`,
              html: backInStockHtml({
                productName: variantRow.productName,
                productUrl,
                size: variantRow.size,
              }),
            }),
          ),
        );
      }
    } catch {
      // Email failure must not prevent the stock update from succeeding
    }
  }

  revalidatePath("/admin/inventory");
  return { success: "Stock updated." };
}
