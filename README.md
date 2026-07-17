# Clime

Static ecommerce site build from the supplied Clime Figma frames and uploaded media assets.

Run the local Next.js development server with:

```powershell
npm run dev
```

The legacy static server is still available with:

```powershell
npm run legacy:dev
```

For Vercel, use the Next.js framework preset and add `STRIPE_SECRET_KEY` in
Project Settings > Environment Variables. The current HTML pages are served
through Next rewrites so the visual structure stays unchanged during this
compatibility migration.
