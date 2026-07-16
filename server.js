const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const KEY_FILE = process.env.STRIPE_KEYS_FILE || "C:\\Users\\carso\\Desktop\\Clime\\stripe-sandbox-keys.txt";

const STRIPE_API_HOST = "api.stripe.com";
const STRIPE_API_VERSION = "2025-06-30.basil";
const SINGLE_PRICE_ID = process.env.STRIPE_SINGLE_PRICE_ID || "price_1TtlKLLxGPIiNmdEIq9TpUAf";
const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || "price_1TtlJYLxGPIiNmdETqc7hQpE";
const SHIPPING_AMOUNT_CENTS = 355;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const loadStripeSecret = () => {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  const contents = fs.readFileSync(KEY_FILE, "utf8");
  const match = contents.match(/sk_test_[A-Za-z0-9_-]+/);
  if (!match) throw new Error("Missing Stripe sandbox secret key.");
  return match[0];
};

const stripeRequest = (pathname, params) =>
  new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const secret = loadStripeSecret();
    const req = https.request(
      {
        hostname: STRIPE_API_HOST,
        method: "POST",
        path: pathname,
        headers: {
          Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
          "Stripe-Version": STRIPE_API_VERSION,
        },
      },
      (stripeRes) => {
        let data = "";
        stripeRes.on("data", (chunk) => {
          data += chunk;
        });
        stripeRes.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (error) {
            reject(new Error("Stripe returned an unreadable response."));
            return;
          }

          if (stripeRes.statusCode < 200 || stripeRes.statusCode >= 300) {
            reject(new Error(parsed.error?.message || "Stripe checkout session failed."));
            return;
          }

          resolve(parsed);
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });

const isPaypalUnavailableError = (error) =>
  /payment method type "paypal" is invalid|paypal.+activated in your dashboard/i.test(error.message || "");

const createCheckoutSession = async (req, res) => {
  try {
    const payload = JSON.parse((await readBody(req)) || "{}");
    const quantity = Math.max(1, Math.min(99, Number.parseInt(payload.quantity || "1", 10)));
    const isSubscription = payload.subscription === true;
    const priceId = isSubscription ? MONTHLY_PRICE_ID : SINGLE_PRICE_ID;
    const origin = `http://${req.headers.host}`;

    const params = {
      mode: isSubscription ? "subscription" : "payment",
      "payment_method_types[0]": "card",
      "payment_method_types[1]": "paypal",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": String(quantity),
      "shipping_address_collection[allowed_countries][0]": "US",
      billing_address_collection: "auto",
      success_url: `${origin}/checkout/?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/?canceled=1`,
      "metadata[product]": "elevate-s1",
      "metadata[quantity]": String(quantity),
      "metadata[purchase_type]": isSubscription ? "monthly_subscription" : "single_purchase",
    };

    if (isSubscription) {
      params["line_items[1][price_data][currency]"] = "usd";
      params["line_items[1][price_data][unit_amount]"] = String(SHIPPING_AMOUNT_CENTS);
      params["line_items[1][price_data][product_data][name]"] = "Standard shipping";
      params["line_items[1][quantity]"] = "1";
    } else {
      params["shipping_options[0][shipping_rate_data][type]"] = "fixed_amount";
      params["shipping_options[0][shipping_rate_data][fixed_amount][amount]"] = String(SHIPPING_AMOUNT_CENTS);
      params["shipping_options[0][shipping_rate_data][fixed_amount][currency]"] = "usd";
      params["shipping_options[0][shipping_rate_data][display_name]"] = "Standard shipping";
      params["shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]"] = "business_day";
      params["shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]"] = "4";
      params["shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]"] = "business_day";
      params["shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]"] = "6";
    }

    let session;
    try {
      session = await stripeRequest("/v1/checkout/sessions", params);
    } catch (error) {
      if (!isPaypalUnavailableError(error)) throw error;
      delete params["payment_method_types[1]"];
      session = await stripeRequest("/v1/checkout/sessions", params);
    }

    sendJson(res, 200, { url: session.url });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};

const serveStatic = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath.endsWith("/")) requestedPath += "index.html";

  const absolutePath = path.resolve(ROOT, `.${requestedPath}`);
  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(absolutePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(absolutePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(absolutePath).pipe(res);
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "POST" && url.pathname === "/api/create-checkout-session") {
    createCheckoutSession(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end("Method not allowed");
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Clime dev server running at http://127.0.0.1:${PORT}/`);
});
