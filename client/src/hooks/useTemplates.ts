import { useApp } from "../context/AppContext";
import { templatesApi } from "../api/templates.api";
import type { AppTemplate } from "../types";

export function useTemplates() {
  const { templates } = useApp();
  return { templates };
}

export function useTemplateMutations() {
  const { setTemplates, showToast, refreshTemplates } = useApp();

  async function addTemplate(data: Omit<AppTemplate, "id">) {
    const tpl = await templatesApi.create(data);
    setTemplates((p) => [...p, tpl]);
    return tpl;
  }

  async function updateTemplate(
    id: string,
    data: Partial<Omit<AppTemplate, "id">>
  ) {
    const updated = await templatesApi.update(id, data);
    setTemplates((p) => p.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function deleteTemplate(id: string) {
    await templatesApi.delete(id);
    setTemplates((p) => p.filter((t) => t.id !== id));
  }

  return {
    addTemplate,
    updateTemplate,
    deleteTemplate,
    showToast,
    refreshTemplates,
  };
}
