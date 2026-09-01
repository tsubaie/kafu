import type { NextConfig } from "next";

// Extra origins allowed to reach the dev server (e.g. a LAN IP or hostname you
// browse from). Comma-separated, e.g. ALLOWED_DEV_ORIGINS="192.168.1.20,dev.local"
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

export default nextConfig;
