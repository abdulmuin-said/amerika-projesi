// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'www.canvasia.com.tr' },
      { protocol: 'https', hostname: 'canvasia.com.tr' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'http', hostname: 'localhost', port: '8080' },
    ],
    // These external hosts block server-side fetches from the Next.js optimizer.
    // Unoptimized loads the URL directly in the browser instead.
    unoptimized: true,
  },
  reactStrictMode: false,
  output: 'standalone',

  // Fix Turbopack/Next picking wrong root due to extra lockfiles.
  // (Your logs show it selecting `C:\Users\Admin\package-lock.json` as root.)
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig;