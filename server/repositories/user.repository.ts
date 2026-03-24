import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";
import type { User } from "../schema/types";

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  async findByIds(ids: string[]): Promise<Map<string, User>> {
    if (ids.length === 0) return new Map();
    const rows = await db.select().from(users).where(inArray(users.id, ids));
    return new Map(rows.map((u) => [u.id, u]));
  },
};
