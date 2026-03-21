import { varchar } from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from "uuid";

export const id = varchar("id", { length: 36 })
  .primaryKey()
  .$defaultFn(() => {
    return uuidv4();
  });
