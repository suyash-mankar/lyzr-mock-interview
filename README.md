# Interview Studio 🎙️

AI-powered mock interview practice application with voice and text interaction capabilities. Built with Next.js, TypeScript, and Tailwind CSS.

![Interview Studio](public/logo.svg)

## Features

- 🎤 **Voice Mode**: Record your answers with real-time audio visualization
- ⌨️ **Text Mode**: Type your responses for text-based practice
- 🤖 **AI Interviewer**: Powered by Lyzr Agent for intelligent interview questions
- 🗣️ **Text-to-Speech**: Natural voice responses using OpenAI TTS
- 📊 **Structured Feedback**: JSON evaluation data for each response
- 📝 **Export Options**: Download transcripts (TXT) and evaluation data (JSON)
- ⚙️ **Customizable Settings**: Choose voice, playback speed, and microphone device
- 🎨 **Modern UI**: Soft-dark theme with teal accent colors
- ♿ **Accessible**: Keyboard navigation, ARIA labels, and semantic HTML
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **APIs**:
  - Lyzr Agent API (interview logic)
  - OpenAI Whisper (speech-to-text)
  - OpenAI TTS (text-to-speech)

## Prerequisites

- Node.js 18+ and npm
- API keys for:
  - Lyzr (Agent API)
  - OpenAI (for Whisper and TTS)

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd lyzr-mock-interview
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:

   ```env
   # Lyzr API Configuration
   LYZR_API_KEY=your_lyzr_api_key_here
   LYZR_AGENT_ID=your_agent_id_here

   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: App Name
   NEXT_PUBLIC_APP_NAME=Interview Studio
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Starting an Interview

1. Click the **"Launch Mock"** button in the top-right corner
2. The AI interviewer will greet you and ask you to introduce yourself

### Voice Mode

1. Select **"Voice"** mode from the toggle
2. Click the large **Record** button (microphone icon)
3. Speak your answer (max 90 seconds)
4. Click **Stop** when finished
5. Review the transcription (edit if needed)
6. Click **Send** to submit your answer
7. The AI will respond with audio and text

### Text Mode

1. Select **"Text"** mode from the toggle
2. Type your response in the text area
3. Click **Send** to submit
4. The AI will respond (with optional TTS)

### Quick Prompts

Use the pre-defined prompts in the right panel to quickly ask common interview questions.

### Settings

Click the **Settings** icon (⚙️) to customize:

- TTS voice (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Playback speed (0.5x - 2.0x)
- Microphone device
- Auto-play toggle for agent responses

### Exporting Data

- **Export Transcript**: Download a plain text file of the conversation
- **Download JSON**: Export structured evaluation data

### Restarting

Click **"Restart Session"** to clear all messages and start fresh.

## API Routes

The application includes three server-side API routes:

### POST /api/transcribe

- Accepts audio file (multipart/form-data)
- Calls OpenAI Whisper for transcription
- Returns: `{ text, confidence }`
- Rate limit: 10 requests/minute per IP

### POST /api/lyzr

- Body: `{ user_id, session_id, message }`
- Calls Lyzr Agent inference endpoint
- Returns: `{ agent_text, structured_json }`
- Rate limit: 20 requests/minute per IP

### POST /api/tts

- Body: `{ text, voice?, speed? }`
- Calls OpenAI Text-to-Speech API
- Returns: audio/mpeg stream
- Rate limit: 15 requests/minute per IP

## Project Structure

```
lyzr-mock-interview/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # Whisper STT proxy
│   │   ├── lyzr/route.ts          # Lyzr Agent proxy
│   │   └── tts/route.ts           # OpenAI TTS proxy
│   ├── layout.tsx                 # Root layout with Inter font
│   ├── page.tsx                   # Main application page
│   └── globals.css                # Global styles and theme
├── components/
│   ├── Chat.tsx                   # Chat UI with bubbles
│   ├── Controls.tsx               # Voice/text controls
│   ├── Timer.tsx                  # Session timer
│   ├── Waveform.tsx               # Audio visualization
│   ├── SettingsDialog.tsx         # Settings modal
│   └── Toast.tsx                  # Notification toasts
├── context/
│   └── SessionContext.tsx         # Global session state
├── lib/
│   ├── audio.ts                   # Audio recording utilities
│   ├── export.ts                  # Export functions
│   └── rateLimiter.ts             # Rate limiting logic
├── public/
│   ├── logo.svg                   # App logo
│   └── icons/                     # UI icons
├── .env.example                   # Environment template
├── README.md                      # This file
├── QA_CHECKLIST.md                # Testing checklist
└── public/demo-script.md          # Demo walkthrough
```

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `LYZR_API_KEY`
   - `LYZR_AGENT_ID`
   - `OPENAI_API_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any Node.js hosting platform that supports Next.js:

- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:

1. Set all required environment variables
2. Use Node.js 18+
3. Build command: `npm run build`
4. Start command: `npm start`

## Security Notes

- All API keys are stored server-side only
- Rate limiting is applied to all API endpoints
- File size limits enforced (15MB for audio uploads)
- CORS headers configured for security

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Note**: Microphone access requires HTTPS in production.

## Troubleshooting

### Microphone Not Working

- Check browser permissions
- Ensure HTTPS in production
- Try a different browser
- Fall back to Text mode

### TTS Not Playing

- Check browser audio permissions
- Verify OpenAI API key is valid
- Check rate limits
- Audio will fallback to text-only

### Transcription Errors

- Speak clearly and avoid background noise
- Check file size (max 15MB)
- Verify OpenAI API key
- Review and edit low-confidence transcriptions

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:

- Open a GitHub issue
- Contact: suyashmankar@gmail.com

## Acknowledgments

- Powered by [Lyzr AI](https://lyzr.ai)
- Speech services by [OpenAI](https://openai.com)
- Built with [Next.js](https://nextjs.org)

---

Made with ❤️ by Suyash
