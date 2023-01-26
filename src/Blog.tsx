/** @jsx h */
import DefaultLayout from "./DefaultLayout.tsx";
import {
  deepMerge,
  mdx,
  ensureDirSync,
  resolve,
  serve,
  serveDir,
  ServeDirOptions,
  walkSync,
  basename,
  preactRuntime,
  join,
  h,
  dirname,
  remarkFrontmatter,
  remarkMdxFrontmatter,
  renderToString,
  remarkGFM,
} from "../deps.ts";
import { createUnoCSSGenerator, UnoCSSConfig } from "./unocss.ts";

export interface BuildOptions {
  /** @default "dist" */
  outDir?: string;
}

export interface ServerOptions extends Omit<ServeDirOptions, "fsRoot"> {}

export interface BlogConfig {
  /** @default Deno.cwd() */
  root?: string;
  /** @default "blog" */
  blogDir?: string;
  /** @default "/" */
  base?: string;
  /** @default "public" */
  publicDir?: string;
  server?: ServerOptions;
  build?: BuildOptions;
  css?: UnoCSSConfig;
}

type BuildConfig = ReturnType<typeof Blog["prototype"]["getBuildConfig"]>;

export class Blog {
  static DEFAULT_CONFIG = {
    root: Deno.cwd(),
    base: "/",
    blogDir: "blog",
    publicDir: "public",
    server: {},
    build: {},
  };

  readonly #cfg;
  readonly #css;
  constructor(config: BlogConfig) {
    this.#cfg = deepMerge(Blog.DEFAULT_CONFIG, { ...config }) as Required<BlogConfig>;
    this.#css = createUnoCSSGenerator(config.css);
  }

  async build() {
    const config = this.getBuildConfig();

    ensureDirSync(config.absoluteOutDir);

    const manifest: string[] = [];
    for (const entry of walkSync(config.blogDir, { exts: [".md", ".mdx"], includeDirs: false })) {
      manifest.push(entry.path);
    }

    console.log(`Collected ${manifest.length} files`);

    /**
     * TODO: Don't build all the files here
     */
    const result = await Promise.all(
      manifest.map((filePath) =>
        this.buildFile(filePath, config).catch((e) => {
          console.error("Error:", e);
          return { ok: false as const, filePath };
        })
      )
    );

    const [okBuilds, badBuilds] = result.reduce<[string[], string[]]>(
      (acc, curr) => {
        if (curr.ok) {
          acc[0].push(curr.outFilePath);
        } else {
          acc[1].push(curr.filePath);
        }
        return acc;
      },
      [[], []]
    );

    console.log(`# OK: ${okBuilds.length}`);
    console.log(`# BAD: ${badBuilds.length}`);
  }

  async buildFile(filePath: string, config: BuildConfig) {
    const data = await Deno.readTextFile(filePath);
    const { default: MDXContent } = await mdx.evaluate(data, {
      ...preactRuntime,
      outputFormat: "function-body",
      providerImportSource: "https://esm.quack.id/@mdx-js/preact@2.1.2",
      jsxImportSource: "https://esm.quack.id/preact@10.11.3",
      baseUrl: `file://${config.blogDir}/`,
      useDynamicImport: true,
      remarkPlugins: [remarkFrontmatter as any, remarkMdxFrontmatter, remarkGFM],
    });

    const body = renderToString(
      <DefaultLayout>
        <MDXContent />
      </DefaultLayout>
    );
    const css = await this.#css(body);
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Blog</title>
        <style>${css}</style>
      </head>
      <body>
        ${body}
      </body>
    </html>
    `;

    const base = basename(filePath);
    const outFilePath = join(config.absoluteOutDir, base.replace(/\.mdx?$/, ".html"));
    ensureDirSync(dirname(outFilePath));
    await Deno.writeTextFile(outFilePath, html);

    console.log(`OK: ${outFilePath}`);

    return { ok: true as const, outFilePath };
  }

  async serve() {
    return await serve((req) => {
      return serveDir(req, {
        ...this.#cfg.server,
        fsRoot: this.#cfg.root,
      });
    });
  }

  getBuildConfig() {
    return {
      absoluteOutDir: resolve(this.#cfg.root, this.#cfg.build.outDir ?? "dist"),
      root: this.#cfg.root,
      blogDir: resolve(this.#cfg.root, this.#cfg.blogDir ?? "blog"),
    };
  }
}
