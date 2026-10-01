import { DISTRIBUTORS } from './DISTRIBUTORS';
import { normalize } from './normalize';

/** API distributor names that don't start with a registered name or slug. */
const ALIASES: Record<string, string> = {
  '20th century fox': 'disney',
  'columbia pictures': 'sony',
};

/**
 * Maps the free-text distributor of the API ("Universal Pictures Brasil",
 * "Warner Bros") to a registered distributor slug, or to a slug of the name
 * itself when the distributor has no page.
 */
export function distributorSlug(name: string | null | undefined): string {
  const n = normalize(name).trim();
  if (!n) return '';
  if (ALIASES[n]) return ALIASES[n];
  const d = DISTRIBUTORS.find(
    (x) =>
      n.startsWith(normalize(x.name)) || n === x.slug || n.startsWith(x.slug + ' ')
  );
  return d?.slug ?? n.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
