"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "@/context/SessionContext";
import { getAudioInputDevices } from "@/lib/audio";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
}: SettingsDialogProps) {
  const { settings, updateSettings } = useSession();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = async () => {
    const audioDevices = await getAudioInputDevices();
    setDevices(audioDevices);
  };

  const voices = [
    { value: "alloy", label: "Alloy (Neutral)" },
    { value: "echo", label: "Echo (Male)" },
    { value: "fable", label: "Fable (British)" },
    { value: "onyx", label: "Onyx (Deep)" },
    { value: "nova", label: "Nova (Female)" },
    { value: "shimmer", label: "Shimmer (Soft)" },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-text-primary mb-4"
                >
                  Settings
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      TTS Voice
                    </label>
                    <select
                      value={settings.voice}
                      onChange={(e) =>
                        updateSettings({ voice: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background text-text-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {voices.map((voice) => (
                        <option key={voice.value} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Playback Speed */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Playback Speed: {settings.playbackSpeed.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.playbackSpeed}
                      onChange={(e) =>
                        updateSettings({
                          playbackSpeed: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-accent"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  {/* Microphone Device */}
                  {devices.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Microphone Device
                      </label>
                      <select
                        value={settings.micDeviceId || ""}
                        onChange={(e) =>
                          updateSettings({
                            micDeviceId: e.target.value || undefined,
                          })
                        }
                        className="w-full px-3 py-2 bg-background text-text-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Default</option>
                        {devices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label ||
                              `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Auto-play TTS */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-secondary">
                      Auto-play Agent Responses
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({ autoPlayTTS: !settings.autoPlayTTS })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoPlayTTS ? "bg-accent" : "bg-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoPlayTTS
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 px-4 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
