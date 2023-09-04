import AdvancedMap from '../../shared/AdvancedMap'
import { expect } from 'chai'

describe('AdvancedMap', () => {
  it('should create an empty map', () => {
    const map = new AdvancedMap()
    expect(map.size).to.equal(0)
  })

  it('should create a map with initial entries', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    expect(map.size).to.equal(2)
    expect(map.get('key1')).to.equal('value1')
    expect(map.get('key2')).to.equal('value2')
  })

  it('should find an entry using a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = map.find(
      (key, value) => key === 'key2' && value === 'value2',
    )
    expect(result).to.deep.equal({ key: 'key2', value: 'value2' })
  })

  it('should not find an entry using a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = map.find(
      (key, value) => key === 'key3' && value === 'value3',
    )
    expect(result).to.be.undefined
  })

  it('should filter entries using a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ])
    const result = map.filter(
      (key, value) => key === 'key2' || value === 'value3',
    )
    expect(result.size).to.equal(2)
    expect(result.get('key2')).to.equal('value2')
    expect(result.get('key3')).to.equal('value3')
  })

  it('should return an empty map when filtering with no matches', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = map.filter(
      (key, value) => key === 'key3' && value === 'value3',
    )
    expect(result.size).to.equal(0)
  })

  it('should return true when some entries match a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ])
    const result = map.some(
      (key, value) => key === 'key2' || value === 'value3',
    )
    expect(result).to.be.true
  })

  it('should return false when no entries match a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = map.some(
      (key, value) => key === 'key3' && value === 'value3',
    )
    expect(result).to.be.false
  })

  it('should return true when every entry matches a function', () => {
    const map = new AdvancedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = map.every(
      (key, value) => typeof key === 'string' && typeof value === 'string',
    )
    expect(result).to.be.true
  })

  it('should return false when not every entry matches a function', () => {
    const map = new AdvancedMap<string, string | number>([
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 3],
    ])
    const result = map.every(
      (key, value) => typeof key === 'string' && typeof value === 'string',
    )
    expect(result).to.be.false
  })
})
