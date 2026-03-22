import { varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

export const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(() => ulid());
