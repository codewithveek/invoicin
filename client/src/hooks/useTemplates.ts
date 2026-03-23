import { useApp } from "../context/AppContext";
import type { AppTemplate } from "../types";

export function useTemplates() {
  const { templates } = useApp();
  return { templates };
}

export function useTemplateMutations() {
  const { setTemplates, showToast } = useApp();

  function addTemplate(template: AppTemplate) {
    setTemplates((p) => [...p, template]);
  }

  function deleteTemplate(id: string) {
    setTemplates((p) => p.filter((t) => t.id !== id));
  }

  return { addTemplate, deleteTemplate, showToast };
}
