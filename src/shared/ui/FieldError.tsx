'use client';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <small role="alert" className="text-xs text-danger">
      {message}
    </small>
  );
}
