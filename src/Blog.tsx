/** @jsx h */
import Post from "./components/Post.tsx";
import {
  mdx,
  ensureDirSync,
  frontmatter,
  serve,
  walkSync,
  basename,
  join,
  h,
  dirname,
  renderToString,
} from "../deps.ts";
import { createUnoCSSGenerator } from "./unocss.ts";
import { createLexer } from "./lexer.ts";
import { ComponentCache } from "./component-cache.ts";
import { BlogConfig, createBlogConfig } from "./config.ts";
import Html from "./Html.tsx";
import Index from "./components/Index.tsx";

export interface PostFrontmatter extends Record<string, unknown> {
  title?: string;
  preview?: string;
  tags?: string[];
}

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
    const result = await Promise.all(manifest.map((filePath) => this.renderAndWriteToFile(filePath)));

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

  async replaceMdxImports(data: string) {
    const mdxImports = await Promise.all(
      this.#lexer(data).map(async (m) => ({
        from: m.specifier,
        to: await this.#compileCache.compileToCache(m.absolute),
      }))
    );

    mdxImports.forEach((ft) => (data = data.replaceAll(ft.from, ft.to)));

    return data;
  }

  extractFrontmatter(data: string) {
    if (frontmatter.test(data)) {
      return frontmatter.extract<PostFrontmatter>(data);
    } else {
      return null;
    }
  }

  async renderFile(filePath: string) {
    try {
      let data = await Deno.readTextFile(filePath);
      data = await this.replaceMdxImports(data);
      const meta = this.extractFrontmatter(data);

      const { default: MDXContent } = await mdx.evaluate(data, {
        ...this.#cfg.mdx,

        baseUrl: `file://${this.#cfg.blogDir}/`,
      });

      const PostComponent = this.#cfg.html?.postComponent ?? Post;

      const body = renderToString(
        <PostComponent title={meta?.attrs.title} preview={meta?.attrs.preview}>
          <MDXContent />
        </PostComponent>
      );
      const css = await this.#css(body);
      const html = renderToString(
        <Html
          title={this.#cfg.html?.title}
          links={this.#cfg.html?.links}
          meta={this.#cfg.html?.meta}
          body={body}
          styles={(this.#cfg.html?.styles ?? []).concat(css)}
        />
      );
      return html;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async renderAndWriteToFile(filePath: string) {
    try {
      const html = await this.renderFile(filePath);

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

  async renderIndex() {
    const body = renderToString(
      <Index
        avatar={this.#cfg.index?.avatar}
        description={this.#cfg.index?.description}
        title={this.#cfg.index?.title ?? this.#cfg.html?.title}
        footer={this.#cfg.index?.footer}
        header={this.#cfg.index?.header}
        posts={[]}
      />
    );
    const css = await this.#css(body);
    const html = renderToString(
      <Html
        title={this.#cfg.html?.title}
        links={this.#cfg.html?.links}
        meta={this.#cfg.html?.meta}
        body={body}
        styles={(this.#cfg.html?.styles ?? []).concat(css)}
      />
    );
    return html;
  }

  async serve() {
    return await serve(async (req) => {
      if (req.method !== "GET") {
        return new Response(null, { status: 404 });
      }
      const { pathname } = new URL(req.url);
      if (pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }
      if (pathname === "/") {
        return new Response(await this.renderIndex(), {
          headers: { "content-type": "text/html" },
          status: 200,
        });
      }
      const filePath = join(this.#cfg.blogDir, pathname);
      console.log("GET", filePath);
      const searchPaths = [`${filePath}.mdx`, `${filePath}.md`];
      for (const path of searchPaths) {
        try {
          const html = await this.renderFile(path);
          return new Response(html, {
            headers: { "content-type": "text/html" },
            status: 200,
          });
        } catch {
          // empty
        }
      }
      return new Response(null, {
        status: 404,
      });
    });
  }
}
