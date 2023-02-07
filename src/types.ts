export interface PostFrontmatter extends Record<string, unknown> {
  title: string;
  preview?: string;
  date?: string | Date;
  author?: string;
  tags?: string[];
}

export interface ManifestEntry {
  filePath: string;
  stat: Deno.FileInfo;
}
