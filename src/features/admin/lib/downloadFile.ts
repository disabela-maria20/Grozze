'use client';

/** Triggers a browser download of `data` as a file called `name`. */
export function downloadFile(name: string, data: string, type: string) {
  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
