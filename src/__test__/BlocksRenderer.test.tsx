import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlocksRenderer from "../components/content/BlocksRenderer";
import type { Block } from "../types/contentTypes";

vi.mock("../utils/images", () => ({
  getPublicImageUrl: (path: string) => `https://mock.cdn/${path}`,
}));

describe("BlocksRenderer", () => {
  it("renders title, paragraph and image blocks", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "title",
        data: { text: "Hello world", level: 2 },
      },
      {
        id: "2",
        type: "paragraph",
        data: { text: "This is a paragraph." },
      },
      {
        id: "3",
        type: "image",
        data: { path: "img.jpg", alt: "A cat" },
      },
    ];

    render(<BlocksRenderer blocks={blocks} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
    const img = screen.getByAltText("A cat") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("https://mock.cdn/img.jpg");
  });

  it("renders a hero block with title, subtitle and button", () => {
    const blocks: Block[] = [
        {
        id: "hero-1",
        type: "hero",
        data: {
            title: "Adopt a friend",
            subtitle: "Find your new best friend at our shelter.",
            buttonLabel: "See animals",
            buttonUrl: "/pages/adopt",
            align: "center",
        },
        },
    ];

    render(<BlocksRenderer blocks={blocks} />);

    expect(screen.getByText("Adopt a friend")).toBeInTheDocument();
    expect(
        screen.getByText("Find your new best friend at our shelter.")
    ).toBeInTheDocument();
    const btn = screen.getByRole("link", { name: /see animals/i });
    expect(btn).toHaveAttribute("href", "/pages/adopt");
    });
    
    it("renders columns block with inner blocks", () => {
    const blocks: Block[] = [
        {
        id: "cols-1",
        type: "columns",
        data: {
            columns: [
            {
                id: "col-1",
                blocks: [
                {
                    id: "h1",
                    type: "title",
                    data: { text: "Column 1", level: 3 },
                },
                {
                    id: "p1",
                    type: "paragraph",
                    data: { text: "First column content" },
                },
                ],
            },
            {
                id: "col-2",
                blocks: [
                {
                    id: "h2",
                    type: "title",
                    data: { text: "Column 2", level: 3 },
                },
                ],
            },
            ],
        },
        },
    ];

    render(<BlocksRenderer blocks={blocks} />);

    expect(screen.getByText("Column 1")).toBeInTheDocument();
    expect(screen.getByText("First column content")).toBeInTheDocument();
    expect(screen.getByText("Column 2")).toBeInTheDocument();
    });
});
