/** @jsx h */
import Post from "./components/Post.tsx";
import { ensureDirSync, frontmatter, serve, walkSync, basename, join, h, dirname, renderToString } from "../deps.ts";
import { createCSSProcessor } from "./css.ts";
import {
  BlogConfig,
  createBlogConfig,
  createMDXConfig,
  createPathConfig,
  installCompileMdxImportsPlugin,
} from "./config.ts";
import Html from "./Html.tsx";
import Index from "./components/Index.tsx";
import { installShikiPlugin } from "./shiki.ts";
import { MDXCompiler } from "./mdx-compiler.ts";
import { ManifestEntry, PostFrontmatter } from "./types.ts";

export class Blog {
  readonly #pathCfg;
  readonly #cfg;
  readonly #css;

  #manifest;

  constructor(config: BlogConfig) {
    console.log("Init Config", JSON.stringify(config, null, 2));
    this.#pathCfg = createPathConfig(config);
    const mdxConfig = createMDXConfig(config.mdx);
    this.#cfg = createBlogConfig(config, this.#pathCfg, mdxConfig);
    this.#css = createCSSProcessor(this.#cfg.css);
    this.#manifest = this.refreshManifest();
  }

  async build() {
    ensureDirSync(this.#cfg.build.outDir);
    if (this.#cfg.shiki) {
      await installShikiPlugin(this.#cfg.mdx, this.#cfg.shiki);
    }
    const compiler = installCompileMdxImportsPlugin(this.#cfg.mdx, this.#pathCfg);

    console.log(`Collected ${this.#manifest.length} files`);

    /**
     * TODO: Don't build all the files here
     */
    const result = await Promise.all(
      this.#manifest.map(({ filePath }) => this.renderAndWriteToFile(filePath, compiler))
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

  refreshManifest(): ManifestEntry[] {
    const manifest: ManifestEntry[] = [];
    for (const entry of walkSync(this.#cfg.blogDir, { exts: [".md", ".mdx"], includeDirs: false })) {
      const stat = Deno.statSync(entry.path);
      manifest.push({ stat, filePath: entry.path });
    }
    return manifest;
  }

  extractFrontmatter(data: string) {
    if (frontmatter.test(data)) {
      return frontmatter.extract<PostFrontmatter>(data);
    } else {
      return null;
    }
  }

  async renderFile(filePath: string, compiler: MDXCompiler) {
    try {
      const data = await Deno.readTextFile(filePath);
      const meta = this.extractFrontmatter(data);

      console.log("meta", meta);

      const MDXContent = await compiler.evaluate(filePath, data);

      const PostComponent = this.#cfg.html?.postComponent ?? Post;

      const body = renderToString(
        <PostComponent
          title={meta?.attrs.title ?? "Untitled"}
          preview={meta?.attrs.preview}
          author={meta?.attrs.author ?? this.#cfg.author}
          date={meta?.attrs.date}
          tags={meta?.attrs.tags}
          theme={this.#cfg.css?.theme}
        >
          <MDXContent />
        </PostComponent>
      );
      const css = await this.#css.generate(body);
      const purged = await this.#css.purge(body, css);
      return this.#renderHtml(body, purged);
    } catch (e) {
      console.error("Error in renderFile", e);
      throw e;
    }
  }

  async renderAndWriteToFile(filePath: string, compiler: MDXCompiler) {
    try {
      const html = await this.renderFile(filePath, compiler);

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
    this.#manifest = this.refreshManifest();

    const mostRecent = this.getMostRecentPosts();

    const body = renderToString(
      <Index
        avatar={this.#cfg.index?.avatar}
        description={this.#cfg.index?.description}
        title={this.#cfg.index?.title ?? this.#cfg.html?.title}
        footer={this.#cfg.index?.footer}
        header={this.#cfg.index?.header}
        theme={this.#cfg.css?.theme}
        posts={mostRecent}
      />
    );
    const css = await this.#css.generate(body);
    const purged = await this.#css.purge(body, css);
    return this.#renderHtml(body, purged);
  }

  #renderHtml(body: string, purgedCss: { css: string }[]) {
    return renderToString(
      <Html
        title={this.#cfg.html?.title}
        links={this.#cfg.html?.links}
        meta={this.#cfg.html?.meta}
        theme={this.#cfg.css?.theme}
        body={body}
        styles={(this.#cfg.html?.styles ?? []).concat(purgedCss.map((p) => p.css))}
      />
    );
  }

  /**
   * We could go off of file stat metrics like creation time or last edit time.
   * Also could use more expensive frontmatter or filename heuristics
   */
  getMostRecentPosts(topN: number = 5) {
    const top = this.#manifest.sort((a, b) => {
      if (a.stat.birthtime) {
        return b.stat.birthtime ? (b.stat.birthtime > a.stat.birthtime ? 1 : -1) : -1;
      } else if (b.stat.birthtime) {
        return 1;
      }
      return 0;
    });
    return top.slice(0, topN).map((t) => {
      const data = Deno.readTextFileSync(t.filePath);
      const frontmatter = this.extractFrontmatter(data);
      const dateOrBirth = frontmatter?.attrs.date ?? t.stat.birthtime;
      return {
        ...t,
        title: frontmatter?.attrs.title ?? basename(t.filePath),
        href: t.filePath.replace(this.#cfg.blogDir, "").replace(/\.mdx?$/, ""),
        preview: frontmatter?.attrs.preview,
        tags: frontmatter?.attrs.tags,
        author: frontmatter?.attrs.author ?? this.#cfg.author,
        date: dateOrBirth ? new Date(dateOrBirth) : undefined,
        frontmatter,
      };
    });
  }

  async serve() {
    if (this.#cfg.shiki) {
      await installShikiPlugin(this.#cfg.mdx, this.#cfg.shiki);
    }
    const compiler = installCompileMdxImportsPlugin(this.#cfg.mdx, this.#pathCfg);

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
          const html = await this.renderFile(path, compiler);
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
