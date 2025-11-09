# Quick Start Guide 🚀

Get Interview Studio running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd lyzr-mock-interview
npm install
```

## Step 2: Configure API Keys (2 min)

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
LYZR_API_KEY=sk-default-WZA7RCiGVCOJnOktktd8lUZL5DjR5MIX
LYZR_AGENT_ID=6910a2ac13d93e643cb82f82
OPENAI_API_KEY=sk-proj-your-openai-key-here
NEXT_PUBLIC_APP_NAME=Interview Studio
```

**Where to get API keys:**
- **Lyzr**: [studio.lyzr.ai](https://studio.lyzr.ai) → Create Agent → Copy API Key & Agent ID
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create new key

## Step 3: Start Development Server (1 min)

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

## Step 4: Open Browser (30 sec)

Navigate to: **http://localhost:3000**

## Step 5: Test the App (1 min)

### Quick Test Checklist

1. ✅ **Launch Interview**
   - Click "Launch Mock" button
   - Confirm dialog
   - See AI greeting message

2. ✅ **Voice Mode** (if microphone available)
   - Click Record button
   - Speak: "Hi, I'm testing the app"
   - Click Stop
   - See transcription
   - Click Send
   - Hear AI response

3. ✅ **Text Mode** (fallback)
   - Click "Text" mode toggle
   - Type: "Tell me about yourself"
   - Click Send
   - See AI response

---

## 🎉 Success!

If you see the AI responding, you're all set!

## 🐛 Troubleshooting

### Build Error
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Microphone Not Working
- Check browser permissions (allow microphone)
- Try HTTPS in production
- Use Text mode as fallback

### API Errors
- Verify API keys in `.env.local`
- Check API key validity
- Ensure no extra spaces in keys

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [QA_CHECKLIST.md](QA_CHECKLIST.md) for testing
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review [demo-script.md](public/demo-script.md) for feature walkthrough

---

## 🆘 Need Help?

- **Documentation**: README.md
- **Email**: suyashmankar@gmail.com
- **Issues**: Open a GitHub issue

---

**Happy Interviewing! 🎤**

