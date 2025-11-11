"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/context/SessionContext";
import { AudioRecorder, AudioLevelMonitor } from "@/lib/audio";
import { exportTranscript, exportJSON } from "@/lib/export";
import Waveform from "./Waveform";

export default function Controls() {
  const {
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
    addMessage,
    messages,
    sessionId,
    userId,
    settings,
    showToast,
    transcriptInput,
    setTranscriptInput,
    lowConfidence,
    setLowConfidence,
    isInterviewActive,
    startInterview,
    endInterview,
  } = useSession();

  const [audioLevel, setAudioLevel] = useState(0);
  const [textInput, setTextInput] = useState("");

  const recorderRef = useRef<AudioRecorder | null>(null);
  const levelMonitorRef = useRef<AudioLevelMonitor | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      if (levelMonitorRef.current) {
        levelMonitorRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const recorder = new AudioRecorder({ maxDurationMs: 300000 });
      recorderRef.current = recorder;

      const stream = await recorder.start(
        handleRecordingStop,
        (error) => {
          showToast(`Recording error: ${error.message}`, "error");
          setIsRecording(false);
        },
        () => {
          showToast("Maximum recording time (5 minutes) reached", "info");
        }
      );

      // Start level monitoring
      const monitor = new AudioLevelMonitor();
      monitor.start(stream);
      levelMonitorRef.current = monitor;

      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time and audio level
      recordingIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setRecordingTime(
            Math.floor(recorderRef.current.getElapsedTime() / 1000)
          );
        }
        if (levelMonitorRef.current) {
          setAudioLevel(levelMonitorRef.current.getLevel());
        }
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (
        message.includes("Permission denied") ||
        message.includes("NotAllowedError")
      ) {
        showToast(
          "Microphone access denied. Please enable it in settings.",
          "error"
        );
        setMode("text"); // Fallback to text mode
      } else {
        showToast(`Failed to start recording: ${message}`, "error");
      }
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (levelMonitorRef.current) {
      levelMonitorRef.current.stop();
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  const handleRecordingStop = async (blob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Transcription failed");
      }

      const data = await response.json();
      setTranscriptInput(data.text);

      if (data.confidence && data.confidence < 0.7) {
        setLowConfidence(true);
        showToast(
          "Low confidence transcription. Please review before sending.",
          "info"
        );
      } else {
        setLowConfidence(false);
        // Auto-send if confidence is good
        await sendMessage(data.text);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast(`Transcription failed: ${message}`, "error");
    } finally {
      setIsTranscribing(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addMessage({
      role: "user",
      text: text.trim(),
    });

    // Clear inputs
    setTextInput("");
    setTranscriptInput("");
    setLowConfidence(false);

    // Call Lyzr API
    setIsAgentThinking(true);

    try {
      const response = await fetch("/api/lyzr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message: text.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Agent request failed");
      }

      const data = await response.json();

      // Generate TTS if enabled
      let audioUrl: string | undefined;
      if (settings.autoPlayTTS && data.agent_text) {
        setIsGeneratingTTS(true);
        try {
          const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: data.agent_text,
              voice: settings.voice,
              speed: settings.playbackSpeed,
            }),
          });

          if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.blob();
            audioUrl = URL.createObjectURL(audioBlob);
          } else {
            showToast("TTS generation failed. Showing text only.", "error");
          }
        } catch (error) {
          showToast("TTS generation failed. Showing text only.", "error");
        } finally {
          setIsGeneratingTTS(false);
        }
      }

      // Add agent message
      addMessage({
        role: "agent",
        text: data.agent_text,
        metadata: data.structured_json ? "Feedback" : "Question",
        structuredData: data.structured_json,
        audioUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast(`Agent error: ${message}`, "error");
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isAgentThinking) {
      sendMessage(textInput);
    }
  };

  const handleTranscriptSubmit = () => {
    if (transcriptInput.trim()) {
      sendMessage(transcriptInput);
    }
  };

  const handleEndSession = () => {
    if (
      confirm(
        "Are you sure you want to end this interview session? The transcript will remain available for export."
      )
    ) {
      if (isRecording) {
        stopRecording();
      }
      setRecordingTime(0);
      setAudioLevel(0);
      endInterview();
      setTextInput("");
      setTranscriptInput("");
      setLowConfidence(false);
      showToast("Interview ended. You can review and export your transcript.", "info");
    }
  };

  const handleRestartSession = () => {
    if (
      confirm(
        "Start a new interview session? This will clear the current transcript."
      )
    ) {
      startInterview();
      showToast("New interview session started!", "success");
    }
  };

  const isLoading = isTranscribing || isAgentThinking || isGeneratingTTS;
  const controlsDisabled = !isInterviewActive;

  return (
    <div className="flex flex-col h-full p-6 space-y-5">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1.5 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50">
        <button
          onClick={() => setMode("voice")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            mode === "voice"
              ? "gradient-accent text-white shadow-lg shadow-accent/30"
              : "text-text-secondary hover:text-text-primary hover:bg-background/50"
          } ${controlsDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isLoading || controlsDisabled}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
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
            Voice
          </span>
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            mode === "text"
              ? "gradient-accent text-white shadow-lg shadow-accent/30"
              : "text-text-secondary hover:text-text-primary hover:bg-background/50"
          } ${controlsDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isLoading || controlsDisabled}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Type
          </span>
        </button>
      </div>

      {/* Voice Mode Controls */}
      {mode === "voice" && (
        <div className="space-y-5">
          <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
            <Waveform audioLevel={audioLevel} isActive={isRecording && !controlsDisabled} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={controlsDisabled || (isLoading && !isRecording)}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50 hover:scale-105 active:scale-95"
                  : controlsDisabled
                  ? "bg-border/40 text-text-secondary cursor-not-allowed"
                  : "gradient-accent shadow-2xl shadow-accent/50 pulse-glow hover:scale-105 active:scale-95"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
              aria-label={
                controlsDisabled
                  ? "Voice controls disabled until interview starts"
                  : isRecording
                  ? "Stop recording"
                  : "Start recording"
              }
            >
              {isRecording ? (
                <div className="w-7 h-7 bg-white rounded-md" />
              ) : (
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>

            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-400 font-mono font-semibold">
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, "0")} / 5:00
                </span>
              </div>
            )}

            {isTranscribing && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 backdrop-blur-sm rounded-xl border border-accent/30">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-accent font-medium">Transcribing...</span>
              </div>
            )}
          </div>

          {/* Transcription Review */}
          {transcriptInput && (
            <div className="p-4 bg-background/30 backdrop-blur-sm rounded-2xl border border-border/30 space-y-3">
              {lowConfidence && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/30">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Low confidence - please review
                </div>
              )}
              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                className="w-full p-3 bg-background text-text-primary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent border border-border/50"
                rows={3}
                placeholder="Transcribed text..."
              />
              <button
                onClick={handleTranscriptSubmit}
                disabled={isAgentThinking}
                className="w-full py-3 gradient-accent text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/50 active:scale-95 disabled:opacity-50"
              >
                Send Response
              </button>
            </div>
          )}
          {controlsDisabled && (
            <p className="text-xs text-text-secondary text-center">
              Launch the mock interview to enable voice responses.
            </p>
          )}
        </div>
      )}

      {/* Text Mode Controls */}
      {mode === "text" && (
        <form onSubmit={handleTextSubmit} className="space-y-3 flex-1 flex flex-col">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your response..."
            className="w-full p-4 bg-background text-text-primary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent flex-1 min-h-[200px]"
            disabled={controlsDisabled || isLoading}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || controlsDisabled || isLoading}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {controlsDisabled
              ? "Launch Mock to Enable Text"
              : isAgentThinking
              ? "Siva is thinking..."
              : "Send Response"}
          </button>
        </form>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-border mt-auto">
        {isInterviewActive ? (
          <>
            <button
              onClick={() => exportTranscript(messages)}
              disabled={messages.length === 0}
              className="w-full py-2.5 px-4 bg-background hover:bg-background/80 text-text-primary text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-border"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Transcript
            </button>
            <button
              onClick={handleEndSession}
              className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-500/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              End Interview
            </button>
          </>
        ) : messages.length > 0 ? (
          <>
            <div className="mb-3 p-3 bg-accent/10 rounded-xl border border-accent/30">
              <p className="text-xs text-accent text-center font-medium">
                Interview Completed
              </p>
            </div>
            <button
              onClick={() => exportTranscript(messages)}
              className="w-full py-2.5 px-4 bg-background hover:bg-background/80 text-text-primary text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-border"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Transcript
            </button>
            <button
              onClick={handleRestartSession}
              className="w-full py-2.5 px-4 gradient-accent text-white text-sm rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/50 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Start New Interview
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
