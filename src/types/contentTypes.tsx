export type ContentStatus = "draft" | "published";

export type BlockType = "heading" | "paragraph" | "image" | "richtext";

export type BlockBase = {
  id: string;
  type: BlockType;
};

export type HeadingBlock = BlockBase & {
  type: "heading";
  data: { text: string; level: 1 | 2 | 3 };
};

export type ParagraphBlock = BlockBase & {
  type: "paragraph";
  data: { text: string };
};

export type ImageBlock = BlockBase & {
  type: "image";
  data: { path: string; alt?: string };
};

export type RichTextBlock = BlockBase & {
  type: "richtext";
  data: {
    content: string; 
  };
};

export type Block = HeadingBlock | ParagraphBlock | ImageBlock | RichTextBlock;

export type SeoData = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type PageRow = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: ContentStatus;
  blocks: Block[];
  seo: SeoData;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type PostRow = PageRow & {
  category?: string | null;
};