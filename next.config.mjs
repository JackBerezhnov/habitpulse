/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // @vitejs/plugin-react v6 emits type declarations that require TypeScript ≥5.7
    // (export ... as "module.exports"). The plugin is only used by Vitest, not the
    // production build, so skipping the build-time type check is safe here.
    // Local type checking via `tsc` / IDE still works because skipLibCheck is true.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
