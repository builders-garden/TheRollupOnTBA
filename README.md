# Farcaster Mini App Template

This is a [Next.js](https://nextjs.org) starter kit to boostrap your Farcaster Mini App development.

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Neynar](https://neynar.com)
- [Drizzle](https://orm.drizzle.team/)
- [Farcaster Mini App](https://miniapps.farcaster.xyz/)
- [Reown](https://cloud.reown.com)

## Getting Started

1. Install dependencies:

```bash
pnpm install
# or
bun install
# or
npm install
# or
yarn install
```

2. Verify environment variables:

The environment variables enable the following features:

- Farcaster Mini App metadata - Sets up the Farcaster Mini App that will be shown when you cast your mini app
- Account assocation - Allows users to add your mini app to their account, enables notifications
- Database - Stores user notification preferences

```bash
cp .env.example .env
```

3. Start the development server:

```bash
pnpm run dev
```

4. Run a local tunneling server
   Follow our friends at [Dtech Vision](https://dtech.vision/farcaster/miniapps/theultimatefarcasterminiappdebuggingguide/#warpcast-debugger) to generate a tunnel to expose your localhost.

5. Generate your Farcaster Manifest variables

- Follow these [instructions](https://miniapps.farcaster.xyz/docs/guides/publishing)
- Visit [Manifest Tool](https://warpcast.com/~/developers/mini-apps/manifest)
- Paste your tunnel domain

## Template Features

### Mini App Configuration

- `.well-known/farcaster.json` endpoint configured for Farcaster Mini App metadata and account association
- Mini App metadata automatically added to page headers in `layout.tsx`

### Background Notifications

- Redis-backed notification system using Upstash
- Ready-to-use notification endpoints in `api/notify` and `api/webhook/farcaster`
- Notification client utilities in `lib/notification-client.ts`

### MiniApp Provider

The app is wrapped with `MiniAppProvider` in `providers.tsx`, configured with:

- Access to Mini App context
- Sets up Wagmi Connectors
- Sets up Mini App SDK listeners
- Applies Safe Area Insets

### Dynamic Preview Images

- `profile/[profileId]/page.tsx` show how to create a Mini App URL resolving to a custom preview image
- `api/og/profile/[profileId]/route.ts` shows how to generate a custom preview image

## Learn More

- [Farcaster Mini Apps](https://miniapps.farcaster.xyz/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Neynar](https://neynar.com)
