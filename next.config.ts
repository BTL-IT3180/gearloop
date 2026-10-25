import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ảnh demo trỏ tới picsum.photos — cho phép tối ưu ảnh từ domain này.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
