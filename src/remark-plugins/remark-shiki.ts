import { Highlighter } from "https://esm.quack.id/shiki-es@0.2.0";
import { visit } from "https://esm.quack.id/unist-util-visit@4.1.2";
import type { Code, Plugin, Root } from "./types.ts";

export interface ShikiOptions {
  highlighter: Highlighter;
  theme?: string;
}

export function parseMetaString(meta?: string | null): Record<string, string> {
  if (meta == null || meta === "") {
    return {};
  } else {
    const metas = meta.split(" ") ?? [];
    return metas.reduce<Record<string, string>>((acc, m) => {
      const splits = m.split("=");
      const property = splits[0];
      let value = splits[1];
      if (value.startsWith("\"") && value.endsWith("\"")) {
        value = value.slice(1, -1);
      }
      if (value === "") {
        value = "true";
      }
      acc[property] = value;
      return acc;
    }, {});
  }
}

const remarkShiki: Plugin<[ShikiOptions], Root> = (options) => {
  const { highlighter } = options;
  const theme = options.theme ?? "dracula";

  return (ast) => {
    visit(ast, "code", (node: Code) => {
      if (!node.lang) {
        return;
      }
      const metas = parseMetaString(node.meta);

      const value = highlighter.codeToHtml(node.value, {
        lang: node.lang,
        theme: metas["theme"] ?? theme,
      });

      Object.assign(node, { type: "html", value });
    });
  };
};

export default remarkShiki;
