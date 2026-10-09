import { expect, test } from '@playwright/test'

/**
 * Real-browser end-to-end versions of a few of the same scenarios
 * covered by the unit tests (src/components/ChatWindow.test.jsx).
 * Run these with `npm run test:e2e:ui` to watch them execute visually.
 */

test('TC-001: sends a valid message using the Send button', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Message input').fill('Hello there')
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByText('Hello there')).toBeVisible()
})

test('TC-002: submits a valid message using Enter', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Message input').fill('Sent with enter')
  await page.getByLabel('Message input').press('Enter')

  await expect(page.getByText('Sent with enter')).toBeVisible()
})

test('TC-004: Send is disabled when the input is empty', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled()
})

test('TC-010: a generating indicator is visible while waiting for a reply', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Message input').fill('ping')
  await page.getByLabel('Message input').press('Enter')

  await expect(page.getByTestId('generating-indicator')).toBeVisible()
  await expect(page.getByText('You said: "ping"')).toBeVisible()
})

test('TC-016: New Chat creates a clean conversation', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Message input').fill('temporary message')
  await page.getByLabel('Message input').press('Enter')
  await expect(page.getByText('temporary message')).toBeVisible()

  await page.getByRole('button', { name: 'New Chat' }).click()

  await expect(page.getByText('temporary message')).toHaveCount(0)
})
