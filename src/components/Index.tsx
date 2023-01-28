/** @jsx h */
import { h } from "../../deps.ts";
import { IndexConfig } from "../config.ts";
import PostCard, { PostCardProps } from "./PostCard.tsx";

export interface IndexProps extends IndexConfig {
  posts: PostCardProps[];
}

export default function Index({ header, footer, avatar, title, description, posts }: IndexProps) {
  return (
    <div class="home">
      {header || (
        <header class="w-full h-90 lt-sm:h-80 bg-cover bg-center bg-no-repeat">
          <div class="max-w-screen-sm h-full px-6 mx-auto flex flex-col items-center justify-center">
            {avatar && (
              <a
                href="/"
                class={"bg-cover bg-center bg-no-repeat w-25 h-25 border-4 border-white rounded-full"}
                style={{ backgroundImage: `url(${avatar})` }}
              />
            )}
            <h1 class="mt-3 text-4xl text-gray-900 dark:text-gray-100 font-bold">{title ?? "My Blog"}</h1>
            {description && <p class="text-lg text-gray-600 dark:text-gray-400">{description}</p>}
          </div>
        </header>
      )}

      <div class="max-w-screen-sm px-6 mx-auto">
        <div class="pt-16 lt-sm:pt-12 border-t-1 border-gray-300/80">
          {posts.map((post) => (
            <PostCard {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
