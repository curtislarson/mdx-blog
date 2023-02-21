# mdx-static (WIP)

A static site generator using MDX and Deno. Work in progress.

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
- [x] On demand render with server
- [ ] HMR
- [ ] Deploy with real blog
- [ ] Cache build files to avoid rebuilds
- [ ] Serve shouldn't have to save cache files to local file store
- [ ] Handle nested `mdx` imports for `evaluate`
- [ ] Support importing `tsx` components from `mdx`

- [ ] Support a documentation like website format
- [ ] Basic CLI to allow operations like `init`, `New Post`, etc that can use preferred templates
