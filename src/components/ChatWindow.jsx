import { useState } from 'react'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

let nextId = 1

/**
 * Minimal chat window: envia un mensaje al usuario, simulates an assistant
 * reply after a short delay, and supports starting a new conversation.
 */
function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { id: nextId++, role: 'user', text }])
    setIsGenerating(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId++, role: 'assistant', text: `You said: "${text}"` },
      ])
      setIsGenerating(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    setIsGenerating(false)
  }

  return (
    <div className="chat-window">
      <header>
        <h1>Mini Chat</h1>
        <button type="button" onClick={handleNewChat}>
          New Chat
        </button>
      </header>
      <MessageList messages={messages} isGenerating={isGenerating} />
      <MessageInput onSend={handleSend} disabled={isGenerating} />
    </div>
  )
}

export default ChatWindow
