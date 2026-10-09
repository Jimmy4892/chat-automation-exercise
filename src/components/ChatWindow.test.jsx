import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ChatWindow from './ChatWindow'

/**
 * Each test is traced back to an ID from the test case spreadsheet
 * (ChatGPT_Basic_Chat_Test_Cases_TypeCategory.xlsx) to keep the
 * automation grounded in the documented coverage.
 */

function getInput() {
  return screen.getByLabelText('Message input')
}

function getSendButton() {
  return screen.getByRole('button', { name: 'Send' })
}

describe('ChatWindow', () => {
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

  it('TC-003: Shift+Enter inserts a line break without sending', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'line one{Shift>}{Enter}{/Shift}line two')

    expect(
      screen.queryByText(/line one/, { selector: '.message' }),
    ).not.toBeInTheDocument()
    expect(getInput()).toHaveValue('line one\nline two')
  })

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

  it('TC-007: the user message appears once and in the correct order', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'unique message{Enter}')

    expect(screen.getAllByText('unique message')).toHaveLength(1)
    await screen.findByText('You said: "unique message"')
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

  it('TC-016: New Chat creates a clean conversation', async () => {
    const user = userEvent.setup()
    render(<ChatWindow />)

    await user.type(getInput(), 'temporary message{Enter}')
    expect(screen.getByText('temporary message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New Chat' }))

    expect(screen.queryByText('temporary message')).not.toBeInTheDocument()
    expect(getInput()).toHaveValue('')
  })
})
