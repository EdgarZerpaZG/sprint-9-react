import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PageEditor from "../pages/Dashboard/PageEditor";
import * as ReactRouter from "react-router-dom";
import * as PageEditorHook from "../features/content/hooks/editor/usePageEditor";
import * as UsePagesHook from "../features/content/hooks/usePages";
import * as UseUserRoleHook from "../hooks/useUserRole";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("../features/content/hooks/editor/usePageEditor", () => ({
  usePageEditor: vi.fn(),
}));

vi.mock("../features/content/hooks/usePages", () => ({
  usePages: vi.fn(),
}));

vi.mock("../hooks/useUserRole", () => ({
  useUserRole: vi.fn(),
}));

vi.mock("../components/editor/BlocksEditorDnd", () => ({
  __esModule: true,
  default: () => <div data-testid="blocks-editor" />,
}));

describe("PageEditor", () => {
  const mockUseParams = ReactRouter.useParams as unknown as Mock;
  const mockUsePageEditor =
    PageEditorHook.usePageEditor as unknown as Mock;
  const mockUsePages = UsePagesHook.usePages as unknown as Mock;
  const mockUseUserRole =
    UseUserRoleHook.useUserRole as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no pages (empty collections, etc.)
    mockUsePages.mockReturnValue({
      pages: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Default: user is editor (not admin)
    mockUseUserRole.mockReturnValue({
      role: "editor",
      loadingRole: false,
    });
  });

  function setupMockHook(
    overrides?: Partial<ReturnType<typeof mockUsePageEditor>>
  ) {
    const defaultReturn = {
      loading: false,
      saving: false,
      error: null,

      title: "Initial title",
      setTitle: vi.fn(),
      slug: "initial-slug",
      setSlug: vi.fn(),
      excerpt: "Initial excerpt",
      setExcerpt: vi.fn(),
      status: "draft" as const,
      setStatus: vi.fn(),

      type: "main" as const,
      setType: vi.fn(),
      parentCollectionId: null as string | null,
      setParentCollectionId: vi.fn(),

      showTitle: true,
      setShowTitle: vi.fn(),

      blocks: [] as any[],
      coverPath: null as string | null,
      setCoverPath: vi.fn(),

      addBlock: vi.fn(),
      updateBlock: vi.fn(),
      removeBlock: vi.fn(),
      moveBlock: vi.fn(),
      reorderBlocks: vi.fn(),
      save: vi.fn(),
    };

    mockUsePageEditor.mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  }

  // ──────────────────────────────────────────
  // TESTS
  // ──────────────────────────────────────────

  it("shows loading state when loading is true", () => {
    mockUseParams.mockReturnValue({ id: "123" });
    setupMockHook({ loading: true });

    render(<PageEditor />);

    expect(screen.getByText(/Loading page/i)).toBeInTheDocument();
  });

  it("renders 'New Page' when id is 'new'", () => {
    mockUseParams.mockReturnValue({ id: "new" });
    setupMockHook();

    render(<PageEditor />);

    expect(screen.getByText(/New Page/i)).toBeInTheDocument();
    // Updated copy from the component
    expect(
      screen.getByText(/Manage content blocks for this page\./i)
    ).toBeInTheDocument();
  });

  it("renders 'Edit Page' when id is a real id", () => {
    mockUseParams.mockReturnValue({ id: "abc-123" });
    setupMockHook();

    render(<PageEditor />);

    expect(screen.getByText(/Edit Page/i)).toBeInTheDocument();
  });

  it("calls save when clicking 'Save draft' button", () => {
    mockUseParams.mockReturnValue({ id: "new" });
    const saveMock = vi.fn();
    setupMockHook({ save: saveMock });

    render(<PageEditor />);

    // Now the button that calls save() directly is called "Save draft"
    const button = screen.getByRole("button", { name: /Save draft/i });
    fireEvent.click(button);

    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("updates title and slug using setters", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    const setTitle = vi.fn();
    const setSlug = vi.fn();

    setupMockHook({
      setTitle,
      setSlug,
      title: "",
      slug: "",
    });

    render(<PageEditor />);

    const titleInput = screen.getByPlaceholderText(/Page title/i);
    const slugInput = screen.getByPlaceholderText(/page-slug/i);

    fireEvent.change(titleInput, { target: { value: "My new page" } });
    fireEvent.change(slugInput, { target: { value: "my-new-page" } });

    expect(setTitle).toHaveBeenCalledWith("My new page");
    expect(setSlug).toHaveBeenCalledWith("my-new-page");
  });

  it("uses block toolbar buttons to call addBlock with correct types (main/footer = normal)", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    const addBlock = vi.fn();
    setupMockHook({ addBlock, type: "main" });

    render(<PageEditor />);

    // The labels include counters: "+ Hero (0)", etc.
    fireEvent.click(screen.getByRole("button", { name: /\+ Hero/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /\+ Columns/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /\+ Title/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /\+ Paragraph/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /\+ Image/i }));

    expect(addBlock).toHaveBeenCalledTimes(5);
    expect(addBlock).toHaveBeenNthCalledWith(1, "hero");
    expect(addBlock).toHaveBeenNthCalledWith(2, "columns");
    expect(addBlock).toHaveBeenNthCalledWith(3, "title");
    expect(addBlock).toHaveBeenNthCalledWith(4, "paragraph");
    expect(addBlock).toHaveBeenNthCalledWith(5, "image");
  });

  it("shows only Columns button in toolbar when type is 'footer'", () => {
    mockUseParams.mockReturnValue({ id: "new" });
    const addBlock = vi.fn();

    setupMockHook({
      addBlock,
      type: "footer",
    });

    render(<PageEditor />);

    // "+ Columns" exists, the rest don't
    expect(
      screen.getByRole("button", { name: /\+ Columns/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\+ Hero/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\+ Title/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\+ Paragraph/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\+ Image/i })
    ).not.toBeInTheDocument();
  });

  it("hides slug input and shows footer helper when page type is 'footer'", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    setupMockHook({
      type: "footer",
      slug: "footer",
    });

    render(<PageEditor />);

    // The "Slug" label is no longer shown
    expect(screen.queryByText(/Slug/i)).not.toBeInTheDocument();

    // text helper of footer
    expect(
      screen.getByText(
        /The footer is global and rendered at the bottom of all public pages\./i
      )
    ).toBeInTheDocument();
  });

  it("shows 'Collection' selector when type is 'content' and collections exist", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    // Simulate a collection from usePages
    mockUsePages.mockReturnValue({
      pages: [
        {
          id: "col-1",
          author_id: "u1",
          title: "My Collection",
          slug: "my-collection",
          excerpt: null,
          status: "published",
          type: "collection",
          parent_collection_id: null,
          blocks: [],
          seo: {},
          cover_image_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    setupMockHook({
      type: "content",
      parentCollectionId: null,
    });

    render(<PageEditor />);

    // Directamente comprobamos el select por label accesible
    expect(
      screen.getByRole("combobox", { name: /Collection/i })
    ).toBeInTheDocument();
  });

  it("shows correct block counters in toolbar buttons (e.g. heroCount)", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    setupMockHook({
      blocks: [
        { id: "1", type: "hero", data: { title: "A" } },
        { id: "2", type: "hero", data: { title: "B" } },
        { id: "3", type: "title", data: { text: "H1", level: 1 } },
      ] as any,
    });

    render(<PageEditor />);

    expect(
      screen.getByRole("button", { name: /\+ Hero \(2\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Title \(1\)/i })
    ).toBeInTheDocument();
  });
});