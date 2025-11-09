# Interview Studio - Demo Script

This script walks through the key features of Interview Studio for demonstration purposes.

## Setup (Before Demo)

1. Ensure `.env.local` is configured with valid API keys
2. Start the development server: `npm run dev`
3. Open browser to `http://localhost:3000`
4. Test microphone access beforehand
5. Have a quiet environment for voice demo

---

## Demo Flow (10-15 minutes)

### 1. Introduction (1 min)

**Say**: "Welcome to Interview Studio, an AI-powered mock interview platform that helps you practice interviews using voice or text. It's built with Next.js, integrates with Lyzr AI for intelligent interview questions, and uses OpenAI for speech recognition and text-to-speech."

**Show**:

- Point out the clean, modern UI
- Highlight the dark theme with teal accents
- Show the top navigation with app name and profile

---

### 2. Starting an Interview (1 min)

**Do**:

1. Click the **"Launch Mock"** button in the top-right
2. Confirm the dialog
3. Wait for the AI interviewer's welcome message

**Say**: "The AI interviewer greets us and asks for an introduction. Notice the message appears on the left with a 'Question' badge, and if auto-play is enabled, it speaks the question aloud."

**Show**:

- The agent message bubble
- The metadata badge
- The audio player (if visible)
- The session timer starting

---

### 3. Voice Mode Demo (4 min)

**Say**: "Let's respond using voice mode, which is the default. This mode records your answer, transcribes it using OpenAI Whisper, and sends it to the AI."

**Do**:

1. Ensure **"Voice"** mode is selected
2. Click the large **Record** button
3. Speak for 15-20 seconds:
   > "Hi, I'm Suyash. I'm a software engineer with 5 years of experience in full-stack development. I've worked extensively with React, Node.js, and cloud technologies. I'm passionate about building user-friendly applications and solving complex problems."
4. Click **Stop**
5. Wait for transcription

**Show**:

- The waveform animating with your voice
- The recording timer counting up
- The transcription process (loading indicator)
- The transcribed text appearing in the review box

**Say**: "The transcription appears here. If the confidence is low, we'd see a warning banner and could edit the text before sending. Since it looks good, let's send it."

**Do**: 6. Click **Send**

**Show**:

- Your message appearing on the right (teal border)
- The "Interviewer is thinking" animation
- The agent's response appearing
- TTS audio playing automatically

**Say**: "The AI responds with a follow-up question. Notice it can also provide structured feedback, which we can view by clicking the 'Show Evaluation Data' toggle."

**Do**: 7. Click **"Show Evaluation Data"** on the agent's message 8. Show the JSON structure

---

### 4. Text Mode Demo (2 min)

**Say**: "We can also switch to text mode for typing responses. This is useful if you don't have a microphone or prefer typing."

**Do**:

1. Click the **"Text"** mode toggle
2. Type a response in the text area:
   > "My greatest strength is problem-solving. I enjoy breaking down complex challenges into manageable parts and finding efficient solutions."
3. Click **Send**

**Show**:

- The text input area
- The send button
- The message flow (same as voice mode)
- The agent's response

---

### 5. Quick Prompts (1 min)

**Say**: "For convenience, we have quick prompts for common interview questions."

**Do**:

1. Scroll down in the right panel
2. Click one of the quick prompts (e.g., "Describe a challenge you faced")

**Show**:

- The prompt sending immediately
- The agent responding to the prompt

---

### 6. Settings (2 min)

**Say**: "Let's customize the experience through settings."

**Do**:

1. Click the **Settings** icon (⚙️) in the header
2. Change the **TTS Voice** to "Nova" or "Echo"
3. Adjust the **Playback Speed** slider to 1.5x
4. Show the **Microphone Device** selector (if multiple available)
5. Toggle **Auto-play Agent Responses** off, then back on
6. Click **Close**

**Show**:

- Each setting option
- The smooth UI transitions

