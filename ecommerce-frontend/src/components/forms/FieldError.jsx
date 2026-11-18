export default function FieldError({ errors, name, className = '' }) {
  const message = errors?.[name]?.[0];

  if (!message) {
    return null;
  }

  return (
    <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${className}`} role="alert">
      {message}
    </p>
  );
}
