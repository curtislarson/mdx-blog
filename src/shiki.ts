import rehypeRaw from "https://esm.quack.id/rehype-raw@6.1.1";
import { getHighlighter, HighlighterOptions } from "https://esm.quack.id/shiki-es@0.2.0";
import { mdx } from "../deps.ts";
import { MDXConfig } from "./config.ts";
import remarkShiki from "./remark-plugins/remark-shiki.ts";

export type ShikiConfig = HighlighterOptions;

export function createShikiConfig(options: HighlighterOptions = {}) {
  const themes = options.themes ?? ["dracula", "dark-plus", "light-plus", "nord"];
  const langs = options.langs ?? ["typescript", "javascript", "jsx", "tsx", "mdx", "sh"];
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
