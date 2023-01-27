import { mdx } from "../deps.ts";
import { MDXConfig } from "./config.ts";

/**
 * When a `mdx` component imports another `mdx` component we need to performa an intermediary compile step to `jsx`. This
 * cache helps keep track of which components we have previously compiled and where they are located.
 */
export class ComponentCache extends Map<string, Promise<string>> {
  #config;

  constructor(config: MDXConfig, blogDir: string) {
    super();
    this.#config = {
      ...config,
      jsx: true,
      baseUrl: `file://${blogDir}/`,
    };
  }

  compileToCache(sourcePath: string) {
    const existing = this.get(sourcePath);
    if (existing != null) {
      return existing;
    }

    const outPath = Deno.makeTempFileSync() + ".jsx";
    const p = Deno.readTextFile(sourcePath).then((content) =>
      mdx.compile(content, this.#config).then((v) => Deno.writeTextFile(outPath, v.value)).then(() => outPath)
    );
    this.set(sourcePath, p);
    return p;
  }
}
