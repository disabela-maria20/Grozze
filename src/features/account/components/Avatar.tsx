'use client';

import { useAppStore } from '@/shared/store/useAppStore';
import { Icon } from '@/shared/ui/Icon';

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
  const dim =
    size === 'large'
      ? 'w-[60px] h-[60px] text-[25px]'
      : 'w-[30px] h-[30px] text-sm';
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-extrabold bg-lime text-[#091006] shrink-0 ${dim}`}
      aria-label={`Avatar de ${profile.name}`}
    >
      {char}
    </span>
  );
}
