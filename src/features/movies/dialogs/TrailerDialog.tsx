'use client';

import { movie, videoId } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { Button } from '@/shared/ui';

export function TrailerDialog({ movieId }: { movieId: string }) {
  const content = useAppStore((s) => s.content);
  const closeDialog = useAppStore((s) => s.closeDialog);
  const m = movie(movieId, content);
  if (!m) return null;
  const y = videoId(m.trailer);
  if (!y) {
    return (
      <div>
        <h2 className="text-[28px] m-0 mb-3 pr-10">Trailer</h2>
        <p className="text-sm text-muted mb-5">
          O trailer de {m.t} ainda não está disponível.
        </p>
        <Button onClick={() => closeDialog()}>Voltar ao filme</Button>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-[23px] m-0 mb-3 pr-10">{m.t}</h2>
      <iframe
        className="w-full aspect-video border-0 rounded-[13px] bg-black"
        src={`https://www.youtube-nocookie.com/embed/${y}?autoplay=1&rel=0`}
        title={`Trailer de ${m.t}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <p className="text-xs text-faint mt-2.5">
        Player externo incorporado. A disponibilidade do vídeo depende do
        provedor.
      </p>
    </div>
  );
}
