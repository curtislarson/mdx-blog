import {
  JSX,
  Pluggable,
  preactRuntime,
  remarkFrontmatter,
  remarkGFM,
  remarkMdxFrontmatter,
  resolve,
  ServeDirOptions,
} from "../deps.ts";
import { MDXCompiler } from "./mdx-compiler.ts";
import remarkCompileMdxImports from "./remark-plugins/remark-compile-mdx-imports.ts";
import { createShikiConfig, ShikiConfig } from "./shiki.ts";
import { UnoCSSConfig } from "./unocss.ts";

export type HtmlConfigStyles = (string | { href?: string; text?: string; id?: string })[];

export interface HtmlConfig {
  title?: string;
  meta?: Record<string, string | null | undefined>;
  links?: { [key: string]: string; href: string; rel: string }[];
  styles?: HtmlConfigStyles;
  postComponent?: (props: {
    children?: any;
  }) => JSX.Element;
}

export interface IndexConfig {
  header?: JSX.Element;
  footer?: JSX.Element;
  avatar?: string;
  title?: string;
  description?: string;
}

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
  rehypePlugins?: Pluggable<any>[];
}

export const DEFAULT_MDX_CONFIG = {
  ...preactRuntime,
  useDynamicImport: true,
  providerImportSource: "https://esm.quack.id/@mdx-js/preact@2.1.2",
  jsxImportSource: "https://esm.quack.id/preact@10.11.3",
  remarkPlugins: [remarkFrontmatter as any, remarkMdxFrontmatter, remarkGFM],
  rehypePlugins: [],
};

export function createMDXConfig(cfg: MDXConfig = {}) {
  const mdxConfig = {
    ...DEFAULT_MDX_CONFIG,
    ...cfg,
  };
  return mdxConfig;
}

export function installCompileMdxImportsPlugin(mdxConfig: Required<MDXConfig>, pathCfg: PathConfig) {
  const compiler = new MDXCompiler(mdxConfig, { blogDir: pathCfg.blogDir, outDir: pathCfg.outDir });
  mdxConfig.remarkPlugins?.unshift([remarkCompileMdxImports, { compiler, root: pathCfg.blogDir }]);
  return compiler;
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
  index?: IndexConfig;
  css?: UnoCSSConfig;
  html?: HtmlConfig;
  mdx?: MDXConfig;
  shiki?: ShikiConfig;
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

export function createBlogConfig(cfg: BlogConfig, pathCfg: PathConfig, mdx: MDXConfig) {
  const server = { ...DEFAULT_CONFIG.server, ...cfg.server };
  const build = {
    ...DEFAULT_CONFIG.build,
    ...cfg.build,
    outDir: pathCfg.outDir,
  };
  return {
    ...cfg,
    ...pathCfg,
    server,
    build,
    mdx,
    shiki: createShikiConfig(cfg.shiki),
  };
}

export interface PathConfig {
  root: string;
  base: string;
  blogDir: string;
  publicDir: string;
  outDir: string;
  baseUrl: string;
}

export function createPathConfig(cfg: BlogConfig) {
  const root = cfg.root ?? DEFAULT_CONFIG.root;
  const base = cfg.base ?? DEFAULT_CONFIG.base;
  const blogDir = resolve(root, cfg.blogDir ?? DEFAULT_CONFIG.blogDir);
  const publicDir = resolve(root, cfg.publicDir ?? DEFAULT_CONFIG.publicDir);
  const outDir = resolve(root, cfg.build?.outDir ?? DEFAULT_CONFIG.build.outDir);
  return {
    root,
    base,
    blogDir,
    publicDir,
    outDir,
    baseUrl: `file://${blogDir}/`,
  };
}
