# Object Dating App

A dating app where inanimate objects are the foundation of matching. Users upload 3 objects that reflect their personality, and our AI analyzes these to create matches with opposite personality types.

## Features

- 📸 **Upload Objects**: Capture 3 items that define your personality
- 🤖 **AI Analysis**: GPT-4 Vision analyzes your objects to extract personality traits
- 💝 **Smart Matching**: Get 3 daily matches based on complementary personalities
- 👁️ **Anonymous Browsing**: View matches through their objects, not their faces
- 💬 **Real-time Chat**: Connect with matches through live messaging

## Tech Stack

### Frontend
- **React Native + Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **React Navigation** - Screen navigation

### Backend
- **Supabase** - Authentication, PostgreSQL database, real-time subscriptions, file storage
- **Vercel Serverless Functions** - API endpoints for AI processing

### AI/ML
- **OpenAI GPT-4 Vision** - Image analysis and personality extraction
- **OpenAI Embeddings** - Personality vectorization for matching

## Setup Instructions

### 1. Prerequisites
```bash
npm install -g expo-cli
```

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd tech-bros
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `docs/schema.sql` in Supabase SQL Editor
3. Create a storage bucket called `user-images` and make it public
4. Copy your project URL and anon key

### 4. Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_vercel_api_url
```

### 5. Deploy API to Vercel

```bash
cd api
vercel --prod
```

Set environment variables in Vercel:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (use the service_role key from Supabase settings)

### 6. Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go app on your phone.

## Project Structure

```
├── App.tsx                 # Main app navigation
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── screens/
│   ├── LoginScreen.tsx    # Authentication
│   ├── OnboardingScreen.tsx # Upload 3 objects
│   ├── HomeScreen.tsx     # Daily matches feed
│   ├── ProfileScreen.tsx  # View match profiles
│   └── ChatScreen.tsx     # Real-time messaging
├── api/
│   ├── analyze.ts         # GPT-4 Vision image analysis
│   └── generate-matches.ts # Embedding-based matching
└── package.json
```

## Database Schema

### Tables
- `user_profiles` - User data and personality info
- `user_objects` - Uploaded images and AI analysis
- `matches` - Daily match assignments
- `chats` - Chat conversations
- `messages` - Chat messages (with real-time enabled)

See `docs/schema.sql` for full schema.

## How It Works

1. **Onboarding**: User uploads 3 photos of objects they love
2. **Analysis**: Each image is analyzed by GPT-4 Vision to extract personality traits
3. **Profile Creation**: Traits are aggregated into a personality summary
4. **Matching**: Daily, the algorithm:
   - Converts personality summaries to embeddings
   - Calculates cosine distance (opposite personalities)
   - Selects top 3 most complementary matches
5. **Connection**: Users browse matches through their objects and can start chatting

## Development Notes

- Real-time chat uses Supabase's PostgreSQL pub/sub
- Row Level Security (RLS) policies protect user data
- Images are stored in Supabase Storage with public access
- Matching algorithm runs server-side to prevent client-side manipulation

## Future Enhancements

- [ ] Push notifications for new matches/messages
- [ ] Add more objects over time to refine personality
- [ ] Spectacles/AR integration
- [ ] Video messages
- [ ] Match compatibility scores
- [ ] Profile customization

## License

MIT

---

Built for a hackathon with ❤️
