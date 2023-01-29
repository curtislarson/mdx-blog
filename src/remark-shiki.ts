import jsx from "https://esm.quack.id/acorn-jsx@5.3.2";
import { Parser } from "https://esm.quack.id/acorn@8.8.2";
import { Highlighter } from "https://esm.quack.id/shiki-es@0.2.0";
import type { Plugin } from "https://esm.quack.id/unified@10.1.2";
import { visit } from "https://esm.quack.id/unist-util-visit@4.1.2";
import type { Code, Parent, Root } from "https://esm.quack.id/v104/@types/mdast@3.0.10/index.d.ts";

export interface ShikiOptions {
  highlighter: Highlighter;
  theme?: string;
}

const parser = Parser.extend(jsx());

const remarkShiki: Plugin<[ShikiOptions], Root> = (options) => {
  const { highlighter } = options;
  const theme = options.theme ?? "dracula";

  return (ast) => {
    visit(ast, "code", (node: Code, index: number | null, parent: Parent | null) => {
      if (!node.lang) {
        return;
      }
      const metas = node.meta?.split(" ") ?? [];
      let blockTheme = theme;
      for (const meta of metas) {
        const [tag, val] = meta.split("=");
        if (tag === "theme" && val !== "") {
          blockTheme = val.replaceAll("\"", "");
        }
      }

      const value = highlighter.codeToHtml(node.value, {
        lang: node.lang,
        theme: blockTheme,
      });
      console.log("Parsing val", value);

      const estree = parser.parse(value, { ecmaVersion: "latest" }) as unknown;
      parent!.children[index!] = {
        type: "mdxFlowExpression" as any,
        value,
        data: { estree },
      };
    });
  };
};

export default remarkShiki;
