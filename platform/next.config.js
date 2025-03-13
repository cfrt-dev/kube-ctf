import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    output: "standalone",
    crossOrigin: "anonymous",
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
