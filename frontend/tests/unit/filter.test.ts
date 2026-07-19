import { describe, it, expect } from 'vitest'
import { filterProducts } from '../../src/app/utils/filter'
import { products } from '../../src/app/data/products'

describe('filterProducts', () => {
  it('filters by category correctly', () => {
    const res = filterProducts(products, { category: 'hoodies' })
    // compute expected manually
    const expected = products.filter(p => p.category.toLowerCase().replace('-', '') === 'hoodies')
    expect(res.length).toBe(expected.length)
  })

  it('respects price range', () => {
    const res = filterProducts(products, { priceRange: [0, 60] })
    expect(res.every(p => p.price <= 60)).toBe(true)
  })
})
