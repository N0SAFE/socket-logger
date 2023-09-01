export default class AdvancedSet<V> extends Set<V> {
  constructor(entries?: readonly V[] | null) {
    super(entries)
  }

  public has(search: ((value: V, self?: this) => boolean) | V): boolean {
    if (typeof search === 'function') {
      search = search as (value: V, self?: this) => boolean
      for (const v of this) {
        if (search(v, this)) {
          return true
        }
      }
      return false
    }
    return super.has(search)
  }

  public find(search: (value: V, self: this) => boolean): V | undefined {
    search = search as (value: V, self: this) => boolean
    for (const v of this) {
      if (search(v as V, this)) {
        return v
      }
    }
    return undefined
  }

  public filter(search: (value: V, self: this) => boolean): AdvancedSet<V> {
    search = search as (value: V, self: this) => boolean
    const results: AdvancedSet<V> = new AdvancedSet<V>()
    for (const v of this) {
      if (search(v as V, this)) {
        results.add(v)
      }
    }
    return results
  }

  public map<T>(search: (value: V, self: this) => T): AdvancedSet<T> {
    search = search as (value: V, self: this) => T
    const results: AdvancedSet<T> = new AdvancedSet<T>()
    for (const v of this) {
      results.add(search(v as V, this))
    }
    return results
  }

  public min(search: (value: V, self: this) => number): V | undefined {
    search = search as (value: V, self: this) => number
    let min: V | undefined
    let minNumber = Infinity
    for (const v of this) {
      const number = search(v as V, this)
      if (number < minNumber) {
        min = v
        minNumber = number
      }
    }
    return min
  }

  public max(search: (value: V, self: this) => number): V | undefined {
    search = search as (value: V, self: this) => number
    let max: V | undefined
    let maxNumber = -Infinity
    for (const v of this) {
      const number = search(v as V, this)
      if (number > maxNumber) {
        max = v
        maxNumber = number
      }
    }
    return max
  }
}
