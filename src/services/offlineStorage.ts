export interface OfflineSnapshot {
  collections: Record<string, unknown>;
  revisions: Record<string, number>;
  synced: Record<string, string>;
}

export const OFFLINE_STORAGE_KEY = 'lamasat_erp_offline_v1';

export function readOfflineSnapshot(): OfflineSnapshot | null {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as OfflineSnapshot;
    if (!snapshot.collections || !snapshot.revisions || !snapshot.synced) return null;
    return snapshot;
  } catch {
    return null;
  }
}

export function isPendingCollection(snapshot: OfflineSnapshot | null, collection: string): boolean {
  return Boolean(snapshot && Object.hasOwn(snapshot.collections, collection) &&
    JSON.stringify(snapshot.collections[collection]) !== snapshot.synced[collection]);
}

export function writeOfflineSnapshot(snapshot: OfflineSnapshot): void {
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(snapshot));
}
