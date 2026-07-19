import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { stylistApi } from '../../src/app/services/stylistApi'

const server = setupServer(
  rest.post('http://localhost:3000/api/stylist/recommendations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ recommendations: [{ id: 1, name: 'Test' }], success: true }))
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('Recommendation API integration', () => {
  it('fetches recommendations from backend', async () => {
    const res = await stylistApi.getRecommendations({ budget: 100, occasion: '', season: '', colors: [], height: 170, body_type: '', skin_tone: '', style_preference: '', gender: '' })
    expect(res.success).toBe(true)
    expect(Array.isArray(res.recommendations)).toBe(true)
  })
})
