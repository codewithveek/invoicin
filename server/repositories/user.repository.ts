import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";
import type { User } from "../schema/types";

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },
};
