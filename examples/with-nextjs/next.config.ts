import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  // Resolve the local begeniux source at ../../src so this example tracks the
  // current library state without an npm install. Real consumers just use
  // `import { BeGenProvider } from "begeniux"` after `npm install begeniux`.
  webpack: (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      begeniux: path.resolve(__dirname, "../../src/index.ts"),
      "begeniux/server": path.resolve(__dirname, "../../src/server/index.ts"),
    };
    return cfg;
  },
  turbopack: {
    resolveAlias: {
      begeniux: path.resolve(__dirname, "../../src/index.ts"),
      "begeniux/server": path.resolve(__dirname, "../../src/server/index.ts"),
    },
  },
};

export default config;
