export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatBrazilianPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidBrazilianPhone(value: string) {
  const digits = onlyDigits(value);

  return digits.length === 10 || digits.length === 11;
}

export function getBrazilianPhoneError(value: string) {
  if (!value.trim()) return "Informe seu WhatsApp ou telefone.";

  return isValidBrazilianPhone(value)
    ? null
    : "Informe um WhatsApp ou telefone com DDD.";
}
