// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     // !! WARN !!
//     // Dangerously allow production builds to successfully complete even if
//     // your project has type errors.
//     // !! WARN !!
//     ignoreBuildErrors: true,
//   },
//   images: { unoptimized: true },
//   devIndicators: false,
//   allowedDevOrigins: [
//     "*.macaly.dev",
//     "*.macaly.app",
//     "*.macaly-app.com",
//     "*.macaly-user-data.dev",
//   ],
// };


// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // ✅ THÊM DÒNG NÀY

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  devIndicators: false,
  allowedDevOrigins: [
    "*.macaly.dev",
    "*.macaly.app",
    "*.macaly-app.com",
    "*.macaly-user-data.dev",
  ],
};

module.exports = nextConfig;