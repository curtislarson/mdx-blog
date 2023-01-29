import { join } from "../deps.ts";

export function createLexer(root: string) {
  return function getMdxImports(source: string) {
    const MdxImportRe = new RegExp(`import .* from ['|"]([\\.\\/\\-$#a-zA-Z0-9]*\\.mdx)['|"];?`, "i");
    try {
      const arr = MdxImportRe.exec(source);
      if (arr == null) {
        return [];
      }
      return arr.slice(1).map((importStmt) => {
        return {
          specifier: importStmt,
          absolute: join(root, importStmt),
        };
      });
    } catch (e) {
      console.error("creatLexer error", e);
      throw e;
    }
  };
}
