/** Canonical ship id used in seed data for route-linked compliance rows. */
export function shipIdForRouteCode(routeCode: string): string {
  return `SHIP-${routeCode}`;
}
