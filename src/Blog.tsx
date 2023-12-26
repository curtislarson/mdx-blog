import Post from "./components/Post.tsx";
import {
  basename,
  debug,
  dirname,
  ensureDir,
  frontmatter,
  h,
  join,
  renderToString,
  serve,
  walkSync,
  extname,
  contentType,
} from "../deps.ts";
import { createCSSProcessor } from "./css.ts";
import {
  BlogConfig,
  createBlogConfig,
  createMDXConfig,
  createPathConfig,
  installCompileMdxImportsPlugin,
} from "./config.ts";
import HTMLDocument from "./components/HTMLDocument.tsx";
import Index from "./components/Index.tsx";
import { installShikiPlugin } from "./shiki.ts";
import { MDXCompiler } from "./mdx-compiler.ts";
import { ManifestEntry, PostFrontmatter, RecentPost } from "./types.ts";

export interface RenderIndexFilter {
  tags?: string[];
}

export interface GetPostsArgs {
  /** @default 5 */
  limit?: number;
  filter?: RenderIndexFilter;
}

const log = debug("@quackware/mdx-static:Blog");

export class Blog {
  readonly #pathCfg;
  readonly #cfg;
  readonly #css;
  readonly #frontMatterCache = new Map<string, PostFrontmatter | null>();

  #manifest;

  constructor(config: BlogConfig) {
    log("Init Config", JSON.stringify(config, null, 2));
    this.#pathCfg = createPathConfig(config);
    const mdxConfig = createMDXConfig(config.mdx);
    this.#cfg = createBlogConfig(config, this.#pathCfg, mdxConfig);
    this.#css = createCSSProcessor(this.#cfg.css);
    this.#manifest = this.refreshManifest();
  }

