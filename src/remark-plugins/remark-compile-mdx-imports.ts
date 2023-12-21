import { join, MdxjsEsm } from "../../deps.ts";
import { MDXCompiler } from "../mdx-compiler.ts";
import type { Content, ImportDeclaration, Plugin, Root } from "./types.ts";

export interface CompileMdxImportsOptions {
  root: string;
  /** Used to compile any mdx imports we find */
  compiler: MDXCompiler;
}

type RootWithMdxContent = Omit<Root, "children"> & {
  children: (Content | MdxjsEsm)[];
};

/**
 * With mdx `evaluate` we can only dynamically import `js` / `jsx` components so we have to navigate the ast
 * find any `mdx` imports, compile them to a temporary file, and replace the import with the one for
 * the temporary file.
 */
const remarkCompileMdxImports: Plugin<
  [CompileMdxImportsOptions],
  RootWithMdxContent
> = (options) => {
  const { compiler } = options;

  function compileImportDeclaration(decl: ImportDeclaration) {
    const importSource = decl.source.value!.toString();
    const absoluteImportSource = join(options.root, importSource);
    const compiled = compiler.compileToTempFile(absoluteImportSource);
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
      node.data.estree.body.filter((d): d is ImportDeclaration =>
        d.type === "ImportDeclaration"
      ).forEach((decl) => compileImportDeclaration(decl));
    }
  };
};

export default remarkCompileMdxImports;
