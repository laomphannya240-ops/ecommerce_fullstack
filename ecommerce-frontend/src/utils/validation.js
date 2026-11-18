/**
 * Normalize the `errors` object returned by Laravel's 422 responses into a
 * stable shape: { field: [message, ...] }.
 */
export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;

  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  );
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.message || fallback;
}

/**
 * Remove one field from an error map without mutating the original object.
 */
export function clearFieldError(errors, field) {
  if (!errors[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];

  return next;
}
