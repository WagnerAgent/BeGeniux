import type { NextConfig } from "next";
import path from "node:path";

// Resolve `begeniux` and `begeniux/server` to the local repo source so
// this example always reflects the current library state. After
// `npm install`, file:../.. also leaves a symlink at node_modules/begeniux,
// so even without aliases the imports would resolve — but we want source
// hot-reload, hence the explicit aliases below.
//
// Note: webpack accepts absolute paths in resolve.alias; Turbopack treats
// absolute paths as server-relative and fails. So we use absolute for
// webpack (`next build` / non-Turbo dev) and project-relative for Turbo.

const config: NextConfig = {
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
      begeniux: "../../src/index.ts",
      "begeniux/server": "../../src/server/index.ts",
    },
  },
};

export default config;
