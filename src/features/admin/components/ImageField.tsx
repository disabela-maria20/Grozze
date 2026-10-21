'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/shared/store';
import { Field } from '@/shared/ui';

/** Same limits as the API (it checks again, including the real file type). */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/** "850 KB", "2.4 MB" */
const fileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const ASPECT_CLASS = {
  poster: 'w-[96px] aspect-2/3',
  banner: 'w-[160px] aspect-video',
};

/** Status lines; the defaults fit a movie image over the catalog's. */
const MOVIE_TEXTS = {
  published: 'Imagem personalizada.',
  restore: 'Voltar à imagem original',
  source: 'Imagem original do catálogo.',
  none: 'O catálogo não tem imagem.',
};

/**
 * Image in the CMS (movie poster, news cover...), picked from the computer. The file is only
 * sent (to the API, which stores it in S3) when the editor publishes; until
 * then the preview shows it. Without a file, the published image (or the
 * catalog's) stays.
 */
export function ImageField({
  label,
  shape,
  publishedUrl,
  sourceUrl,
  file,
  error,
  onFileChange,
  onRestoreSource,
  texts = MOVIE_TEXTS,
}: {
  label: string;
  shape: keyof typeof ASPECT_CLASS;
  /** Image published in the CMS ('' = none: the catalog's is used) */
  publishedUrl: string;
  /** The catalog's own image */
  sourceUrl?: string;
  file: File | null;
  error?: string;
  onFileChange: (file: File | null) => void;
  /** Drops the published image, back to the catalog's (applied on publish) */
  onRestoreSource: () => void;
  texts?: typeof MOVIE_TEXTS;
}) {
  const toast = useAppStore((s) => s.toast);
  const filePreview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    },
    [filePreview]
  );
  const preview = filePreview || publishedUrl || sourceUrl;

  let status;
  if (file) {
    status = (
      <>
        Novo arquivo: <strong className="text-app-text">{file.name}</strong> (
        {fileSize(file.size)}), enviado ao publicar.{' '}
        <button
          type="button"
          className="underline hover:text-lime"
          onClick={() => onFileChange(null)}
        >
          Cancelar
        </button>
      </>
    );
  } else if (publishedUrl) {
    status = (
      <>
        {texts.published}{' '}
        <button
          type="button"
          className="underline hover:text-lime"
          onClick={onRestoreSource}
        >
          {texts.restore}
        </button>
      </>
    );
  } else {
    status = sourceUrl ? texts.source : texts.none;
  }

  return (
    <Field label={label} error={error}>
      <div className="flex gap-3.5 items-start">
        <div
          className={`${ASPECT_CLASS[shape]} shrink-0 rounded-xl border border-line bg-[#080e0a] overflow-hidden grid place-items-center text-[10px] text-faint text-center`}
        >
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            'Sem imagem'
          )}
        </div>
        <div className="min-w-0 flex-1 grid gap-2 justify-items-start">
          <label className="min-h-10 px-4 py-2 rounded-full border border-line bg-white/[0.035] inline-flex items-center text-[13px] font-semibold cursor-pointer hover:bg-lime-soft hover:border-lime/40 transition-colors focus-within:outline-2 focus-within:outline-lime">
            {file || publishedUrl ? 'Trocar arquivo' : 'Escolher arquivo'}
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null;
                // Reset so picking the same file again still triggers onChange
                event.target.value = '';
                if (!picked) return;
                if (!ACCEPTED_TYPES.includes(picked.type))
                  toast('Envie uma imagem JPG, PNG ou WebP.');
                else if (picked.size > MAX_BYTES)
                  toast('A imagem passa do limite de 5 MB.');
                else onFileChange(picked);
              }}
            />
          </label>
          <p className="text-xs text-muted m-0 leading-relaxed">{status}</p>
          <p className="text-[11px] text-faint m-0">
            JPG, PNG ou WebP, até 5 MB.
          </p>
        </div>
      </div>
    </Field>
  );
}
