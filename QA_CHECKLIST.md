# QA Testing Checklist

## Pre-Testing Setup

- [ ] Environment variables configured in `.env.local`
- [ ] All dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Browser console open for error monitoring

## Voice Mode Testing

### Recording

- [ ] Click "Voice" mode toggle
- [ ] Browser requests microphone permission
- [ ] Grant microphone access
- [ ] Click record button - recording starts
- [ ] Waveform animates with audio level
- [ ] Recording timer counts up (0:00 → 0:XX)
- [ ] Speak for 10 seconds
- [ ] Click stop button - recording stops
- [ ] Transcription process begins (loading indicator)

### Transcription

- [ ] Transcription completes successfully
- [ ] Text appears in review box
- [ ] Text is accurate (or editable if low confidence)
- [ ] Low confidence banner shows if needed
- [ ] Can edit transcribed text before sending
- [ ] Click "Send" button

### Agent Response

- [ ] User message appears in chat (right side, teal border)
- [ ] "Interviewer is thinking" indicator shows
- [ ] Agent response appears (left side, card background)
- [ ] Response has metadata badge (Question/Feedback)
- [ ] TTS audio auto-plays (if enabled)
- [ ] Can toggle JSON evaluation data
- [ ] JSON displays correctly when expanded

### Edge Cases

- [ ] Recording for 90 seconds triggers auto-stop
- [ ] Toast notification shows "Maximum recording time reached"
- [ ] Microphone permission denied → fallback to text mode
- [ ] Large audio file (>15MB) rejected with error
- [ ] Network error during transcription shows error toast

## Text Mode Testing

### Basic Flow

- [ ] Click "Text" mode toggle
- [ ] Text area appears
- [ ] Type a response (e.g., "I have 5 years of experience...")
- [ ] Click "Send" button
- [ ] User message appears in chat
- [ ] Agent responds with text
- [ ] TTS plays (if enabled in settings)

### Edge Cases

- [ ] Empty text cannot be sent (button disabled)
- [ ] Very long text (1000+ chars) sends successfully
- [ ] Special characters and emojis handled correctly
- [ ] Network error shows error toast

## Quick Prompts

- [ ] Click "Tell me about yourself"
- [ ] Prompt sends immediately
- [ ] Agent responds appropriately
- [ ] Try all 5 quick prompts
- [ ] Prompts disabled while agent is thinking

## Settings

### Opening Settings

- [ ] Click settings icon (⚙️) in header
- [ ] Settings dialog opens
- [ ] All settings visible

### Voice Selection

- [ ] Change voice to "Echo"
- [ ] Close settings
- [ ] Send a message
- [ ] TTS uses new voice
- [ ] Try other voices (Alloy, Fable, Onyx, Nova, Shimmer)

### Playback Speed

- [ ] Set speed to 1.5x
- [ ] TTS plays faster
- [ ] Set speed to 0.5x
- [ ] TTS plays slower
- [ ] Slider works smoothly

### Microphone Device

- [ ] Multiple devices listed (if available)
- [ ] Select different device
- [ ] Recording uses selected device

### Auto-play Toggle

- [ ] Disable auto-play
- [ ] Agent response doesn't auto-play
- [ ] Enable auto-play
- [ ] Agent response auto-plays

## UI/UX Testing

### Session Timer

- [ ] Timer starts at 0:00
- [ ] Timer counts up every second
- [ ] Timer shows elapsed / 30:00
- [ ] Progress bar fills proportionally
- [ ] Timer turns red after 24:00 (80%)

### Chat UI

- [ ] Messages scroll smoothly
- [ ] User messages aligned right
- [ ] Agent messages aligned left
- [ ] Timestamps show correctly
- [ ] Metadata badges display
- [ ] JSON toggle works
- [ ] Empty state shows helpful message

### Export Functions

- [ ] Click "Export Transcript"
- [ ] TXT file downloads
- [ ] File contains all messages with timestamps
- [ ] Click "Download JSON"
- [ ] JSON file downloads
- [ ] JSON contains structured data

### Restart Session

- [ ] Click "Restart Session"
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] All messages cleared
- [ ] Chat shows empty state
- [ ] Timer resets

### Launch Mock

- [ ] Click "Launch Mock" button
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Agent sends welcome message
- [ ] Success toast appears

## Responsive Design

### Desktop (1920x1080)

- [ ] Two-column layout displays correctly
- [ ] Chat takes ~60% width
- [ ] Controls take ~40% width
- [ ] All elements visible

### Tablet (768x1024)

- [ ] Layout switches to single column (or stacked)
- [ ] Chat and controls both accessible
- [ ] No horizontal scrolling
- [ ] Touch interactions work

### Mobile (375x667)

- [ ] Single column layout
- [ ] Controls accessible
- [ ] Chat scrollable
- [ ] Buttons large enough for touch
- [ ] Text readable without zoom

## Accessibility

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter key submits forms
- [ ] Escape closes dialogs

### Screen Reader

- [ ] ARIA labels present on buttons
- [ ] Role attributes correct
- [ ] Alt text on images/icons
- [ ] Form labels associated

### Color Contrast

- [ ] Text readable on backgrounds
- [ ] Accent color (#22c1c3) has sufficient contrast
- [ ] Focus indicators visible

## Performance

### Loading States

- [ ] Transcribing shows loading indicator
- [ ] Agent thinking shows typing animation
- [ ] TTS generating shows status
- [ ] Buttons disabled during loading

### Rate Limiting

- [ ] Send 11 transcription requests quickly
- [ ] 11th request returns 429 error
- [ ] Error toast shows rate limit message
- [ ] Wait 1 minute, requests work again

### Memory

- [ ] Long session (50+ messages) doesn't slow down
- [ ] Audio URLs cleaned up (no memory leaks)
- [ ] Smooth scrolling in chat

## Error Handling

### API Errors

- [ ] Invalid API key → error toast
- [ ] Network timeout → error toast
- [ ] 500 server error → error toast
- [ ] Rate limit → specific error message

### Fallbacks

- [ ] TTS fails → text-only response shown
- [ ] Transcription fails → can retry or switch to text
- [ ] Mic unavailable → auto-switch to text mode

## Cross-Browser Testing

### Chrome

- [ ] All features work
- [ ] Audio recording works
- [ ] TTS playback works

### Firefox

- [ ] All features work
- [ ] Audio recording works
- [ ] TTS playback works

### Safari

- [ ] All features work
- [ ] Audio recording works (may need HTTPS)
- [ ] TTS playback works

### Edge

- [ ] All features work
- [ ] Audio recording works
- [ ] TTS playback works

## Security

- [ ] API keys not visible in browser DevTools
- [ ] API keys not in client-side code
- [ ] Rate limiting active on all endpoints
- [ ] File size limits enforced
- [ ] No CORS errors in console

## Final Checks

- [ ] No console errors
- [ ] No console warnings (or only expected ones)
- [ ] All images/icons load
- [ ] Fonts load correctly (Inter)
- [ ] Smooth animations
- [ ] Professional appearance
- [ ] Ready for demo

---

## Notes

Record any issues found during testing:

1.
2.
3.

---

**Tester**: ******\_\_\_******  
**Date**: ******\_\_\_******  
**Browser**: ******\_\_\_******  
**OS**: ******\_\_\_******
