/** @jsx h */
import { h } from "../../deps.ts";

export interface IndexHeaderProps {
  title?: string;
  description?: string;
}

export default function IndexHeader(props: IndexHeaderProps) {
  const { title, description } = props;

  return (
    <header class="w-full h-60 bg-cover bg-center bg-no-repeat">
      <div class="max-w-screen-md h-full px-6 mx-auto flex flex-col items-center justify-center">
        <h1 class="mt-3 text-6xl font-semibold text-white">{title}</h1>
        <h2 class="text-2xl mt-4 font-light text-white">{description}</h2>
      </div>
    </header>
  );
}
