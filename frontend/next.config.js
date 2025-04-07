import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    trailingSlash: false,
    crossOrigin: "anonymous",
    // output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        reactCompiler: true,
    },
};

export default config;
