# QUICK START

## 5-minute launch

1. Unzip the project.
2. Open it in VS Code.
3. Run:

```bash
npm install
npm run dev
```

4. Visit:

```text
http://localhost:3000
```

5. Add an item.
6. Apply suggested pricing.
7. Generate the listing pack.
8. Copy each platform block and paste it into Marketplace, OfferUp, or Nextdoor.

## Troubleshooting

### If `npm install` fails
Make sure Node.js 18 or newer is installed.

### If port 3000 is in use
Run:

```bash
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

### If the app looks stale after changes
Delete the `.next` folder and restart the server.
