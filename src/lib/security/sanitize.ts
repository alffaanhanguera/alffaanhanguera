export function sanitizeText(input: string) {
  return input
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
