// deno-lint-ignore-file no-explicit-any
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
import { CSSConfig } from "./css.ts";
import { MDXCompiler } from "./mdx-compiler.ts";
import remarkCompileMdxImports from "./remark-plugins/remark-compile-mdx-imports.ts";
import { createShikiConfig, ShikiConfig } from "./shiki.ts";

export type HtmlConfigStyles = (string | { href?: string; text?: string; id?: string })[];

/** Configuration for customizing the base html template */
export interface HtmlConfig {
  /** Title of the html page */
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
  /**
   * The number of posts to display on the index page.
   *
   * @default 5
   */
  postLimit?: number;
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
  useDynamicImport: true,
  providerImportSource: "https://esm.quack.id/@mdx-js/preact@2.3.0",
  jsxImportSource: "https://esm.quack.id/preact@10.13.2",
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

export function installCompileMdxImportsPlugin(mdxConfig: MDXConfig, pathCfg: PathConfig) {
  const compiler = new MDXCompiler(mdxConfig, { blogDir: pathCfg.blogDir, outDir: pathCfg.outDir });
  mdxConfig.remarkPlugins?.unshift([remarkCompileMdxImports, { compiler, root: pathCfg.blogDir }]);
  return compiler;
}

export interface BlogConfig {
  /**
   * Root directory of the project. All other relative or absolute directory paths specified in the
   * config are in relation to this one.
   * @default Deno.cwd()
   */
  root?: string;
  /**
   * The directory where markdown or mdx posts are read from to convert to html
   * @default "blog"
   */
  blogDir?: string;
  /**
   * TODO: Rework probs
   */
  base?: string;

  /** Sets the author tag for any post not provided via frontmatter */
  author?: string;

  /**
   * Assets placed in this directory will be hoisted to the root web server directory. Best used for things like `robots.txt` or `favicon.ico`.
   * @default "public"
   */
  publicDir?: string;
  /** Specific config for the server sub process */
  server?: ServerConfig;
  /** Specific config for the build sub process */
  build?: BuildConfig;
  /**
   * Configuration for the blog index page
   *
   * @example
   * {
   *  title: "My Blog",
   *  description: "My Blog Description",
   * }
   */
  index?: IndexConfig;
  /** CSS Config */
  css?: CSSConfig;
  /** HTML Document properties like `title` or `meta` tags. */
  html?: HtmlConfig;
  /** Configuration specific to the mdx compilers */
  mdx?: MDXConfig;
  /** Shiki language and theme configs. If a null value is received here then shiki is disabled. */
  shiki?: ShikiConfig | null;
}

export const DEFAULT_CONFIG = {
  root: Deno.cwd(),
  base: "/",
  blogDir: "blog",
  publicDir: "public",
  author: "Curtis Larson",
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
    author: cfg.author,
    server,
    build,
    mdx,
    shiki: cfg.shiki !== null ? createShikiConfig(cfg.shiki) : null,
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
