/**
 * Export utilities for transcript and JSON data
 */

export interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
  timestamp: Date;
  metadata?: string;
  structuredData?: any;
}

/**
 * Export chat transcript as plain text
 */
export function exportTranscript(messages: Message[]): void {
  const lines: string[] = [
    "Interview Studio - Transcript",
    "=".repeat(50),
    `Generated: ${new Date().toLocaleString()}`,
    "",
  ];

  messages.forEach((msg) => {
    const time = msg.timestamp.toLocaleTimeString();
    const role = msg.role === "agent" ? "Interviewer" : "Candidate";

    lines.push(`[${time}] ${role}:`);
    lines.push(msg.text);

    if (msg.metadata) {
      lines.push(`  (${msg.metadata})`);
    }

    lines.push("");
  });

  const content = lines.join("\n");
  downloadFile(content, "interview-transcript.txt", "text/plain");
}

/**
 * Export structured evaluation data as JSON
 */
export function exportJSON(messages: Message[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    sessionData: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp.toISOString(),
      metadata: msg.metadata,
      structuredData: msg.structuredData,
    })),
  };

  const content = JSON.stringify(data, null, 2);
  downloadFile(content, "interview-evaluation.json", "application/json");
}

/**
 * Helper to trigger file download
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
