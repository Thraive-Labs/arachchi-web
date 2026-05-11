import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "../lib/db/schema";

// ── Test accounts ─────────────────────────────────────────────────────────────
// These are for local development and staging only.
// Password is intentionally simple for test convenience.

const TEST_USERS = [
  { email: "test@customer.com", password: "qwerty123456", fullName: "Test Customer", role: "customer" as const },
  { email: "test@staff.com",    password: "qwerty123456", fullName: "Test Staff",    role: "staff"    as const },
  { email: "test@admin.com",    password: "qwerty123456", fullName: "Test Admin",    role: "admin"    as const },
];

async function seedUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
    console.error("Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log("Seeding test users...");

  for (const u of TEST_USERS) {
    // Create in Supabase Auth (email_confirm bypasses the verification email)
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName },
    });

    let userId: string;

    if (error) {
      if (error.message.toLowerCase().includes("already been registered") || error.code === "email_exists") {
        // User already exists in Auth — look them up
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users.find((au) => au.email === u.email);
        if (!existing) {
          console.error(`  ✗ ${u.email} — could not find existing auth user`);
          continue;
        }
        userId = existing.id;
        console.log(`  ~ ${u.email} — already in Auth, syncing role`);
      } else {
        console.error(`  ✗ ${u.email} — ${error.message}`);
        continue;
      }
    } else {
      userId = data.user.id;
    }

    // Upsert into our users table with the desired role
    await db
      .insert(users)
      .values({ id: userId, email: u.email, fullName: u.fullName, role: u.role })
      .onConflictDoUpdate({
        target: users.id,
        set: { role: u.role, fullName: u.fullName },
      });

    console.log(`  + ${u.email} (${u.role})`);
  }

  console.log("\nTest accounts ready:");
  console.log("  test@customer.com / qwerty123456  (customer)");
  console.log("  test@staff.com    / qwerty123456  (staff)");
  console.log("  test@admin.com    / qwerty123456  (admin)");

  await pool.end();
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
