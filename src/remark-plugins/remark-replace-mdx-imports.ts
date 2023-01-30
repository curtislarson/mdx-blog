import type { MdxjsEsm } from "https://esm.quack.id/mdast-util-mdx@2.0.0";
import { join, renderToString } from "../../deps.ts";
import { MDXCompiler } from "../mdx-compiler.ts";
import type { Content, ImportDeclaration, ImportDefaultSpecifier, Plugin, Root } from "./types.ts";

export interface CompileMdxImportsOptions {
  root: string;
  /** Used to compile any mdx imports we find */
  compiler: MDXCompiler;
}

type RootWithMdxContent = Omit<Root, "children"> & {
  children: (Content | MdxjsEsm)[];
};

function createMDXComponentNode(componentName: string): MdxjsEsm {
  return {
    type: "mdxjsEsm",
    value: "",
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [{ type: "VariableDeclarator", id: { type: "Identifier", name: componentName }, init }],
            },
          },
        ],
      },
    },
  };
}

/**
 * With mdx `evaluate` we can only dynamically import `js` / `jsx` components so we have to navigate the ast
 * find any `mdx` imports, compile them to a temporary file, and replace the import with the one for
 * the temporary file.
 */
const remarkCompileMdxImports: Plugin<[CompileMdxImportsOptions], RootWithMdxContent> = (options) => {
  const { compiler } = options;

  function compileImportDeclaration(decl: ImportDeclaration) {
    const importSource = decl.source.value!.toString();
    const absoluteImportSource = join(options.root, importSource);
    const MDXContent = compiler.evaluateSync(absoluteImportSource);
    const asStr = renderToString(MDXContent({}));
    console.log(asStr);
    decl
      .decl.source = {
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
      console.log(JSON.stringify(node, null, 2));
      const importDecls = node.data.estree.body.filter((d): d is ImportDeclaration => d.type === "ImportDeclaration");
      const defaultSpecifierName = importDecls.map((decl) =>
        decl.specifiers.filter((spec): spec is ImportDefaultSpecifier =>
          spec.type === "ImportDefaultSpecifier"
        )[0].local.name
      )[0];
      node.data.estree.body.filter((d): d is ImportDeclaration => d.type === "ImportDeclaration").forEach((decl) =>
        compileImportDeclaration(decl)
      );

      Object.assign(node, { type: "mdxJsxFlowElement", name: defaultSpecifierName });
    }
  };
};

export default remarkCompileMdxImports;
