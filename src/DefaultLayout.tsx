/** @jsx h  */
import { h } from "../deps.ts";

export default function DefaultLayout(props: { children?: any }) {
  return (
    <div class="relative w-full px-6 py-12 bg-white shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28">
      <article class="text-base prose prose-truegray">{props.children}</article>
    </div>
  );
}
