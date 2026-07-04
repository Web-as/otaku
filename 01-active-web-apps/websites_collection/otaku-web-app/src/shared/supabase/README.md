# Supabase Database Setup

This folder contains the database schema and functions for the Otaku Network platform.

## 🗄️ Database Schema

### Tables

1. **user_profiles** - User account information
   - Stores user tier (free/premium/lifetime)
   - Links to Firebase Auth UID
   - Auto-created on first login

2. **blog_posts** - Blog content
   - Author-owned posts
   - Published/draft status
   - Tags, categories, cover images
   - Full-text search ready

3. **anime_library** - User anime collections
   - Per-user anime tracking
   - Watch status, progress, ratings
   - Metadata (genres, studios, year)

4. **blog_bookmarks** - Saved blog posts
   - User bookmarks
   - Quick access to favorite posts

5. **user_preferences** - User settings
   - Theme, language preferences
   - Notification settings

## 🚀 Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### 2. Run Migration
1. Open Supabase SQL Editor
2. Copy contents of `migrations/001_initial_schema.sql`
3. Run the SQL script
4. Verify all tables created

### 3. Configure Environment
Add to `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Firebase Auth Integration (Optional)
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Firebase provider
3. Add Firebase project credentials

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only access their own data
- Published blog posts are publicly readable
- Drafts are only visible to authors

### Firebase Auth Note

This repo primarily uses Firebase Auth. If you access Supabase directly from the browser using the anon key, RLS policies that depend on `auth.uid()` will not work unless you also use Supabase Auth.

For Firebase-first setups, use `schema-simple.sql` (permissive policies) or move writes behind a trusted backend (Edge Function / server using service role).

## 📊 Usage Examples

### Create User Profile (Auto on Login)
```typescript
import { bootstrapUserProfile } from '@/shared/firebase/auth';

// Called automatically on signIn/signUp
await bootstrapUserProfile(user);
```

### Save Blog Post
```typescript
import { supabase } from '@/shared/supabase';

const { data, error } = await supabase
  .from('blog_posts')
  .insert({
    author_id: user.uid,
    title: 'My First Post',
    slug: 'my-first-post',
    content: 'Post content here...',
    published: true,
  });
```

### Get User's Anime Library
```typescript
import { getAnimeLibrary } from '@/shared/supabase/database';

const library = await getAnimeLibrary(user.uid);
```

### Add Anime to Library
```typescript
import { addAnimeToLibrary } from '@/shared/supabase/database';

await addAnimeToLibrary({
  user_id: user.uid,
  anime_id: 'anime-123',
  title: 'Attack on Titan',
  status: 'watching',
  progress: 5,
  rating: 9,
});
```

## 🧪 Testing

### Sample Data
```sql
-- Insert test user profile
INSERT INTO user_profiles (id, email, display_name, tier)
VALUES ('test-user-123', 'test@example.com', 'Test User', 'free');

-- Insert test blog post
INSERT INTO blog_posts (author_id, title, slug, content, published)
VALUES ('test-user-123', 'Test Post', 'test-post', 'Content here', true);

-- Insert test anime entry
INSERT INTO anime_library (user_id, anime_id, title, status, progress)
VALUES ('test-user-123', 'anime-1', 'Test Anime', 'watching', 5);
```

## 📝 Migration History

- `001_initial_schema.sql` - Initial database schema with all tables and RLS policies
- `002_add_entitlement_columns.sql` - Adds purchase/Stripe entitlement columns to `user_profiles`
- `003_add_preregister_fields.sql` - Adds `badges`, `active_title`, and preregister columns to `user_profiles`

## 🔧 Maintenance

### Backup Database
```bash
# Use Supabase CLI
supabase db dump -f backup.sql
```

### Reset Database (Development Only)
```sql
-- Drop all tables (CAUTION!)
DROP TABLE IF EXISTS blog_bookmarks CASCADE;
DROP TABLE IF EXISTS anime_library CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Then re-run migration
```

## 🚨 Important Notes

- Never commit `.env.local` with real credentials
- Use RLS policies for all production tables
- Test policies thoroughly before deploying
- Keep migrations versioned and sequential
- Always backup before major schema changes

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
