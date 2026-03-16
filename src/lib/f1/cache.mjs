const cacheStore = new Map();

export async function withCache(key, ttlMs, loader) {
  if (ttlMs <= 0) {
    return loader();
  }

  const now = Date.now();
  const cachedEntry = cacheStore.get(key);

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.value;
  }

  const valuePromise = Promise.resolve()
    .then(loader)
    .then((value) => {
      cacheStore.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .catch((error) => {
      cacheStore.delete(key);
      throw error;
    });

  cacheStore.set(key, {
    value: valuePromise,
    expiresAt: now + ttlMs,
  });

  return valuePromise;
}

export function clearF1Cache() {
  cacheStore.clear();
}
