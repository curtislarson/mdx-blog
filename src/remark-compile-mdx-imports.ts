import type { MdxjsEsm } from "https://esm.quack.id/mdast-util-mdx@2.0.0";
import type { Plugin } from "https://esm.quack.id/unified@10.1.2";
import type { ImportDeclaration } from "https://esm.quack.id/v104/@types/estree@1.0.0/index.d.ts";
import type { Content, Root } from "https://esm.quack.id/v104/@types/mdast@3.0.10/index.d.ts";
import { join } from "../deps.ts";
import { CompileCache } from "./compile-cache.ts";

export interface MdxRewriteImportsOptions {
  root: string;
  /** Used to compile any mdx imports we find */
  compiler: CompileCache;
}

type RootWithMdxContent = Omit<Root, "children"> & {
  children: (Content | MdxjsEsm)[];
};

/**
 * With mdx `evaluate` we can only dynamically import `js` / `jsx` components so we have to navigate the ast
 * find any `mdx` imports, compile them to a temporary file, and replace the import with the one for
 * the temporary file.
 */
const remarkCompileMdxImports: Plugin<[MdxRewriteImportsOptions], RootWithMdxContent> = (options) => {
  const { compiler } = options;

  function compileImportDeclaration(decl: ImportDeclaration) {
    const importSource = decl.source.value!.toString();
    const absoluteImportSource = join(options.root, importSource);
    const compiled = compiler.compileToCacheSync(absoluteImportSource);
    decl.source = {
      type: "Literal",
      value: compiled,
      raw: `"${compiled}"`,
    };
  }

  return (ast) => {
    for (const node of ast.children) {
      if (node.type !== "mdxjsEsm" || node.data?.estree?.body == null) {
        continue;
      }
      node.data.estree.body.filter((d): d is ImportDeclaration => d.type === "ImportDeclaration").forEach((decl) =>
        compileImportDeclaration(decl)
      );
    }
  };
};

export default remarkCompileMdxImports;
