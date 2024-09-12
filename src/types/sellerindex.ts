import { users } from "@/db/schema";

import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

// USER
export type user = InferSelectModel< typeof users>
