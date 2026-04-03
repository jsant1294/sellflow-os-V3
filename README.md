# SellFlow OS Final V3

SellFlow OS Final V3 is a standalone Next.js app for generating fast local-sale listing packs.

It now includes QuickScan AI, which can analyze an uploaded item photo and prefill the intake form with an item name, category, condition estimate, notes, and pricing.

Lucio also supports server-side context-aware assistance for pricing, listing improvement, buyer replies, and faster sell-through recommendations.

## Lucio Resale Copilot

Lucio is the built-in AI resale assistant inside SellFlow.

It helps you:
- price items smarter
- improve listing copy
- respond to buyers faster
- decide when to lower price or relist
- move stale inventory with less guessing

Lucio is not a general chatbot. It is focused on helping you sell faster and make better local resale decisions.

### What Lucio Uses

Lucio works from your item context, including:
- item name
- category
- condition
- pricing
- urgency
- listing status
- buyer messages
- selected platform

### Lucio Modes

- Price this item
- Improve listing
- Reply to buyer
- Sell faster

### Quick Start

1. Add an item or open an existing item.
2. Open the Lucio orb in the bottom-right corner.
3. Choose a mode.
4. Select the platform and selling goal.
5. Paste a rough listing or buyer message if needed.
6. Copy Lucio's recommendation and use it immediately.

### Why It Matters

Lucio reduces guesswork in the parts of local selling that slow people down most:
- pricing
- writing listings
- handling offers
- reviving stale posts

Instead of generic AI chat, it gives short, practical recommendations built for local resale workflows.

### Best For

- Facebook Marketplace sellers
- OfferUp sellers
- Nextdoor sellers
- flippers
- side hustlers
- local inventory resellers

### Positioning

Lucio helps you price smarter, write better listings, and close buyers faster.

It helps you produce:
- Facebook Marketplace copy
- OfferUp copy
- Nextdoor copy
- Facebook Group posts
- promo/support posts for social scheduling tools like PromoRepublic
- negotiation reply scripts
- pricing guidance
- relist guidance
- draft / posted / sold tracking
- JSON export/import backup
- bilingual EN/ES workflow

## Best use case

Use it as:
1. your own flipping command center
2. a DIY downloadable product
3. a done-for-you setup service
4. the foundation for a future SaaS app

## Install locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

```text
http://localhost:3000
```

Set `OPENAI_API_KEY` in `.env.local` and in Vercel if you want QuickScan AI and Lucio AI enabled. `OPENAI_LUCIO_MODEL` is optional if you want Lucio on a different model.

## Deploy to Vercel

1. Create a GitHub repo.
2. Upload this project.
3. Import the repo into Vercel.
4. Add `OPENAI_API_KEY` in the Vercel project environment variables.
5. Click Deploy.

The core listing workflow works without AI, but QuickScan AI requires OpenAI credentials.

## What makes this version stronger

- mobile-first glassmorphism UI
- category-based pricing suggestions
- bilingual English/Spanish toggle
- full listing pack pages
- reusable reply scripts
- JSON backup/restore
- support-post copy that fits external social schedulers

## Important limitation

This version does **not** auto-post directly to Facebook Marketplace, OfferUp, or Nextdoor. It is designed as a listing-generation and workflow system so you stay within realistic platform limits.


## Phone-first quick post mode

Open any generated item and use the quick-post card at the top of the listing pack. It gives you one-tap copy buttons plus app/web launch buttons for Facebook Marketplace, OfferUp, and Nextdoor so you can paste listings faster on your phone.
