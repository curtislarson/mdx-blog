import {
  Pluggable,
  preactRuntime,
  remarkFrontmatter,
  remarkGFM,
  remarkMdxFrontmatter,
  resolve,
  ServeDirOptions,
} from "../deps.ts";
import { UnoCSSConfig } from "./unocss.ts";

export interface ServerConfig extends Omit<ServeDirOptions, "fsRoot"> {}

export interface BuildConfig {
  /** @default "dist" */
  outDir?: string;
}

export interface MDXConfig {
  jsx?: typeof preactRuntime["jsx"];
  jsxs?: typeof preactRuntime["jsxs"];
  jsxDEV?: typeof preactRuntime["jsxDEV"];
  Fragment?: typeof preactRuntime["Fragment"];
  providerImportSource?: string;
  jsxImportSource?: string;
  remarkPlugins?: Pluggable<any>[];
}

export const DEFAULT_MDX_CONFIG = {
  ...preactRuntime,
  useDynamicImport: true,
  providerImportSource: "https://esm.quack.id/@mdx-js/preact@2.1.2",
  jsxImportSource: "https://esm.quack.id/preact@10.11.3",
  remarkPlugins: [remarkFrontmatter as any, remarkMdxFrontmatter, remarkGFM],
};

export function createMDXConfig(cfg: MDXConfig = {}) {
  return {
    ...DEFAULT_MDX_CONFIG,
    ...cfg,
  };
}

export interface BlogConfig {
  /** @default Deno.cwd() */
  root?: string;
  /** @default "blog" */
  blogDir?: string;
  /** @default "/" */
  base?: string;
  /** @default "public" */
  publicDir?: string;
  server?: ServerConfig;
  build?: BuildConfig;
  css?: UnoCSSConfig;
  mdx?: MDXConfig;
}

export const DEFAULT_CONFIG = {
  root: Deno.cwd(),
  base: "/",
  blogDir: "blog",
  publicDir: "public",
  server: {},
  build: {
    outDir: "dist",
  },
};

export function createBlogConfig(cfg: BlogConfig) {
  const root = cfg.root ?? DEFAULT_CONFIG.root;
  const server = { ...DEFAULT_CONFIG.server, ...cfg.server };
  const build = {
    ...DEFAULT_CONFIG.build,
    ...cfg.build,
    outDir: resolve(root, cfg.build?.outDir ?? DEFAULT_CONFIG.build.outDir),
  };
  return {
    ...cfg,
    root,
    base: cfg.base ?? DEFAULT_CONFIG.base,
    blogDir: resolve(root, cfg.blogDir ?? DEFAULT_CONFIG.blogDir),
    publicDir: resolve(root, cfg.publicDir ?? DEFAULT_CONFIG.publicDir),
    server,
    build,
    mdx: createMDXConfig(cfg.mdx),
  };
}
