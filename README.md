# mdx-blog (WIP)

Build a blog with MDX support. Compile to HTML or serve on demand. Right now still a rough work in progress.

## TODO

- [x] MDX options provided by user
- [ ] MDX components
- [ ] Configurable layout
- [ ] Deploy with real blog
- [ ] Cache build files to avoid rebuilds
- [ ] On demand render with server
- [ ] is `compile` then `run` better than `evaluate`?

### Support importing mdx components from other mdx components

Since we can dynamically import js components this should be possible although its a bit tricky right now since we are converting it straight to html.

1. Run esm lexer on file to detect any `.mdx` imports
2. For each of the detected imports we determine it's absolute path based on where it was imported from
3. If that path exists in the cache, we return the cached value.
4. If path does not exists we compile the `.mdx` component and save it to a temporary file, storing that path in the hashmap
5. The import specifiers from `#2` are rewritten to these temporary paths

NOTE: We need to handle nested
