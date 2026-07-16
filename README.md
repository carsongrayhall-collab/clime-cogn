# Clime

Static ecommerce site build from the supplied Clime Figma frames and uploaded media assets.

Run the local development server with:

```powershell
npm run dev
```

The server reads Stripe sandbox keys from `STRIPE_SECRET_KEY` or from
`C:\Users\carso\Desktop\Clime\stripe-sandbox-keys.txt`, then serves the site at
`http://127.0.0.1:3000/` with a server-side Stripe Checkout endpoint.

For Vercel, add `STRIPE_SECRET_KEY` in Project Settings > Environment Variables.
The static routes and Checkout API are configured by `vercel.json` and
`api/create-checkout-session.js`.
