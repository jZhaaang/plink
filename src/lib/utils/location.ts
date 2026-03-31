import { LinkLocationRow } from '../models';

export function primaryLocationLabel(
  locations: LinkLocationRow[],
): string | null {
  if (!locations?.length) return null;
  const rest = locations.length - 1;
  return rest > 0 ? `${locations[0].name} + ${rest} more` : locations[0].name;
}
