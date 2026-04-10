/** One canonical ship id per route code (Compare / compliance lookups). */
export function shipIdForRouteCode(routeCode: string): string {
  return `SHIP-${routeCode}`;
}
