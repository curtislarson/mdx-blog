import { mdx } from "../deps.ts";
import { MDXConfig } from "./config.ts";

/**
 * When a `mdx` component imports another `mdx` component we need to perform an intermediary compile step to `jsx`. We can
 * then either inject the compiled jsx back into the importing component or save it to a temporary file and just replace the import statement.
 */
export class MDXCompiler {
  #config;

  #tempFileCache = new Map<string, string>();
  #memoryCache = new Map<string, string>();

  constructor(config: MDXConfig, blogDir: string) {
    this.#config = {
      ...config,
      jsx: true,
      baseUrl: `file://${blogDir}/`,
    };
  }

  compileToTempFile(sourcePath: string) {
    const existing = this.#tempFileCache.get(sourcePath);
    if (existing != null) {
      console.log("Path exists in fs cache: ", sourcePath);
      return existing;
    }

    const outPath = Deno.makeTempFileSync() + ".jsx";
    const content = Deno.readTextFileSync(sourcePath);
    const compiled = mdx.compileSync(content, this.#config);
    Deno.writeTextFileSync(outPath, compiled.value);
    this.#tempFileCache.set(sourcePath, outPath);

    return outPath;
  }

  /** This doesn't work correctly yet */
  compileToMemory(sourcePath: string) {
    const existing = this.#memoryCache.get(sourcePath);
    if (existing != null) {
      console.log("Path exists in memory cache: ", sourcePath);
      return existing;
    }

    const content = Deno.readTextFileSync(sourcePath);
    const compiled = mdx.compileSync(content, this.#config);
    this.#memoryCache.set(sourcePath, compiled.value);

    return compiled.value;
  }
}
