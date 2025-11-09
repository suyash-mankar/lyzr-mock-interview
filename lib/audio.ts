/**
 * Audio recording and playback utilities
 */

export interface RecorderConfig {
  maxDurationMs?: number;
  mimeType?: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private maxDuration: number;
  private onStop?: (blob: Blob) => void;
  private onError?: (error: Error) => void;
  private onMaxDuration?: () => void;
  private timeoutId?: NodeJS.Timeout;

  constructor(config: RecorderConfig = {}) {
    this.maxDuration = config.maxDurationMs || 90000; // 90 seconds default
  }

  async start(
    onStop?: (blob: Blob) => void,
    onError?: (error: Error) => void,
    onMaxDuration?: () => void
  ): Promise<MediaStream> {
    this.onStop = onStop;
    this.onError = onError;
    this.onMaxDuration = onMaxDuration;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.onStop?.(blob);
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event: Event) => {
        const error = new Error(`MediaRecorder error: ${event.type}`);
        this.onError?.(error);
        this.cleanup();
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      // Set timeout for max duration
      this.timeoutId = setTimeout(() => {
        if (this.mediaRecorder?.state === "recording") {
          this.onMaxDuration?.();
          this.stop();
        }
      }, this.maxDuration);

      return this.stream;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  getElapsedTime(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return ""; // Browser will use default
  }
}

/**
 * Get audio level from a MediaStream for visualization
 */
export class AudioLevelMonitor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  start(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
  }

  getLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;

    // @ts-ignore - TypeScript strict mode issue with Uint8Array
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average level
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    const average = sum / this.dataArray.length;

    // Normalize to 0-1 range
    return average / 255;
  }

  stop(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Play audio from URL or blob
 */
export function playAudio(
  src: string | Blob,
  onEnded?: () => void,
  onError?: (error: Error) => void
): HTMLAudioElement {
  const audio = new Audio();

  if (src instanceof Blob) {
    audio.src = URL.createObjectURL(src);
  } else {
    audio.src = src;
  }

  audio.onended = () => {
    if (src instanceof Blob) {
      URL.revokeObjectURL(audio.src);
    }
    onEnded?.();
  };

  audio.onerror = () => {
    const error = new Error("Audio playback failed");
    onError?.(error);
  };

  audio.play().catch((error) => {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  return audio;
}

/**
 * Check if microphone is available
 */
export async function checkMicrophoneAvailable(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === "audioinput");
  } catch {
    return false;
  }
}

/**
 * Get list of available audio input devices
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "audioinput");
  } catch {
    return [];
  }
}
