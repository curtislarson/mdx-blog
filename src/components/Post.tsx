/** @jsx h */
import { h } from "../../deps.ts";

export interface PostProps {
  children: any;
  title?: string;
  preview?: string;
}

export default function Post(props: PostProps) {
  return (
    <div class="relative mt-5 w-full px-6 py-12 bg-white shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28">
      {props.title && (
        <h1 class="block text-3xl text-center leading-8 font-bold tracking-tight text-primary sm:text-4xl">
          {props.title}
        </h1>
      )}
      {props.preview && <p class="mt-8 text-xl text-gray-500 leading-8">{props.preview}</p>}
      <article class="text-base prose prose-truegray">{props.children}</article>
    </div>
  );
}
