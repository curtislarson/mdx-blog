/*@jsxRuntime automatic @jsxImportSource https://esm.quack.id/preact@10.11.3*/
import { useMDXComponents as _provideComponents } from "https://esm.quack.id/@mdx-js/preact@2.1.2";
function _createMdxContent(props) {
  const _components = Object.assign(
    {
      h1: "h1",
    },
    _provideComponents(),
    props.components
  );
  return (
    <>
      <_components.h1>{"Hello"}</_components.h1>
      {"\
"}
      <div>{"wat"}</div>
    </>
  );
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = Object.assign({}, _provideComponents(), props.components);
  return MDXLayout ? (
    <MDXLayout {...props}>
      <_createMdxContent {...props} />
    </MDXLayout>
  ) : (
    _createMdxContent(props)
  );
}
export default MDXContent;
