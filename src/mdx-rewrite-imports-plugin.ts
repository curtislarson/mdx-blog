import { MdxjsEsm } from "https://esm.quack.id/mdast-util-mdx@2.0.0";
import { Plugin } from "https://esm.quack.id/unified@10.1.2";
import { Content, Root } from "https://esm.quack.id/v104/@types/mdast@3.0.10/index.d.ts";
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

function createNewImportNode(oldNode: MdxjsEsm, newImportStatement: string): MdxjsEsm {
  const node = {
    ...oldNode,
  };
  if (node.data?.estree?.body[0]?.type === "ImportDeclaration") {
    const newBody = { ...node.data?.estree?.body[0] };
    newBody.source.value = newImportStatement;
    newBody.source.raw = `"${newImportStatement}"`;
    node.data!.estree!.body[0] = newBody;
    node.value = newImportStatement;
    return node;
  } else {
    return oldNode;
  }
}

/**
 * With mdx `evaluate` we can only dynamically import `js` / `jsx` components so we have to navigate the ast
 * find any `mdx` imports, compile them to a temporary file, and replace the import with the one for
 * the temporary file.
 */
const mdxRewriteImports: Plugin<[MdxRewriteImportsOptions], RootWithMdxContent> = (options) => {
  const MdxImportRe = new RegExp(`import .* from ['|"]([\\.\\/\\-$#a-zA-Z0-9]*\\.mdx)['|"];?`, "i");
  return (ast) => {
    for (let node of ast.children) {
      if (node.type === "mdxjsEsm") {
        const match = MdxImportRe.exec(node.value);
        if (match != null && match.length === 2) {
          const absolutePath = join(options.root, match[1]);
          const newImportStatement = options.compiler.compileToCacheSync(absolutePath);
          node = createNewImportNode(node, newImportStatement);
        }
      }
    }
  };
};

export default mdxRewriteImports;
