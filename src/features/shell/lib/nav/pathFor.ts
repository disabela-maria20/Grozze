export function pathFor(root: string): string {
  return root === 'inicio' ? '/' : `/${root}`;
}
