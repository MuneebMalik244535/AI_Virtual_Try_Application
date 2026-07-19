import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { stylistApi } from '../../src/app/services/stylistApi'

describe('stylistApi.getRecommendations', () => {
  beforeEach(() => { vi.restoreAllMocks() })
  afterEach(() => { vi.restoreAllMocks() })

  it('returns parsed JSON when fetch is successful', async () => {
    const mockResp = { recommendations: [{ id: 1 }], success: true }
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockResp) })) as any)

    const res = await stylistApi.getRecommendations({ budget: 100, occasion: '', season: '', colors: [], height: 170, body_type: '', skin_tone: '', style_preference: '', gender: '' })
    expect(res).toEqual(mockResp)
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })) as any)
    await expect(stylistApi.getRecommendations({ budget: 100, occasion: '', season: '', colors: [], height: 170, body_type: '', skin_tone: '', style_preference: '', gender: '' })).rejects.toBeDefined()
  })
})
