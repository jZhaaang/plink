export function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export function getErrorMessageForUsername(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: string }).code)
      : '';

  if (message.includes('duplicate') || code == '23505') {
    return {
      title: 'Username taken',
      message: 'This username is already in use. Please chooe another.',
    };
  } else {
    return { title: 'Save error', message };
  }
}
