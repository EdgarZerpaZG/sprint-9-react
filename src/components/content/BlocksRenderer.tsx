import type { Block } from "../../types/contentTypes";
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
        // HEADING
        if (block.type === "heading") {
          const level = block.data.level ?? 2;
          const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

          return (
            <Tag key={block.id} className="font-semibold mt-4">
              {block.data.text}
            </Tag>
          );
        }

        // PARAGRAPH
        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="text-base leading-relaxed">
              {block.data.text}
            </p>
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

        // HERO
        if (block.type === "hero") {
          const { title, subtitle, buttonLabel, buttonUrl, align, backgroundImagePath } =
            block.data;

          const bgUrl =
            backgroundImagePath && backgroundImagePath !== ""
              ? getPublicImageUrl(backgroundImagePath)
              : null;

          // alignment classes
          const alignText =
            align === "center"
              ? "text-center items-center"
              : align === "right"
              ? "text-right items-end"
              : "text-left items-start";

          return (
            <section
              key={block.id}
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-linear-to-r from-emerald-600/80 to-emerald-400/80 px-6 py-10 text-slate-50"
            >
              {/* Optional background image overlay */}
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
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {title}
                  </h1>

                  {subtitle && (
                    <p className="text-sm md:text-base text-emerald-50/90 max-w-xl">
                      {subtitle}
                    </p>
                  )}
                </div>

                {buttonLabel && buttonUrl && (
                  <div
                    className={`mt-2 flex ${
                      align === "center"
                        ? "justify-center"
                        : align === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <a
                      href={buttonUrl}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-4 py-2 text-sm font-medium hover:bg-slate-900 transition-colors"
                    >
                      {buttonLabel}
                    </a>
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}