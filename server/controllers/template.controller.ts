import type { Context } from "hono";
import type { AppEnv } from "../middleware/auth";
import {
  templateService,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from "../services/template.service";

export const templateController = {
  async list(c: Context<AppEnv>) {
    const rows = await templateService.list(c.get("userId"));
    return c.json(rows);
  },

  async create(c: Context<AppEnv>, input: CreateTemplateInput) {
    const tpl = await templateService.create(c.get("userId"), input);
    return c.json(tpl, 201);
  },

  async update(c: Context<AppEnv>, input: UpdateTemplateInput) {
    const updated = await templateService.update(
      c.req.param("id")!,
      c.get("userId"),
      input
    );
    return c.json(updated);
  },

  async remove(c: Context<AppEnv>) {
    await templateService.remove(c.req.param("id")!, c.get("userId"));
    return c.json({ success: true });
  },
};
