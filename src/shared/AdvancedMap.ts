export default class AdvancedMap<K, V> extends Map<K, V> {
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries)
  }

  public has(
    search: ((key: K, value: V, self?: this) => boolean) | K,
  ): boolean {
    if (typeof search === 'function') {
      search = search as (key: K, value: V, self?: this) => boolean
      for (const [k, v] of this) {
        if (search(k, v, this)) {
          return true
        }
      }
      return false
    }
    return super.has(search)
  }

  public find(
    search: ((key: K, value: V, self: this) => boolean) | K,
  ): { key: K; value: V } | undefined {
    if (typeof search === 'function') {
      search = search as (key: K, value: V, self: this) => boolean
      for (const [k, v] of this) {
        if (search(k as K, v as V, this)) {
          return {
            key: k,
            value: v,
          }
        }
      }
      return undefined
    }
    const value = super.get(search)
    if (value === undefined) {
      return undefined
    }
    return {
      key: search,
      value,
    }
  }

  public filter(
    search: ((key: K, value: V, self: this) => boolean) | K,
  ): AdvancedMap<K, V> {
    if (typeof search === 'function') {
      search = search as (key: K, value: V, self: this) => boolean
      const results: AdvancedMap<K, V> = new AdvancedMap<K, V>()
      for (const [k, v] of this) {
        if (search(k as K, v as V, this)) {
          results.set(k, v)
        }
      }
      return results
    }
    const value = super.get(search)
    if (value === undefined) {
      return new AdvancedMap<K, V>()
    }
    return new AdvancedMap<K, V>([[search, value]])
  }

  public some(
    search: ((key: K, value: V, self: this) => boolean) | K,
  ): boolean {
    if (typeof search === 'function') {
      search = search as (key: K, value: V, self: this) => boolean
      for (const [k, v] of this) {
        if (search(k as K, v as V, this)) {
          return true
        }
      }
      return false
    }
    return super.has(search)
  }

  public every(
    search: ((key: K, value: V, self: this) => boolean) | K,
  ): boolean {
    if (typeof search === 'function') {
      search = search as (key: K, value: V, self: this) => boolean
      for (const [k, v] of this) {
        if (!search(k as K, v as V, this)) {
          return false
        }
      }
      return true
    }
    return super.has(search)
  }

  public min(
    search: (key: K, value: V, self: this) => number,
  ): { key: K; value: V } | undefined {
    search = search as (key: K, value: V, self: this) => number
    let min: { key: K; value: V } | undefined = undefined
    let minVal: number | undefined = undefined
    for (const [k, v] of this) {
      const val = search(k as K, v as V, this)
      if (minVal === undefined || val < minVal) {
        min = {
          key: k,
          value: v,
        }
        minVal = val
      }
    }
    return min
  }

  public max(
    search: (key: K, value: V, self: this) => number,
  ): { key: K; value: V } | undefined {
    search = search as (key: K, value: V, self: this) => number
    let max: { key: K; value: V } | undefined = undefined
    let maxVal: number | undefined = undefined
    for (const [k, v] of this) {
      const val = search(k as K, v as V, this)
      if (maxVal === undefined || val > maxVal) {
        max = {
          key: k,
          value: v,
        }
        maxVal = val
      }
    }
    return max
  }
}
