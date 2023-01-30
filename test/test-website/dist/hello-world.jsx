/*@jsxRuntime automatic @jsxImportSource https://esm.quack.id/preact@10.11.3*/
import {useMDXComponents as _provideComponents} from "https://esm.quack.id/@mdx-js/preact@2.1.2";
function _createMdxContent(props) {
  const _components = Object.assign({
    p: "p"
  }, _provideComponents(), props.components);
  return <_components.p>{"Hello World"}</_components.p>;
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = Object.assign({}, _provideComponents(), props.components);
  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
}
export default MDXContent;
