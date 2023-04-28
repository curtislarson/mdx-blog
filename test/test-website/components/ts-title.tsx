import { h } from "../../../deps.ts";
export interface TSTitleProps {
  str: string;
}

export default function TSTitle({ str }: TSTitleProps) {
  return <h1>TS Title with str {str}</h1>;
}
