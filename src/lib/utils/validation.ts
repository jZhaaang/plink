export function normalize(str: string) {
  return str.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(normalize(email));
}

export function isValidUsername(username: string) {
  return /^[a-z0-9_]{4,12}$/.test(normalize(username));
}
