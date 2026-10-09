import { useState } from 'react'

/**
 * Composer: textarea + Send button.
 * - Enter sends the message.
 * - Shift+Enter inserts a line break instead of sending.
 * - Send is disabled while the input is empty or whitespace-only.
 */
function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')

  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="message-input">
      <textarea
        aria-label="Message input"
        placeholder="Send a message..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="button" onClick={handleSend} disabled={!canSend}>
        Send
      </button>
    </div>
  )
}

export default MessageInput
