import { ulid } from "ulid";
import { clientRepository } from "../repositories/client.repository";

export interface CreateClientInput {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export const clientService = {
  async list(userId: string) {
    return clientRepository.findAllByUser(userId);
  },

  async create(userId: string, input: CreateClientInput) {
    const client = {
      id: ulid(),
      userId,
      name: input.name,
      email: input.email,
      address: input.address ?? null,
      phone: input.phone ?? null,
      company: input.company ?? null,
      notes: input.notes ?? null,
    };
    await clientRepository.create(client);
    return client;
  },

  async remove(id: string, userId: string) {
    await clientRepository.delete(id, userId);
  },
};
