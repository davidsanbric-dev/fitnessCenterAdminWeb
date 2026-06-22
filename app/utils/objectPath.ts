/**
 * Walk a dotted path (e.g. "member.full_name") over a nested object, returning
 * the value at the leaf or `undefined` if any segment is missing. Shared by the
 * table cells and the CRUD engine so row-field access stays consistent.
 */
export const getByPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }

    return undefined
  }, source)
