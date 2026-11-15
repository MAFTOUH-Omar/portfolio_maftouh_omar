import process from "node:process";

try {
  process.loadEnvFile(".env.local");
} catch {
  // already loaded into the shell env, e.g. in CI.
}

// Dynamic imports: deferred until after .env.local is loaded above, since
// ESM `import` statements are hoisted and would otherwise run first,
// instantiating the DB pool before DATABASE_URL is in process.env.
async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/db/client");
  const { users } = await import("../src/db/schema");
  const { hashPassword } = await import("../src/lib/auth");
  const { newId } = await import("../src/lib/id");

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.");
  }

  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
    console.log(`Updated password for existing admin user: ${email}`);
  } else {
    await db.insert(users).values({ id: newId(), email, passwordHash });
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
