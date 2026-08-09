import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "10.13.12.46:3000", "10.13.12.46:3001", "10.13.12.46"],
};

export default nextConfig;
