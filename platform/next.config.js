import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    output: "standalone",
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
