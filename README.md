# Milto Coffee

Milto Coffee is a Vite/React application backed by Supabase Auth, Postgres,
Realtime, Storage, and Edge Functions.

## Local setup

1. Install dependencies with `npm install`.
2. Create a Supabase project.
3. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

   Older projects can use `VITE_SUPABASE_ANON_KEY` instead. Never expose a
   Supabase secret/service-role key through a `VITE_` variable.

4. Apply `supabase/migrations/20260825000000_initial_milto_schema.sql` through
   the Supabase SQL Editor or CLI.
5. Add the local and deployed app URLs under Authentication > URL
   Configuration.
6. Run the app with `npm run dev`.

The migration creates RLS-protected profiles and application entities, enables
Realtime, and provisions the public `assets` bucket with authenticated upload
policies.

## Authentication

Enable Google under Authentication > Providers to use Google login. The sign-up
screen expects an email OTP; include `{{ .Token }}` in the Supabase confirmation
email template so the six-digit code is delivered.

Promote the first administrator from the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Edge Functions

Calls formerly handled by backend integrations now route to Supabase Edge
Functions. Deploy and configure provider secrets for these function names before
using the related features:

- `send-email`
- `sendPushNotifications`
- `sendBirthdayOffers`
- `getVapidPublicKey`

The compatibility adapter lives in `src/api/supabaseClient.js`, allowing the UI
to keep its existing data-access calls during the migration.
