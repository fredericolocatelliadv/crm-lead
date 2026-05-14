export const fallbackLegalAreaOptions = [
  "Direito Previdenciário",
  "Direito Bancário",
  "Direito Trabalhista",
  "Direito Civil",
  "Direito de Família",
  "Direito do Consumidor",
  "Direito Empresarial",
] as const;

export type LegalAreaOption = {
  description: string | null;
  id: string;
  name: string;
  position: number;
};

function sortLegalAreas(areas: LegalAreaOption[]) {
  return [...areas].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

export function mergeLegalAreaOptions(
  areas: LegalAreaOption[],
  currentValue?: string | null,
) {
  const byName = new Map(areas.map((area) => [area.name, area]));

  if (currentValue && !byName.has(currentValue)) {
    byName.set(currentValue, {
      description: null,
      id: currentValue,
      name: currentValue,
      position: Number.MAX_SAFE_INTEGER,
    });
  }

  return sortLegalAreas(Array.from(byName.values()));
}
