# Moir-AI - Spiritual Companion App

A Next.js-based spiritual guidance application that combines modern web technologies with mystical themes. Built as an exploration into conversational AI interfaces with esoteric elements.

## What is this?

Moir-AI started as an experiment in creating a more engaging way to interact with AI beyond typical chatbots. Instead of another generic assistant, I wanted to build something that felt more like consulting a wise oracle or spiritual guide. The app incorporates tarot readings, astrology references, and mindfulness exercises while maintaining a mystical aesthetic.

The interface is designed around the concept of a crystal ball - complete with floating animations and a dark, mystical theme. Users can have conversations, receive daily guidance, and track their spiritual journey over time.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom mystical theme
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **AI**: Google Gemini via Genkit
- **PWA**: Next-PWA for offline capabilities
- **Mobile**: Capacitor for native app deployment

## Features

- **Conversational AI**: Chat with a spiritual guide persona
- **Tarot Readings**: Three-card past/present/future spreads
- **Daily Summaries**: Emotional tracking and insights
- **Fact Extraction**: AI remembers important personal details
- **Multilingual**: English and Spanish support
- **Offline Support**: PWA with offline message queuing
- **Voice Input**: Speech-to-text for hands-free interaction
- **Memory System**: Persistent user facts and conversation history


## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`

May fail because of capacitor

### Required Environment Variables

```bash
GOOGLE_GENAI_API_KEY=your_gemini_api_key
# Firebase config (optional, for contact form)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase variables
```

## Building

The app supports multiple deployment targets:

- **Web**: Standard Next.js build
- **PWA**: Includes service worker and offline support
- **Mobile**: Capacitor build for iOS/Android

```bash
npm run build          # Web build
npm run build:mobile   # Prepare for Capacitor
```

## Interesting Technical Decisions

### AI Personality System
The app implements three distinct AI personalities (wise, direct, poetic) that dramatically change the tone and style of responses. This was more complex than expected - the AI needed extensive prompting to maintain consistent character traits.

### Offline-First Architecture
Users can continue chatting offline, with messages queued and sent when connectivity returns. This required careful state management and error handling.

### Mystical Design Language
The entire UI follows a custom design system based on purple gradients, cosmic imagery, and flowing animations. The main logo is an animated crystal ball with glitch effects.

### Memory and Context
The app uses a sophisticated fact extraction system to remember important details about users across sessions, creating a more personalized experience over time.

## Deployment Considerations

This was originally planned as a mobile app but ran into App Store requirements around content disclaimers and developer information. The codebase is ready for production deployment but would need:

- Proper content moderation
- Legal disclaimers about AI limitations
- Developer contact information
- Terms of service and privacy policy

## Known Limitations

- AI responses are not filtered for harmful content beyond Gemini's built-in safety
- No user authentication system (everything stored locally)
- Contact form requires Firebase setup
- Tarot readings use simplified Major Arcana only
- Mobile app builds need additional native configuration
