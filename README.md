## Supabase Auth Starter

This project is a Next.js app with an email/password login flow powered by Supabase.

### Prerequisites

- Supabase project with Email/Password auth enabled
- Environment variables in `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the login experience. Successful authentication will display the active session on the right-hand panel.

### Deployment

The app is ready for Vercel deployments. Ensure the Supabase environment variables are configured in the Vercel dashboard before deploying.
