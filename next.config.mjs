/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In dev, Next.js and the Python Flask function run as separate
    // processes; proxy /api/* to the local Flask server. On Vercel,
    // /api/*.py is deployed natively as a serverless function and this
    // rewrite is skipped.
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/analyze",
          destination: "http://127.0.0.1:5328/api/analyze",
        },
        {
          source: "/api/search",
          destination: "http://127.0.0.1:5329/api/search",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
