"use client";

interface TimerProps {
  elapsedSeconds: number;
  maxSeconds?: number;
}

export default function Timer({
  elapsedSeconds,
  maxSeconds = 1800,
}: TimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const percentage = (elapsedSeconds / maxSeconds) * 100;
  const isWarning = percentage > 80;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`text-sm font-mono ${
          isWarning ? "text-red-400" : "text-text-secondary"
        }`}
      >
        {formatTime(elapsedSeconds)} / {formatTime(maxSeconds)}
      </div>
      <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isWarning ? "bg-red-500" : "bg-accent"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
