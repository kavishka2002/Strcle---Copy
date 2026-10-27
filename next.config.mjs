/** @type {import('next').NextConfig} */
const isDesktopBuild = process.env.LITTLEPAPER_DESKTOP_BUILD === "1";
const nextConfig = {
  ...(isDesktopBuild ? { distDir: ".next-desktop" } : {}),
  ...(isDesktopBuild ? { output: "standalone" } : {}),
  devIndicators: false,
  experimental: { optimizePackageImports: ["lucide-react"] }
};

export default nextConfig;
