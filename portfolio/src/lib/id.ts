/** Short, URL-safe unique id for DB primary keys (not a security token). */
export function newId(): string {
  return crypto.randomUUID();
}
