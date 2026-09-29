const PATHS: Record<string, string> = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  user: '<circle cx="12" cy="7.5" r="3.6"/><path d="M4.5 21v-1.5a7.5 7.5 0 0 1 15 0V21"/>',
  heart:
    '<path d="M20.7 4.8c-2.1-2.2-5.8-1.6-8.7 1.5C9.1 3.2 5.4 2.6 3.3 4.8c-2.5 2.6-1.8 6.2.8 8.8L12 21l7.9-7.4c2.6-2.6 3.3-6.2.8-8.8Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="M12 22s7-7.2 7-13a7 7 0 0 0-14 0c0 5.8 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  ticket:
    '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z"/><path d="M15 5v2m0 4v2m0 4v2"/>',
  filter: '<path d="M4 5h16l-6 7v7l-4 2v-9Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  chevron: '<path d="m8 4 8 8-8 8"/>',
};

export function Icon({
  name,
  className = '',
}: {
  name: keyof typeof PATHS | string;
  className?: string;
}) {
  return (
    <svg
      className={`w-[22px] h-[22px] stroke-current stroke-[1.8] fill-none [stroke-linecap:round] [stroke-linejoin:round] shrink-0 ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] || PATHS.arrow }}
    />
  );
}
