export type ContentStatus = "draft" | "published";

export type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "richtext"
  | "hero"
  | "columns";

export type BlockBase = {
  id: string;
  type: BlockType;
};

// Heading block
export type HeadingBlock = BlockBase & {
  type: "heading";
  data: {
    text: string;
    level: 1 | 2 | 3;
  };
};

// Simple paragraph
export type ParagraphBlock = BlockBase & {
  type: "paragraph";
  data: {
    text: string;
  };
};

// Single image block
export type ImageBlock = BlockBase & {
  type: "image";
  data: {
    path: string;
    alt?: string;
  };
};

// Rich text block
export type RichTextBlock = BlockBase & {
  type: "richtext";
  data: {
    content: string;
  };
};

// Hero block
export type HeroBlock = BlockBase & {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    align?: "left" | "center" | "right";
    backgroundImagePath?: string | null;
  };
};

// Column item
export type ColumnItem = {
  id: string;
  blocks: Block[];
};

// Columns block
export type ColumnsBlock = BlockBase & {
  type: "columns";
  data: {
    columns: ColumnItem[];
  };
};

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | RichTextBlock
  | HeroBlock
  | ColumnsBlock;

export type SeoData = {
  title?: string;
  description?: string;
  keywords?: string[];
};

// Page row (tal como lo tienes en Supabase)
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

// Post row (hereda de PageRow con categoría opcional)
export type PostRow = PageRow & {
  category?: string | null;
};