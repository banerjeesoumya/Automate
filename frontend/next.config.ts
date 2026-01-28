import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone",
   async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      }
    ]
   },
   experimental: {
    externalDir: true,
   }
};

export default nextConfig;
