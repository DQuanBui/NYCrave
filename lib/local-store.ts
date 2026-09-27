/**
 * A tiny localStorage-backed store for useSyncExternalStore: one cached snapshot
 * per raw value, change events within the tab, and the storage event across tabs.
 */
export function createLocalStore<T>(key: string, parse: (raw: unknown) => T, empty: T) {
  const changeEvent = `${key}:change`
  let cachedRaw: string | null = null
  let cached = empty

  function read(): T {
    let raw: string | null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      return empty
    }
    if (raw === cachedRaw) return cached
    cachedRaw = raw
    try {
      cached = raw ? parse(JSON.parse(raw)) : empty
    } catch {
      cached = empty
    }
    return cached
  }

  function write(value: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked (private mode): the change lasts until reload.
    }
    window.dispatchEvent(new Event(changeEvent))
  }

  function subscribe(onChange: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(changeEvent, onChange)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(changeEvent, onChange)
    }
  }

  return { read, write, subscribe, empty }
}
