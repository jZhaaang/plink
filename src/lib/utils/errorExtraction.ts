const FRIENDLY: Array<
  [test: (msg: string, code: string) => boolean, message: string]
> = [
  // Auth
  [
    (msg) =>
      msg.includes('invalid login') || msg.includes('invalid credentials'),
    'Incorrect email or password.',
  ],
  [
    (msg) =>
      msg.includes('already registered') ||
      msg.includes('already been registered'),
    'This email is already registered. Try signing in instead.',
  ],
  [
    (msg) => msg.includes('email not confirmed'),
    'Please check your email and confirm your account.',
  ],

  // Duplicate / conflict
  [
    (msg, code) => msg.includes('duplicate') || code === '23505',
    'This username already exists. Please try a different name.',
  ],

  // Session
  [
    (msg) =>
      msg.includes('jwt') ||
      msg.includes('token') ||
      msg.includes('session expired'),
    'Your session expired. Please sign in again.',
  ],

  // Network
  [
    (msg) =>
      msg.includes('network') ||
      msg.includes('fetch failed') ||
      msg.includes('unable to resolve host'),
    'Check your internet connection and try again.',
  ],

  // Rate limiting
  [
    (msg) => msg.includes('rate limit') || msg.includes('too many'),
    'Too many attempts. Please wait a moment.',
  ],

  // Not found
  [
    (msg) => msg.includes('no rows') || msg.includes('not found'),
    'This item no longer exists or was deleted.',
  ],

  // Storage
  [
    (msg) => msg.includes('payload too large') || msg.includes('file size'),
    'This file is too large to upload.',
  ],

  // Permissions
  [
    (msg) =>
      msg.includes('permission') ||
      msg.includes('not authorized') ||
      msg.includes('policy'),
    "You don't have permission to do this.",
  ],
];

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: string }).message);
  }
  if (typeof err === 'string') return err;
  return '';
}

function extractCode(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return String((err as { code: string }).code);
  }
  return '';
}

export function getErrorMessage(err: unknown): string {
  const msg = extractMessage(err).toLowerCase();
  const code = extractCode(err);

  for (const [test, friendly] of FRIENDLY) {
    if (test(msg, code)) return friendly;
  }

  return 'Something went wrong. Please try again.';
}
