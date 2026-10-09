/**
 * Renders the conversation history plus a "generating" indicator
 * while a simulated assistant reply is in flight.
 */
function MessageList({ messages, isGenerating }) {
  return (
    <div className="message-list" aria-label="Conversation">
      {messages.map((message) => (
        <div key={message.id} className={`message message-${message.role}`}>
          {message.text}
        </div>
      ))}
      {isGenerating && (
        <div data-testid="generating-indicator">Generating…</div>
      )}
    </div>
  )
}

export default MessageList
