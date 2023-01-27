/** @jsx h */
import DefaultLayout from "./DefaultLayout.tsx";
import {
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
import { createLexer } from "./lexer.ts";
import { ComponentCache } from "./component-cache.ts";
import { BlogConfig, createBlogConfig } from "./config.ts";
import Html from "./Html.tsx";

export class Blog {
  readonly #cfg;
  readonly #css;
  readonly #compileCache;

  #lexer!: (source: string) => { specifier: string; absolute: string }[];

  constructor(config: BlogConfig) {
    this.#cfg = createBlogConfig(config);
    this.#css = createUnoCSSGenerator(this.#cfg.css);
    this.#compileCache = new ComponentCache(this.#cfg.mdx, this.#cfg.blogDir);

    createLexer(this.#cfg.blogDir).then((l) => {
      this.#lexer = l;
    });
  }

  async build() {
    ensureDirSync(this.#cfg.build.outDir);

    const manifest: string[] = [];
    for (const entry of walkSync(this.#cfg.blogDir, { exts: [".md", ".mdx"], includeDirs: false })) {
      manifest.push(entry.path);
    }

    console.log(`Collected ${manifest.length} files`);

    /**
     * TODO: Don't build all the files here
     */
    const result = await Promise.all(manifest.map((filePath) => this.buildFile(filePath)));

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

  async buildFile(filePath: string) {
    try {
      let data = await Deno.readTextFile(filePath);
      const mdxImports = this.#lexer(data);
      const fromTos = await Promise.all(
        mdxImports.map(async (m) => ({ from: m.specifier, to: await this.#compileCache.compileToCache(m.absolute) }))
      );

      fromTos.forEach((ft) => (data = data.replaceAll(ft.from, ft.to)));
      const { default: MDXContent } = await mdx.evaluate(data, {
        ...this.#cfg.mdx,
        baseUrl: `file://${this.#cfg.blogDir}/`,
      });

      const body = renderToString(
        <DefaultLayout>
          <MDXContent />
        </DefaultLayout>
      );
      const css = await this.#css(body);
      const html = renderToString(
        <Html body={body} styles={[css]} title="Blog" meta={{ description: "Blog Description" }} />
      );

      const outFilePath = join(this.#cfg.build.outDir, basename(filePath).replace(/\.mdx?$/, ".html"));
      ensureDirSync(dirname(outFilePath));
      await Deno.writeTextFile(outFilePath, `<!DOCTYPE html>${html}`);

      console.log(`OK: ${outFilePath}`);

      return { ok: true as const, outFilePath };
    } catch (e) {
      console.error(e);
      return { ok: false as const, filePath };
    }
  }

  async serve() {
    return await serve((req) => {
      return serveDir(req, {
        ...this.#cfg.server,
        fsRoot: this.#cfg.root,
      });
    });
  }
}
