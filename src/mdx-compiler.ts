import { MDXContent } from "https://esm.quack.id/v104/@types/mdx@2.0.3/types.d.ts";
import { basename, join, mdx, preactRuntime } from "../deps.ts";
import { MDXConfig } from "./config.ts";

export interface MDXCompilerOptions {
  blogDir: string;
  /** @default Deno.makeTempDirSync() */
  outDir?: string;
}

/**
 * When a `mdx` component imports another `mdx` component we need to perform an intermediary compile step to `jsx`. We can
 * then either inject the compiled jsx back into the importing component or save it to a temporary file and just replace the import statement.
 */
export class MDXCompiler {
  #config;
  #outDir;

  #tempFileCache = new Map<string, string>();
  #memoryCache = new Map<string, MDXContent>();

  constructor(config: MDXConfig, opts: MDXCompilerOptions) {
    this.#config = {
      ...config,
      baseUrl: `file://${opts.blogDir}/`,
    };
    this.#outDir = opts.outDir ?? Deno.makeTempDirSync();
  }

  compileToTempFile(sourcePath: string) {
    const existing = this.#tempFileCache.get(sourcePath);
    if (existing != null) {
      console.log("Path exists in fs cache: ", sourcePath);
      return existing;
    }

    const originalName = basename(sourcePath);
    const outPath = join(this.#outDir, originalName.replace(/\.mdx?$/, ".jsx"));
    const content = Deno.readTextFileSync(sourcePath);
    const compiled = mdx.compileSync(content, { ...this.#config, jsx: true });
    Deno.writeTextFileSync(outPath, compiled.value);
    this.#tempFileCache.set(sourcePath, outPath);

    return outPath;
  }

  async evaluate(sourcePath: string, data?: string) {
    const existing = this.#memoryCache.get(sourcePath);
    if (existing != null) {
      console.log("Path exists in memory cache: ", sourcePath);
      return existing;
    }

    data ??= await Deno.readTextFile(sourcePath);
    const { default: MDXContent } = await mdx.evaluate(data, {
      ...preactRuntime,
      ...this.#config,
    });

    this.#memoryCache.set(sourcePath, MDXContent);
    return MDXContent;
  }

  evaluateSync(sourcePath: string, data?: string) {
    const existing = this.#memoryCache.get(sourcePath);
    if (existing != null) {
      console.log("MDXContent exists in memory cache: ", sourcePath);
      return existing;
    }

    data ??= Deno.readTextFileSync(sourcePath);
    const { default: MDXContent } = mdx.evaluateSync(data, {
      ...preactRuntime,
      ...this.#config,
    });
    this.#memoryCache.set(sourcePath, MDXContent);

    return MDXContent;
  }
}
