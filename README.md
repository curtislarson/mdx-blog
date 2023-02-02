# mdx-blog (WIP)

Build a blog with [MDX](https://mdxjs.com/). Right now still a rough work in progress.

## Features

- Serve a directory and render `mdx` files on the fly
- Compile to html and deploy to a static host.
- Import `jsx` files from `mdx` files.
- Import `mdx` files from `mdx` files using import rewriting
- Frontmatter support
- [shiki](https://github.com/shikijs/shiki) support

## TODO

- [x] MDX options provided by user
- [x] Configurable layout
- [ ] Deploy with real blog
- [ ] Cache build files to avoid rebuilds
- [ ] Serve shouldn't have to save cache files to local file store
- [x] On demand render with server
- [ ] Handle nested `mdx` imports for `evaluate`
- [x] Import MDX Regex will incorrectly replace examples in code blocks
- [ ] Support importing `tsx` components from `mdx`
- [x] Integrate shiki
- [ ] DaisyUI support broke shiki :(
- [ ] Support a documentation like website format
- [ ] Basic CLI to allow operations like `init`, `New Post`, etc that can use preferred templates
