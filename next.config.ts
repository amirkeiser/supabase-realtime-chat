import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hello.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "https://local.co.uk",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
