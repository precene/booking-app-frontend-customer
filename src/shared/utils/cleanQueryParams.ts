import type { Query } from "#/shared/types";

export function cleanQueryParams(query: Query) {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );
}
