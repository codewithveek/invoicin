import { ulid } from "ulid";
import { templateRepository } from "../repositories/template.repository";

export interface CreateTemplateInput {
  name: string;
  items: unknown[];
  currency?: string;
  terms?: string;
  notes?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  items?: unknown[];
  currency?: string;
  terms?: string;
  notes?: string;
}

export const templateService = {
  async list(userId: string) {
    return templateRepository.findAllByUser(userId);
  },

  async create(userId: string, input: CreateTemplateInput) {
    const tpl = {
      id: ulid(),
      userId,
      name: input.name,
      items: input.items,
      currency: input.currency ?? "USD",
      terms: input.terms ?? null,
      notes: input.notes ?? null,
    };
    await templateRepository.create(tpl);
    return tpl;
  },

  async update(id: string, userId: string, input: UpdateTemplateInput) {
    await templateRepository.update(id, userId, input);
    return templateRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    await templateRepository.delete(id, userId);
  },
};
