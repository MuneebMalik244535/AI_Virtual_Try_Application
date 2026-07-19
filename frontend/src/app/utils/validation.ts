import { UserPreferences } from '../context/preferences-context'

export function validatePreferences(p: Partial<UserPreferences>) {
  const errors: Record<string, string> = {}
  if (p.budget !== undefined && (typeof p.budget !== 'number' || p.budget < 0)) errors.budget = 'Budget must be a positive number'
  if (p.height !== undefined && (typeof p.height !== 'number' || p.height < 0)) errors.height = 'Height must be a positive number'
  if (p.colors !== undefined && !Array.isArray(p.colors)) errors.colors = 'Colors must be an array'
  // add simple checks for required strings
  if (p.gender !== undefined && typeof p.gender !== 'string') errors.gender = 'Gender must be a string'
  return { valid: Object.keys(errors).length === 0, errors }
}
