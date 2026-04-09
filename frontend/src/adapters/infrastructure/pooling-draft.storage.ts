const STORAGE_KEY = 'fueleu.pooling-draft.v1';

export interface PoolingMemberDraft {
  readonly id: string;
  readonly shipId: string;
  readonly complianceBalance: string;
}

export interface PoolingDraft {
  readonly year: number;
  readonly name: string;
  readonly members: readonly PoolingMemberDraft[];
}

function isMemberRow(x: unknown): x is PoolingMemberDraft {
  if (!x || typeof x !== 'object') {
    return false;
  }
  const o = x as Record<string, unknown>;
  return (
    typeof o['id'] === 'string' &&
    typeof o['shipId'] === 'string' &&
    typeof o['complianceBalance'] === 'string'
  );
}

export function loadPoolingDraft(): PoolingDraft | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== 'object') {
      return null;
    }
    const o = p as Record<string, unknown>;
    if (typeof o['year'] !== 'number' || !Number.isInteger(o['year'])) {
      return null;
    }
    if (typeof o['name'] !== 'string') {
      return null;
    }
    if (!Array.isArray(o['members']) || o['members'].length === 0) {
      return null;
    }
    const members: PoolingMemberDraft[] = [];
    for (const m of o['members']) {
      if (!isMemberRow(m)) {
        return null;
      }
      members.push(m);
    }
    return { year: o['year'], name: o['name'], members };
  } catch {
    return null;
  }
}

export function savePoolingDraft(draft: PoolingDraft): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        year: draft.year,
        name: draft.name,
        members: draft.members,
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function maxPoolingRowSuffix(members: readonly { readonly id: string }[]): number {
  let max = 0;
  for (const m of members) {
    const match = /^m-(\d+)$/.exec(m.id);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return max;
}
