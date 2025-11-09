"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
  timestamp: Date;
  metadata?: string;
  structuredData?: any;
  audioUrl?: string;
}

export interface Settings {
  voice: string;
  playbackSpeed: number;
  micDeviceId?: string;
  autoPlayTTS: boolean;
}

export type Mode = "voice" | "text";

interface SessionContextType {
  // Session
  sessionId: string;
  userId: string;
  isInterviewActive: boolean;
  startInterview: () => void;
  endInterview: () => void;

  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;

  // Mode
  mode: Mode;
  setMode: (mode: Mode) => void;

  // Recording state
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordingTime: number;
  setRecordingTime: (time: number) => void;

  // Loading states
  isTranscribing: boolean;
  setIsTranscribing: (loading: boolean) => void;
  isAgentThinking: boolean;
  setIsAgentThinking: (thinking: boolean) => void;
  isGeneratingTTS: boolean;
  setIsGeneratingTTS: (generating: boolean) => void;

  // Audio playback
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Timer
  sessionStartTime: Date | null;
  elapsedTime: number;

  // Errors/Toasts
  toast: { message: string; type: "info" | "error" | "success" } | null;
  showToast: (message: string, type: "info" | "error" | "success") => void;
  clearToast: () => void;

  // Transcript input (for editing after transcription)
  transcriptInput: string;
  setTranscriptInput: (text: string) => void;
  lowConfidence: boolean;
  setLowConfidence: (low: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Session
  const [sessionId] = useState(() => uuidv4());
  const [userId] = useState("suyashmankar@gmail.com"); // Default user
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Mode
  const [mode, setMode] = useState<Mode>("voice");

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Loading states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

  // Audio
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );

  // Settings
  const [settings, setSettings] = useState<Settings>({
    voice: "onyx", // Male voice for Siva
    playbackSpeed: 1.0,
    autoPlayTTS: true,
  });

  // Timer
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "error" | "success";
  } | null>(null);

  // Transcript input
  const [transcriptInput, setTranscriptInput] = useState("");
  const [lowConfidence, setLowConfidence] = useState(false);

  // Timer effect - only run when interview is active
  useEffect(() => {
    if (!isInterviewActive || !sessionStartTime) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(
        Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isInterviewActive, sessionStartTime]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: uuidv4(),
        timestamp: new Date(),
      },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    setSessionStartTime(new Date());
    setElapsedTime(0);
    setMessages([]); // Clear previous messages when starting fresh
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setSessionStartTime(null);
    setElapsedTime(0);
    // Keep messages intact for review and export
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const showToast = (message: string, type: "info" | "error" | "success") => {
    setToast({ message, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  const value: SessionContextType = {
    sessionId,
    userId,
    isInterviewActive,
    startInterview,
    endInterview,
    messages,
    addMessage,
    clearMessages,
    mode,
    setMode,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    isTranscribing,
    setIsTranscribing,
    isAgentThinking,
    setIsAgentThinking,
    isGeneratingTTS,
    setIsGeneratingTTS,
    currentAudio,
    setCurrentAudio,
    settings,
    updateSettings,
    sessionStartTime,
    elapsedTime,
    toast,
    showToast,
    clearToast,
    transcriptInput,
    setTranscriptInput,
    lowConfidence,
    setLowConfidence,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
