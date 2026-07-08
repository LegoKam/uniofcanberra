class TtlCache {
  constructor(ttlMs = 120000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expires: Date.now() + this.ttlMs,
    });
  }
}

module.exports = {
  TtlCache,
};
