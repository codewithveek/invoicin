import type { Context } from "hono";
import type { AppEnv } from "../middleware/auth";
import {
  clientService,
  type CreateClientInput,
  type UpdateClientInput,
} from "../services/client.service";

export const clientController = {
  async list(c: Context<AppEnv>) {
    const rows = await clientService.list(c.get("userId"));
    return c.json(rows);
  },

  async create(c: Context<AppEnv>, input: CreateClientInput) {
    const client = await clientService.create(c.get("userId"), input);
    return c.json(client, 201);
  },

  async update(c: Context<AppEnv>, input: UpdateClientInput) {
    const updated = await clientService.update(
      c.req.param("id")!,
      c.get("userId"),
      input
    );
    return c.json(updated);
  },

  async remove(c: Context<AppEnv>) {
    await clientService.remove(c.req.param("id")!, c.get("userId"));
    return c.json({ success: true });
  },
};
