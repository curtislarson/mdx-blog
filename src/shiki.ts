import { getHighlighter, HighlighterOptions, mdx, rehypeRaw } from "../deps.ts";
import { MDXConfig } from "./config.ts";
import remarkShiki from "./remark-plugins/remark-shiki.ts";

export type ShikiConfig = HighlighterOptions;

export function createShikiConfig(options: HighlighterOptions = {}) {
  const themes = options.themes ??
    ["dracula", "dark-plus", "light-plus", "nord"];
  const langs = options.langs ??
    ["typescript", "javascript", "jsx", "tsx", "mdx", "sh", "yaml"];
  return {
    ...options,
    themes,
    langs,
  };
}

export async function installShikiPlugin(
  mdxConfig: MDXConfig,
  shikiConfig: ShikiConfig,
) {
  const highlighter = await getHighlighter(shikiConfig);
  mdxConfig.remarkPlugins?.unshift([remarkShiki, { highlighter }]);
  mdxConfig.rehypePlugins?.unshift([rehypeRaw, { passThrough: mdx.nodeTypes }]);
}
