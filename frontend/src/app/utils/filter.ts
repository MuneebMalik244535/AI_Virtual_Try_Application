import { Product } from '../data/products'

export interface FilterOptions {
  sale?: boolean | null
  category?: string
  sizes?: string[]
  colors?: string[]
  q?: string
  priceRange?: [number, number]
  sortBy?: string
}

export function filterProducts(products: Product[], options: FilterOptions = {}) {
  const { sale, category, sizes = [], colors = [], q = '', priceRange = [0, 500], sortBy = 'featured' } = options

  let filtered = [...products]
  if (sale) filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price)
  if (category) filtered = filtered.filter((p) => p.category.toLowerCase().replace('-', '') === category.toLowerCase().replace('-', ''))
  if (sizes.length > 0) filtered = filtered.filter((p) => p.sizes?.some((s) => sizes.includes(s)))
  if (colors.length > 0) filtered = filtered.filter((p) => p.colors?.some((c) => colors.some((sc) => c.toLowerCase().includes(sc.toLowerCase()))))
  if (q) {
    const lowQ = q.toLowerCase()
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(lowQ) || p.description?.toLowerCase().includes(lowQ) || p.category.toLowerCase().includes(lowQ))
  }
  filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

  switch (sortBy) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break
    case 'newest': filtered.reverse(); break
  }

  return filtered
}
