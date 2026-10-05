'use client';

import { useAppStore } from '@/shared/store';
import { Icon } from '@/shared/ui';

const AVATAR_CHARS: Record<string, string> = { star: '★', moon: '☾', sun: '☀' };

export function Avatar({ size = '' }: { size?: '' | 'large' }) {
  const profile = useAppStore((s) => s.profile());
  if (!profile) return <Icon name="user" />;
  let char = String(profile.name || profile.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
  if (profile.avatar && profile.avatar !== 'initial')
    char = AVATAR_CHARS[profile.avatar] || char;
  const sizeClass =
    size === 'large'
      ? 'w-[60px] h-[60px] text-[25px]'
      : 'w-[30px] h-[30px] text-sm';
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-extrabold bg-lime text-[#091006] shrink-0 ${sizeClass}`}
      aria-label={`Avatar de ${profile.name}`}
    >
      {char}
    </span>
  );
}
