# mdx-blog (WIP)

Build a blog with [MDX](https://mdxjs.com/). Right now still a rough work in progress.

## Features

- Serve a directory and render `mdx` files on the fly
- Compile to html and deploy to a static host.
- Import `mdx` or `jsx` files from other `mdx` files.
- Frontmatter support

## TODO

- [x] MDX options provided by user
- [x] Configurable layout
- [ ] Deploy with real blog
- [ ] Cache build files to avoid rebuilds
- [x] On demand render with server
- [ ] Handle nested `mdx` imports for `evaluate`
- [ ] Support a documentation like website format
- [ ] Basic CLI to allow operations like `init`, `New Post`, etc that can use preferred templates
