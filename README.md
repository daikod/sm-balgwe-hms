Hospital Management System - SM BALGWE HMS

Key Notes (optional);
1. Free Prisma, Neon and Clerk accounts
2. Local postgresql database can be used instead of option 1
3. Deploy using vercel

   NB: Create free accounts with Prisma, clerk and neon for user authentication and database functionality

## Getting Started
Prequisites;
Create .env file using your own values, with the following;
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
DATABASE_URL=""

Clone repo using git clone
git clone https://github.com/daikod/sm-balgwe-hms.git
cd sm-balgwe.git
npm install 

First, run the development server:

```bash

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
