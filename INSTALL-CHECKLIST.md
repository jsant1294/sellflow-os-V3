# CUSTOMER INSTALL CHECKLIST

## What the buyer needs
- Computer with internet
- VS Code or another editor
- Node.js 18+
- Optional: GitHub + Vercel account for deployment
- OpenAI API key for QuickScan AI photo intake

## Local setup
- Unzip project
- Open folder
- Run `npm install`
- Run `npm run dev`
- Open `http://localhost:3000`

## Vercel setup
- Create GitHub repository
- Upload project files
- Import into Vercel
- Add `OPENAI_API_KEY` if QuickScan AI should work in production
- Deploy

## What to test after install
- Dashboard loads
- Add item page works
- Listing pack generates
- Copy buttons work
- Item status can change to draft / posted / sold
- JSON export downloads correctly