**Say**: "These settings persist throughout the session. The next agent response will use the new voice and speed."

---

### 7. Export Features (1 min)

**Say**: "After the interview, you can export your session data."

**Do**:

1. Scroll down in the right panel
2. Click **"Export Transcript"**
3. Show the downloaded TXT file (open it briefly)
4. Click **"Download JSON"**
5. Show the downloaded JSON file (open it briefly)

**Show**:

- The transcript format (timestamped messages)
- The JSON structure (with evaluation data)

**Say**: "The transcript is great for reviewing your answers, and the JSON contains structured feedback from the AI that can be analyzed programmatically."

---

### 8. Session Management (1 min)

**Say**: "We can see the session timer at the top of the chat, showing elapsed time out of 30 minutes. If we want to start fresh, we can restart the session."

**Do**:

1. Point out the **Timer** at the top-right of the chat column
2. Click **"Restart Session"**
3. Confirm the dialog
4. Show the empty state

**Show**:

- The timer
- The restart confirmation
- The cleared chat

---

### 9. Error Handling & Edge Cases (1 min)

**Say**: "The app handles various edge cases gracefully."

**Mention** (or demonstrate if time):

- **Microphone denied**: Automatically falls back to text mode
- **TTS failure**: Shows text-only with an error toast
- **Low confidence transcription**: Banner appears, allowing you to edit
- **Rate limiting**: Prevents abuse with clear error messages
- **90-second recording limit**: Auto-stops with a notification

**Show** (if demonstrating):

- A toast notification (trigger by clicking Launch Mock again)

---

### 10. Responsive Design (1 min)

**Say**: "The app is fully responsive and works on all devices."

**Do**:

1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Switch between desktop, tablet, and mobile views

**Show**:

- Desktop: Two-column layout
- Tablet: Adjusted layout
- Mobile: Single-column, stacked layout

---

### 11. Closing (1 min)

**Say**: "Interview Studio combines modern web technologies with AI to create an effective interview practice tool. Key highlights:"

**Recap**:

- ✅ Voice and text modes
- ✅ Real-time transcription
- ✅ Natural TTS responses
- ✅ Structured feedback
- ✅ Customizable settings
- ✅ Export capabilities
- ✅ Responsive and accessible
- ✅ Rate-limited and secure

**Say**: "The app is ready for deployment on Vercel or any Node.js hosting platform. All API keys are server-side only, and the code is well-documented for easy maintenance."

---

## Q&A Preparation

### Common Questions

**Q: How does the AI generate questions?**  
A: The Lyzr Agent is configured with interview context and uses advanced language models to generate contextual questions and provide feedback based on your responses.

**Q: Can I use my own interview questions?**  
A: Yes, you can customize the Lyzr Agent configuration or use the quick prompts feature to inject specific questions.

**Q: What happens if I lose internet connection?**  
A: The app will show error toasts for failed API calls. You can retry once the connection is restored. Messages are stored in React state (not persisted across refreshes).

**Q: How accurate is the transcription?**  
A: OpenAI Whisper is highly accurate for clear speech in quiet environments. The app flags low-confidence transcriptions for review.

**Q: Can I save my session history?**  
A: Currently, sessions are ephemeral (in-memory). You can export transcripts and JSON at any time. Persistent storage could be added with a database.

**Q: Is this production-ready?**  
A: Yes, with proper API keys and environment configuration. Consider adding authentication, database persistence, and analytics for a full production deployment.

---

## Tips for a Smooth Demo

1. **Test beforehand**: Run through the demo at least once before presenting
2. **Stable internet**: Ensure good connectivity for API calls
3. **Quiet environment**: Background noise affects transcription quality
4. **Prepare fallbacks**: Have text mode ready if voice fails
5. **Time management**: Adjust the script based on available time
6. **Engage audience**: Ask if they want to see specific features
7. **Show code**: If technical audience, briefly show a component or API route

---

**Good luck with your demo! 🚀**
