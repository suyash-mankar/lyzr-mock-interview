"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, Message } from "@/context/SessionContext";

interface ChatBubbleProps {
  message: Message;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const [showJson, setShowJson] = useState(false);
  const isAgent = message.role === "agent";

  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAgent
            ? "bg-card text-text-primary"
            : "bg-accent/10 text-text-primary border border-accent/30"
        }`}
      >
        <div className="flex items-start gap-2 mb-1">
          <span className="text-xs font-medium text-text-secondary">
            {isAgent ? "Interviewer" : "You"}
          </span>
          {message.metadata && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
              {message.metadata}
            </span>
          )}
          <span className="text-xs text-text-secondary ml-auto">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {message.structuredData && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
              aria-expanded={showJson}
            >
              <svg
                className={`w-3 h-3 transition-transform ${
                  showJson ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {showJson ? "Hide" : "Show"} Evaluation Data
            </button>

            {showJson && (
              <pre className="mt-2 p-3 bg-background rounded-lg text-xs overflow-x-auto">
                <code>{JSON.stringify(message.structuredData, null, 2)}</code>
              </pre>
            )}
          </div>
        )}

        {message.audioUrl && (
          <div className="mt-2">
            <audio
              controls
              src={message.audioUrl}
              className="w-full h-8"
              style={{ maxWidth: "300px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-card rounded-2xl px-5 py-3.5 border border-border/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text-secondary mb-1">
              Siva is thinking
            </span>
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { messages, isAgentThinking, isGeneratingTTS } = useSession();
  const isLoading = isAgentThinking || isGeneratingTTS;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-2 scroll-smooth"
    >
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-text-secondary">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">Start your mock interview</p>
            <p className="text-xs mt-1">
              Click &quot;Launch Mock&quot; to begin
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {isLoading && <TypingIndicator />}
      
      {/* Invisible element at the end for auto-scroll */}
      <div ref={chatEndRef} />
    </div>
  );
}
