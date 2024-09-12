import { users } from "@/db/schema";

import { InferSelectModel } from "drizzle-orm";

// USER
export type user = InferSelectModel< typeof users>
