export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(normalizeEmail(email));
}
