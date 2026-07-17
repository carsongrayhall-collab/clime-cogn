const htmlRoutes = [
  ["", "index"],
  ["checkout", "checkout/index"],
  ["elevate", "elevate/index"],
  ["faq", "faq/index"],
  ["legal", "legal/index"],
  ["philosophy", "philosophy/index"],
  ["privacy", "privacy/index"],
  ["team", "team/index"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/public/:path*", destination: "/:path*" },
      ...htmlRoutes.map(([route, file]) => ({
        source: route ? `/${route}` : "/",
        destination: `/_site/${file}.html`,
      })),
    ];
  },
};

module.exports = nextConfig;
