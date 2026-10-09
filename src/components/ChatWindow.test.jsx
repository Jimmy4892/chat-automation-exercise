import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ChatWindow from './ChatWindow'

/**
 * Each test is traced back to an ID from the test case spreadsheet
 * (ChatGPT_Basic_Chat_Test_Cases_TypeCategory.xlsx) to keep the
 * automation grounded in the documented coverage.
 *
 * The "Release Test Plan" block below only includes spreadsheet cases
 * marked "In Release Test Plan? = Yes" that this minimal app can
 * actually exercise (no accounts, no backend, no real network calls).
 * Cases requiring features out of scope for this exercise (conversation
 * history list, Stop-generation button, network-failure simulation,
 * multi-account isolation) are intentionally not implemented here — see
 * README.md for the full breakdown. Tests are ordered by Risk, then
 * Priority, matching the spreadsheet's own sort.
 */

function getInput() {
  return screen.getByLabelText('Message input')
}

function getSendButton() {
  return screen.getByRole('button', { name: 'Send' })
}

function getNewChatButton() {
  return screen.getByRole('button', { name: 'New Chat' })
}

describe('ChatWindow — Release Test Plan', () => {
  // --- Risk: High / Priority: Critical ---

  it('TC-001: sends a valid message using the Send button', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'Hello there')
    await user.click(getSendButton())

    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(getInput()).toHaveValue('')
  })

  it('TC-002: submits a valid message using Enter', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'Sent with enter{Enter}')

    expect(screen.getByText('Sent with enter')).toBeInTheDocument()
  })

  it('TC-007: the user message appears once and in the correct order', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'unique message{Enter}')

    expect(screen.getAllByText('unique message')).toHaveLength(1)
    await screen.findByText('You said: "unique message"')
  })

  it('TC-008: the assistant response begins rendering after submission', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'are you there?{Enter}')

    await expect(
      screen.findByText('You said: "are you there?"'),
    ).resolves.toBeInTheDocument()
  })

  it('TC-009: the response does not duplicate or corrupt content once complete', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'ping{Enter}')
    await screen.findByText('You said: "ping"')

    expect(screen.getAllByText('You said: "ping"')).toHaveLength(1)
  })

  it('TC-013: rapid repeated Send actions do not create duplicate messages', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'fast click')
    const sendButton = getSendButton()
    // Fire two clicks back-to-back, before React can disable the button.
    await user.click(sendButton)
    await user.click(sendButton)

    expect(screen.getAllByText('fast click')).toHaveLength(1)
  })

  it('TC-014: a second prompt can be sent after the first response completes', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'first message{Enter}')
    await screen.findByText('You said: "first message"')

    await user.type(getInput(), 'second message{Enter}')
    await screen.findByText('You said: "second message"')

    expect(screen.getByText('first message')).toBeInTheDocument()
    expect(screen.getByText('second message')).toBeInTheDocument()
  })

  it('TC-015: sending a follow-up preserves the existing conversation', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'first message{Enter}')
    await screen.findByText('You said: "first message"')

    await user.type(getInput(), 'second message{Enter}')

    expect(screen.getByText('first message')).toBeInTheDocument()
    expect(screen.getByText('You said: "first message"')).toBeInTheDocument()
  })

  it('TC-016: New Chat creates a clean conversation', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'temporary message{Enter}')
    expect(screen.getByText('temporary message')).toBeInTheDocument()

    await user.click(getNewChatButton())

    expect(screen.queryByText('temporary message')).not.toBeInTheDocument()
    expect(getInput()).toHaveValue('')
  })

  it('TC-036: HTML/script content in a message is rendered safely, not executed', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    const payload = '<script>window.__xss = true</script>'
    await user.type(getInput(), `${payload}{Enter}`)

    expect(screen.getByText(payload)).toBeInTheDocument()
    expect(document.querySelector('script')).not.toBeInTheDocument()
    expect(window.__xss).toBeUndefined()
  })

  // --- Risk: Medium / Priority: High ---

  it('TC-004: Send is disabled when the input is empty', () => {
    render(<ChatWindow />)

    expect(getSendButton()).toBeDisabled()
  })

  it('TC-005: whitespace-only input cannot be submitted', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), '   ')

    expect(getSendButton()).toBeDisabled()
  })

  it('TC-006: the input remains editable before submission', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'draft text')

    expect(getInput()).toHaveValue('draft text')
    expect(getInput()).toBeEnabled()
  })

  it('TC-010: a generating indicator is visible while waiting for a response', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'ping{Enter}')

    expect(screen.getByTestId('generating-indicator')).toBeInTheDocument()
    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('generating-indicator'),
    )
    await waitFor(() =>
      expect(screen.getByText('You said: "ping"')).toBeInTheDocument(),
    )
  })

  it('TC-045: composer, Send and New Chat are all reachable by keyboard', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.tab()
    expect(getNewChatButton()).toHaveFocus()

    await user.tab()
    expect(getInput()).toHaveFocus()

    await user.keyboard('keyboard-only message')
    await user.tab()
    expect(getSendButton()).toHaveFocus()
  })
})

describe('ChatWindow — additional coverage (not in Release Test Plan)', () => {
  it('TC-003: Shift+Enter inserts a line break without sending', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'line one{Shift>}{Enter}{/Shift}line two')

    expect(
      screen.queryByText(/line one/, { selector: '.message' }),
    ).not.toBeInTheDocument()
    expect(getInput()).toHaveValue('line one\nline two')
  })
})
