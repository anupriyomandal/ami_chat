import { Lucia, TimeSpan } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    role: attributes.role,
    banned: attributes.banned,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    lastActiveAt: attributes.lastActiveAt,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  role: "user" | "admin";
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}
