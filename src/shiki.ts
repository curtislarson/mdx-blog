import {
  BUNDLED_LANGUAGES,
  BUNDLED_THEMES,
  getHighlighter,
  HighlighterOptions,
} from "https://esm.quack.id/shiki-es@0.2.0";
import { MDXConfig } from "./config.ts";
import remarkShiki from "./remark-shiki.ts";

export interface ShikiOptions {
  langs?: string[];
  themes?: string[];
}

export async function installShikiPlugin(
  config: MDXConfig,
  options: HighlighterOptions = { langs: BUNDLED_LANGUAGES, themes: BUNDLED_THEMES },
) {
  const highlighter = await getHighlighter(options);
  config.remarkPlugins?.push([remarkShiki, { highlighter }]);
}
