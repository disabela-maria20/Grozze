'use client';

import { useAppStore } from '@/shared/store';
import { Button, Icon } from '@/shared/ui';

/**
 * Invites the user to look beyond their city: a strip when it has few
 * movies with sessions, a message when it has none. Opens the nearby cities
 * dialog (picking one there switches the location).
 */
export function NearbyCitiesCta({
  city,
  count,
  className = '',
}: {
  city: string;
  /** Movies with sessions in the city. */
  count: number;
  className?: string;
}) {
  const openDialog = useAppStore((s) => s.openDialog);
  const none = count === 0;
  return (
    <div
      className={`border border-lime/32 rounded-app px-5.5 py-4.5 flex items-center gap-4.5 bg-gradient-to-r from-lime-soft to-[rgba(200,255,57,.015)] max-sm:flex-col max-sm:items-start max-sm:p-4 max-sm:rounded-2xl ${className}`}
    >
      <span className="bg-lime text-[#081004] w-[42px] h-[42px] rounded-full grid place-items-center shrink-0 max-sm:hidden">
        <Icon name="pin" />
      </span>
      <span className="min-w-0">
        <strong className="text-lg leading-[1.25] block -tracking-[0.02em]">
          {none
            ? `Ainda não há sessões em ${city} 🎬`
            : 'Poucas opções de filmes na sua cidade? 🎬'}
        </strong>
        <small className="block text-[13px] text-muted mt-1">
          {none
            ? 'Explore cidades próximas e encontre filmes com sessões disponíveis.'
            : 'Explore cidades próximas e descubra mais sessões disponíveis!'}
        </small>
      </span>
      <Button
        primary
        small
        className="ml-auto shrink-0 max-sm:ml-0 max-sm:w-full"
        onClick={() => openDialog('nearby-cities')}
      >
        Explorar cidades próximas
      </Button>
    </div>
  );
}
