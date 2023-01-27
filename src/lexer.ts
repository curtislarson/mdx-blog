import * as lexer from "https://esm.quack.id/es-module-lexer@1.1.0";
import { join } from "../deps.ts";

export async function createLexer(root: string) {
  await lexer.init;

  return function getMdxImports(source: string) {
    const [imps] = lexer.parse(source);
    return imps.map((v) => {
      if (v.n == null || !v.n.endsWith(".mdx")) {
        return null;
      }
      return {
        specifier: v.n,
        absolute: join(root, v.n),
      };
    }).filter((v): v is NonNullable<typeof v> => v != null);
  };
}
