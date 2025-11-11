"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "@/context/SessionContext";
import Chat from "@/components/Chat";
import Controls from "@/components/Controls";
import Timer from "@/components/Timer";
import SettingsDialog from "@/components/SettingsDialog";
import Toast from "@/components/Toast";

function InterviewStudioContent() {
  const {
    elapsedTime,
    sessionId,
    addMessage,
    showToast,
    startInterview,
    setIsGeneratingTTS,
  } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLaunchMock = async () => {
    if (confirm("Start a new mock interview session?")) {
      // Start the interview (timer starts here)
      startInterview();

      // Show loading state
      setIsGeneratingTTS(true);

      const welcomeText =
        "Hi Suyash, I'm Siva — thanks for joining. Here's how this will work: I'll ask you 6-8 focused questions relevant to the Product Manager role at Lyzr. After each answer, I'll give you brief, actionable feedback, a competency score, and a suggestion for improvement or a quick follow-up. We'll then move on to the next question. Let's get started. First, drawing from your experience as an Engineering Lead and co-founder, can you walk me through a recent product decision where you had to balance competing customer needs with technical feasibility? Please explain the specific trade-offs you made and how you prioritized what to build.";

      // Generate TTS for welcome message
      let audioUrl: string | undefined;
      try {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: welcomeText,
            voice: "onyx",
            speed: 1.0,
          }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          audioUrl = URL.createObjectURL(audioBlob);
        }
      } catch (error) {
        console.error("TTS generation failed:", error);
      }

      setIsGeneratingTTS(false);

      addMessage({
        role: "agent",
        text: welcomeText,
        metadata: "Question",
        audioUrl,
      });
      showToast("Mock interview started!", "success");
    }
  };

  return (
    <div className="min-h-screen text-text-primary flex flex-col">
      {/* Top Navigation */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-accent rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent">
                Interview Studio
              </h1>
              <p className="text-xs text-text-secondary">
                AI-Powered Mock Interviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-sm font-medium text-text-primary">
                Suyash
              </span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 hover:bg-background/50 rounded-xl transition-all hover:scale-105"
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5 text-text-secondary hover:text-accent transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <button
              onClick={handleLaunchMock}
              className="px-5 py-2.5 gradient-accent text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-accent/50 active:scale-95"
            >
              Launch Mock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        {/* Left Column - Chat */}
        <div className="flex-1 lg:w-[60%] gradient-card rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden backdrop-blur-sm h-[70vh]">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-background/30 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Transcript
            </h2>
            <Timer elapsedSeconds={elapsedTime} maxSeconds={1800} />
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="lg:w-[40%] gradient-card rounded-3xl shadow-2xl border border-border/50 overflow-y-auto backdrop-blur-sm h-[70vh]">
          <Controls />
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-card/80 border-t border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-text-secondary flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Mock Interview
            </span>
            <span>•</span>
            <span suppressHydrationWarning>
              Session: {sessionId.slice(0, 8)}...
            </span>
          </p>
          <p className="text-xs text-text-secondary/70 mt-1">
            Powered by <span className="text-accent font-medium">Lyzr AI</span>{" "}
            & <span className="text-accent font-medium">OpenAI</span>
          </p>
        </div>
      </footer>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <InterviewStudioContent />
    </SessionProvider>
  );
}
