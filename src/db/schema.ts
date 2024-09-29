import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { primaryKey } from "drizzle-orm/pg-core/primary-keys";
import { AdapterAccount } from "next-auth/adapters";

// USERS
export const users = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().default("NO_NAME"),
    email: text("email").notNull(),
    password: text("password"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").notNull().default("user"),

    // Onboarding fields
    gender: text("gender"),
    dateOfBirth: timestamp("dateOfBirth", { mode: "date" }),
    course: text("course"),
    year: text("year"),
    relationshipStatus: text("relationshipStatus"),
    university: text("university"),
    interests: jsonb("interests").$type<string[]>(), 
    createdAt: timestamp("createdAt").defaultNow(),
    resetToken: text("resetToken"),
    resetTokenExpires: timestamp("resetTokenExpires"),
  },
  (table) => {
    return {
      userEmailIdx: uniqueIndex("user_email_idx").on(table.email),
    };
  }
);

// ACCOUNTS
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// SESSIONS
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// VERIFICATION TOKENS
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
