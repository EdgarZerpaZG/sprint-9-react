import type { Block, BlockType, ColumnItem } from "../../../types/contentTypes";

const makeId = () => crypto.randomUUID();

export function addBlockToList(type: BlockType, list: Block[]): Block[] {
  switch (type) {
    case "title":
      return [
        ...list,
        {
          id: makeId(),
          type: "title",
          data: { text: "", level: 2 },
        },
      ];

    case "paragraph":
      return [
        ...list,
        {
          id: makeId(),
          type: "paragraph",
          data: { text: "" },
        },
      ];

    case "image":
      return [
        ...list,
        {
          id: makeId(),
          type: "image",
          data: { path: "", alt: "" },
        },
      ];

    case "richtext":
      return [
        ...list,
        {
          id: makeId(),
          type: "richtext",
          data: { content: "" },
        },
      ];

    case "hero":
      return [
        ...list,
        {
          id: makeId(),
          type: "hero",
          data: {
            title: "Welcome to our Management",
            subtitle: "Build your website as you like.",
            buttonLabel: "See our content",
            buttonUrl: "/pages/adopt",
            align: "left",
            backgroundImagePath: null,
          },
        },
      ];

    case "columns": {
      const col = (): ColumnItem => ({
        id: makeId(),
        blocks: [],
      });

      return [
        ...list,
        {
          id: makeId(),
          type: "columns",
          data: {
            columns: [col(), col()],
          },
        },
      ];
    }

    case "divider":
      return [
        ...list,
        {
          id: makeId(),
          type: "divider",
          data: {},
        },
      ];

    default: {
      const _never: never = type;
      console.warn("Unhandled block type in addBlockToList:", _never);
      return list;
    }
  }
}