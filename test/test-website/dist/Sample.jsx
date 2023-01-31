/*@jsxRuntime automatic @jsxImportSource https://esm.quack.id/preact@10.11.3*/
import {useMDXComponents as _provideComponents} from "https://esm.quack.id/@mdx-js/preact@2.1.2";
const MDXLayout = function Sample() {
  const _components = Object.assign({
    div: "div",
    h1: "h1",
    label: "label"
  }, _provideComponents());
  return <_components.div>
      <_components.h1>Sample</_components.h1>
      <_components.label>Mini Sample</_components.label>
    </_components.div>;
};
function _createMdxContent(props) {
  return <></>;
}
function MDXContent(props = {}) {
  return <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout>;
}
export default MDXContent;
