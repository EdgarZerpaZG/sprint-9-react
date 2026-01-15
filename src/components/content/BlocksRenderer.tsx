import type { Block, HeroBlock, ColumnsBlock } from "../../types/contentTypes";
import { getPublicImageUrl } from "../../utils/images";

type Props = {
  blocks: Block[];
};

export default function BlocksRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-400 text-sm">No content yet.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        // TITLE
        if (block.type === "title") {
          const rawLevel = block.data.level ?? 2;
          const level = Math.min(Math.max(rawLevel, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
          const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

          const align = block.data.align ?? "left";
          const alignClass =
            align === "center"
              ? "text-center"
              : align === "right"
              ? "text-right"
              : "text-left";

          return (
            <Tag
              key={block.id}
              className={`font-semibold mt-4 ${alignClass}`}
            >
              {block.data.text}
            </Tag>
          );
        }

        // PARAGRAPH
        if (block.type === "paragraph") {
          const align = block.data.align ?? "left";
          const alignClass =
            align === "center"
              ? "text-center"
              : align === "right"
              ? "text-right"
              : "text-left";
          return (
            <p key={block.id} className={`text-base leading-relaxed ${alignClass}`}>
              {block.data.text}
            </p>
          );
        }

        // RICHTEXT
        if (block.type === "richtext") {
          return (
            <div
              key={block.id}
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: block.data.content }}
            />
          );
        }

        // IMAGE
        if (block.type === "image") {
          const url = getPublicImageUrl(block.data.path);
          return (
            <figure key={block.id} className="my-4">
              <img
                src={url}
                alt={block.data.alt || ""}
                loading="lazy"
                className="max-w-full rounded-md"
              />
              {block.data.alt && (
                <figcaption className="text-xs text-slate-500 mt-1">
                  {block.data.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // DIVIDER
        if (block.type === "divider") {
          return <hr key={block.id} className="border-slate-700/60 my-6" />;
        }

        // HERO
        if (block.type === "hero") {
          return <HeroSection key={block.id} block={block} />;
        }

        // COLUMNS
        if (block.type === "columns") {
          return <ColumnsSection key={block.id} block={block} />;
        }

        // Fallback (unknown block type)
        return null;
      })}
    </div>
  );
}

/**
 * HERO SECTION
 */
function HeroSection({ block }: { block: HeroBlock }) {
  const rawData: any = block.data ?? {};

  const title: string =
    rawData.title || rawData.text || "Welcome to our shelter";

  const subtitle: string | undefined = rawData.subtitle;
  const buttonLabel: string | undefined = rawData.buttonLabel;
  const buttonUrl: string | undefined = rawData.buttonUrl;
  const align: "left" | "center" | "right" | undefined = rawData.align;
  const backgroundImagePath: string | null | undefined =
    rawData.backgroundImagePath;

  const bgUrl =
    backgroundImagePath && backgroundImagePath !== ""
      ? getPublicImageUrl(backgroundImagePath)
      : null;

  const alignText =
    align === "center"
      ? "text-center items-center"
      : align === "right"
      ? "text-right items-end"
      : "text-left items-start";

  const buttonJustify =
    align === "center"
      ? "justify-center"
      : align === "right"
      ? "justify-end"
      : "justify-start";

  return (
    <article className="relative overflow-hidden rounded-xl border bg-linear-to-r from-emerald-600/80 to-emerald-400/80 px-6 py-10 text-slate-50">
      {/* Background image optional */}
      {bgUrl && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="relative flex flex-col gap-4 max-w-3xl mx-auto">
        <div className={`flex flex-col gap-3 ${alignText}`}>
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-sm md:text-base text-emerald-50/90 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {buttonLabel && buttonUrl && (
          <div className={`mt-2 flex ${buttonJustify}`}>
            <a
              href={buttonUrl}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-4 py-2 text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              {buttonLabel}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * COLUMNS SECTION
 */
function ColumnsSection({ block }: { block: ColumnsBlock }) {
  const columns = block.data.columns ?? [];

  if (!columns.length) return null;

  return (
    <section>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="space-y-3">
            {col.blocks?.map((inner) => {
              if (inner.type === "title") {
                const rawLevel = inner.data.level ?? 3;
                const level = Math.min(
                  Math.max(rawLevel, 1),
                  6
                ) as 1 | 2 | 3 | 4 | 5 | 6;
                const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

                const align = inner.data.align ?? "left";
                const alignClass =
                  align === "center"
                    ? "text-center"
                    : align === "right"
                    ? "text-right"
                    : "text-left";

                return (
                  <Tag
                    key={inner.id}
                    className={`font-semibold text-sm md:text-base ${alignClass}`}
                  >
                    {inner.data.text}
                  </Tag>
                );
              }

              if (inner.type === "paragraph") {

                const align = inner.data.align ?? "left";
                const alignClass =
                  align === "center"
                    ? "text-center"
                    : align === "right"
                    ? "text-right"
                    : "text-left";
                return (
                  <p
                    key={inner.id}
                    className={`text-sm leading-relaxed ${alignClass}`}
                  >
                    {inner.data.text}
                  </p>
                );
              }

              if (inner.type === "image") {
                const url = getPublicImageUrl(inner.data.path);
                return (
                  <figure key={inner.id} className="my-2">
                    <img
                      src={url}
                      alt={inner.data.alt || ""}
                      loading="lazy"
                      className="w-full rounded-md"
                    />
                    {inner.data.alt && (
                      <figcaption className="text-[11px] text-slate-500 mt-1">
                        {inner.data.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              if (inner.type === "divider") {
                return (
                  <hr
                    key={inner.id}
                    className="border-slate-700/60 my-4"
                  />
                );
              }

              if (inner.type === "richtext") {
                return (
                  <div
                    key={inner.id}
                    className="prose prose-slate max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: inner.data.content,
                    }}
                  />
                );
              }

              if (inner.type === "hero" || inner.type === "columns") {
                return null;
              }

              return null;
            })}
          </div>
        ))}
      </div>
    </section>
  );
}