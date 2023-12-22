import { IndexConfig } from "../config.ts";
import PostCard, { PostCardProps } from "./PostCard.tsx";
import Footer from "./Footer.tsx";
import IndexHeader from "./IndexHeader.tsx";

export interface IndexProps extends IndexConfig {
  posts: PostCardProps[];
  theme?: string | object;
  tags?: string[];
}

export default function Index({ header, footer, avatar, title, description, posts, theme, tags }: IndexProps) {
  return (
    <div class="home" data-theme={theme}>
      {header || <IndexHeader title={title} avatar={avatar} description={description} tags={tags} />}
      <div class="max-w-screen-md px-6 mx-auto">
        <div class="pt-2 lt-sm:pt-12">
          {posts.map((post) => (
            <PostCard {...post} />
          ))}
        </div>
      </div>
      {footer || <Footer />}
    </div>
  );
}
