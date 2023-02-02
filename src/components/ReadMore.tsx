/** @jsx h */
import { h } from "../../deps.ts";

export interface ReadMoreProps {
  href: string;
  title: string;
}

export default function ReadMore(props: ReadMoreProps) {
  return (
    <a class="btn btn-primary m-1" href={props.href} title={`Read "${props.title}"`}>
      Read More
    </a>
  );
}
