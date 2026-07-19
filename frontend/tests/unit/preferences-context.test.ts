import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { PreferencesProvider, usePreferences } from '../../src/app/context/preferences-context'

function TestComponent() {
  const { preferences, updatePreferences } = usePreferences()
  return (
    <div>
      <span data-testid="budget">{preferences.budget}</span>
      <button onClick={() => updatePreferences({ budget: 123 })}>Set</button>
    </div>
  )
}

describe('PreferencesContext', () => {
  it('provides default preferences and allows updates', async () => {
    render(<PreferencesProvider><TestComponent /></PreferencesProvider>)
    expect(screen.getByTestId('budget').textContent).toBe('500')
  })
})
