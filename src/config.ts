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
import { CompileCache } from "./compile-cache.ts";
import mdxRewriteImports from "./mdx-rewrite-imports-plugin.ts";
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
}

export const DEFAULT_MDX_CONFIG = {
  ...preactRuntime,
  useDynamicImport: true,
  providerImportSource: "https://esm.quack.id/@mdx-js/preact@2.1.2",
  jsxImportSource: "https://esm.quack.id/preact@10.11.3",
  remarkPlugins: [remarkFrontmatter as any, remarkMdxFrontmatter, remarkGFM],
};

export function createMDXConfig(cfg: MDXConfig = {}, blogDir: string) {
  const mdxConfig = {
    ...DEFAULT_MDX_CONFIG,
    ...cfg,
  };
  const compiler = new CompileCache(mdxConfig, blogDir);
  mdxConfig.remarkPlugins.unshift([mdxRewriteImports, { compiler, root: blogDir }]);
  return mdxConfig;
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
  const blogDir = resolve(root, cfg.blogDir ?? DEFAULT_CONFIG.blogDir);
  return {
    ...cfg,
    root,
    base: cfg.base ?? DEFAULT_CONFIG.base,
    blogDir: resolve(root, cfg.blogDir ?? DEFAULT_CONFIG.blogDir),
    publicDir: resolve(root, cfg.publicDir ?? DEFAULT_CONFIG.publicDir),
    server,
    build,
    mdx: createMDXConfig(cfg.mdx, blogDir),
  };
}
