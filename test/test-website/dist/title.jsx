/*@jsxRuntime automatic @jsxImportSource https://esm.quack.id/preact@10.11.3*/
import {useMDXComponents as _provideComponents} from "https://esm.quack.id/@mdx-js/preact@2.1.2";
const MDXLayout = function Title() {
  const _components = Object.assign({
    h1: "h1"
  }, _provideComponents());
  return <_components.h1>This is a title</_components.h1>;
};
function _createMdxContent(props) {
  return <></>;
}
function MDXContent(props = {}) {
  return <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout>;
}
export default MDXContent;
