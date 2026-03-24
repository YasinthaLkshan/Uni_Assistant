import { useEffect, useRef, useState } from "react";

import PrimaryButton from "./PrimaryButton";

const MODULE_CODE_MAP = {
  IP: "Introduction to Programming",
  ICS: "Introduction to Computer Systems",
  MC: "Mathematics for Computing",
  CS: "Communication Skills",
  OOP: "Object Oriented Programming",
  DSA: "Data Structures and Algorithms",
  CN: "Computer Networks",
  SE: "Software Engineering",
};

const renderMessageTextWithTooltips = (text) => {
  const parts = text.split(/(\s+)/);
  return parts.map((part, index) => {
    const code = part.replace(/[^A-Za-z0-9]/g, "");
    const fullName = MODULE_CODE_MAP[code];

    if (!fullName) {
      return <span key={index}>{part}</span>;
    }

    return (
      <span
        key={index}
        className="chat-module-code"
        title={fullName}
      >
        {part}
      </span>
    );
  });
};

const ChatWindow = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hello! I can help you with your GPA calculation or module details. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen]);

  const generateReply = (text) => {
    const lowered = text.toLowerCase();

    if (lowered.includes("gpa")) {
      return "To calculate GPA, enter your modules, credits, and grades in the GPA Calculator page. I can guide you on how to interpret the number and what it means for your progress.";
    }

    if (lowered.includes("module") || lowered.includes("subject")) {
      return "Hover over a module code (like IP or OOP) in your module list or in this chat and I will show you the full module name.";
    }

    return "I am a simple assistant right now. Ask me about GPA, modules, or where to find things in Uni Assistant, and I will try to guide you.";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      const reply = generateReply(trimmed);
      const botMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: reply,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 320);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="chat-overlay"
      aria-label="Uni Assistant AI chat overlay"
    >
      <div
        className="chat-window"
        role="dialog"
        aria-modal="true"
        aria-label="Uni Assistant AI chat window"
      >
        <header className="chat-window-header">
          <div>
            <h3 className="chat-window-title">Uni Assistant Chat</h3>
            <p className="chat-window-subtitle">Ask quick questions about GPA, modules, or your timetable.</p>
          </div>
          <button
            type="button"
            className="icon-btn chat-window-close-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            ×
          </button>
        </header>

        <div className="chat-window-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-window-message chat-window-message-${message.from}`}
            >
              <p className="chat-window-message-text">
                {renderMessageTextWithTooltips(message.text)}
              </p>
            </div>
          ))}
          {isThinking && (
            <p className="chat-window-thinking">AI is thinking…</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-window-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            className="text-input chat-window-input"
            placeholder="Type your question here…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <PrimaryButton type="submit" disabled={!input.trim() || isThinking}>
            Send
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