  async build() {
    await ensureDir(this.#cfg.build.outDir);
    if (this.#cfg.shiki) {
      await installShikiPlugin(this.#cfg.mdx, this.#cfg.shiki);
    }
    const compiler = installCompileMdxImportsPlugin(this.#cfg.mdx, this.#pathCfg);

    log(`Collected ${this.#manifest.length} files`);

    /**
     * TODO: Don't build all the files here
     */
    const result = await Promise.all(
      this.#manifest.map(({ filePath }) => this.renderAndWriteToFile(filePath, compiler)),
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
      [[], []],
    );

    log(`# OK: ${okBuilds.length}`);
    log(`# BAD: ${badBuilds.length}`);
  }

  /**
   * Walks the blog directory to find the published posts and returns them ordered by most recent birthtime.
   */
  refreshManifest(): ManifestEntry[] {
    const manifest: ManifestEntry[] = [];
    for (const entry of walkSync(this.#cfg.blogDir, {
      exts: [".md", ".mdx"],
      includeDirs: false,
    })) {
      const stat = Deno.statSync(entry.path);
      manifest.push({ stat, filePath: entry.path });
    }
    return manifest.sort((a, b) => {
      if (a.stat.birthtime) {
        return b.stat.birthtime ? (b.stat.birthtime > a.stat.birthtime ? 1 : -1) : -1;
      } else if (b.stat.birthtime) {
        return 1;
      }
      return 0;
    });
  }

  extractFrontmatter(filePath: string, data: string) {
    const existing = this.#frontMatterCache.get(filePath);
    if (existing !== undefined) {
      return existing;
    }
    if (frontmatter.test(data)) {
      const extracted = frontmatter.extract<PostFrontmatter>(data);
      this.#frontMatterCache.set(filePath, extracted.attrs);
      return extracted.attrs;
    } else {
      this.#frontMatterCache.set(filePath, null);
      return null;
    }
  }

  async renderFile(filePath: string, compiler: MDXCompiler) {
    try {
      const data = await Deno.readTextFile(filePath);
      const meta = this.extractFrontmatter(filePath, data);

      const MDXContent = await compiler.evaluate(filePath, data);

      const PostComponent = this.#cfg.html?.postComponent ?? Post;

      const body = renderToString(
        <PostComponent
          title={meta?.title ?? "Untitled"}
          preview={meta?.preview}
          author={meta?.author ?? this.#cfg.author}
          date={meta?.date}
          tags={meta?.tags}
          theme={this.#cfg.css?.theme}
        >
          <MDXContent />
        </PostComponent>,
      );
      const css = await this.#css.generate(body);
      const purged = await this.#css.purge(body, css);
      return this.#renderHtml(body, purged);
    } catch (e) {
      log("ERR:", "Error in renderFile", e);
      throw e;
    }
  }

  async renderAndWriteToFile(filePath: string, compiler: MDXCompiler) {
    try {
      const html = await this.renderFile(filePath, compiler);
      const outFilePath = join(this.#cfg.build.outDir, basename(filePath).replace(/\.mdx?$/, ".html"));
      await ensureDir(dirname(outFilePath));
      await Deno.writeTextFile(outFilePath, `<!DOCTYPE html>${html}`);

      log(`OK: ${outFilePath}`);

      return { ok: true as const, outFilePath };
    } catch (e) {
      log("ERR:", e);
      return { ok: false as const, filePath };
    }
  }

  async renderIndex(filter: RenderIndexFilter = {}) {
    this.#manifest = this.refreshManifest();

    const mostRecent = await this.getMostRecentPosts({ filter });

    const body = renderToString(
      <Index
        avatar={this.#cfg.index?.avatar}
        description={this.#cfg.index?.description}
        title={this.#cfg.index?.title ?? this.#cfg.html?.title}
        footer={this.#cfg.index?.footer}
        header={this.#cfg.index?.header}
        theme={this.#cfg.css?.theme}
        posts={mostRecent}
        tags={filter.tags}
      />,
    );
    const css = await this.#css.generate(body);
    const purged = await this.#css.purge(body, css);
    return this.#renderHtml(body, purged);
  }

  #renderHtml(body: string, purgedCss: { css: string }[]) {
    const html = renderToString(
      <HTMLDocument
        title={this.#cfg.html?.title}
        links={this.#cfg.html?.links}
        meta={this.#cfg.html?.meta}
        theme={this.#cfg.css?.theme}
        body={body}
        styles={(this.#cfg.html?.styles ?? []).concat(purgedCss.map((p) => p.css))}
      />,
    );
    return `<!DOCTYPE html>${html}`;
  }

  /**
   * We could go off of file stat metrics like creation time or last edit time.
   * Also could use more expensive frontmatter or filename heuristics
   */
  async getMostRecentPosts(args: GetPostsArgs = {}) {
    const limit = args.limit ?? 5;
    const mostRecentPosts: RecentPost[] = [];
    for (let i = 0; i < this.#manifest.length; i++) {
      const post = this.#manifest[i];
      const data = Deno.readTextFileSync(post.filePath);
      const frontmatter = await this.extractFrontmatter(post.filePath, data);
      if (frontmatter?.tags && frontmatter.tags.length > 0) {
        const fmTags = frontmatter.tags;
        // This post has tags
        if (args.filter?.tags && args.filter.tags.length > 0) {
          // We are filtering by tag(s)
          if (!args.filter.tags.some((tag) => fmTags.includes(tag))) {
            // And none of the filter tags match the post's tags, so we skip
            continue;
          }
          // We match the tags if we reached this point, so proceed
        }
        // We either match the tags or no tags provided, so proceed
      } else if (args.filter?.tags && args.filter?.tags.length > 0) {
        // Post has no tags but we are filtering by 1+ tag, so we skip
        continue;
      }
      // If we reach this point we didn't skip, so add post
      const dateOrBirth = frontmatter?.date ?? post.stat.birthtime;
      mostRecentPosts.push({
        ...post,
        title: frontmatter?.title ?? basename(post.filePath),
        href: post.filePath.replace(this.#cfg.blogDir, "").replace(/\.mdx?$/, ""),
        preview: frontmatter?.preview,
        tags: frontmatter?.tags,
        author: frontmatter?.author ?? this.#cfg.author,
        date: dateOrBirth ? new Date(dateOrBirth) : undefined,
        frontmatter,
      });
      // Inside the for loop we return early if we hit our post limit before iterating all of them
      if (mostRecentPosts.length >= limit) {
        return mostRecentPosts;
      }
    }
    return mostRecentPosts;
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

      log("Req", req.url);

      const { pathname } = new URL(req.url);
      const extension = extname(pathname);
      if (pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }
      if (pathname === "/") {
        return new Response(await this.renderIndex(), {
          headers: { "content-type": "text/html" },
          status: 200,
        });
      }
      if (pathname.startsWith("/tags/")) {
        const tags = pathname.replace("/tags/", "").split(",");
        log("Filtering on tags", tags);
        return new Response(await this.renderIndex({ tags }), {
          headers: { "content-type": "text/html" },
          status: 200,
        });
      }
      const filePath = join(this.#cfg.blogDir, pathname);
      log("GET", filePath);

      // Serve any files we know the content type for
      const fileContentType = contentType(extension);
      if (fileContentType) {
        const file = await Deno.readFile(filePath);
        return new Response(file, {
          headers: { "Content-Type": fileContentType },
        });
      }

      // Search for mdx or md files that we need to render (this is the case if they dont provide extension name)
      const searchPaths = [`${filePath}.mdx`, `${filePath}.md`];
      for (const path of searchPaths) {
        try {
          const html = await this.renderFile(path, compiler);
          return new Response(html, {
            headers: { "content-type": "text/html" },
            status: 200,
          });
        } catch (e) {
          log("failed with", e);
          // empty
        }
      }

      return new Response(null, {
        status: 404,
      });
    });
  }
}
