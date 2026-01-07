import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PageEditor from "../pages/Dashboard/PageEditor";
import * as ReactRouter from "react-router-dom";
import * as PageEditorHook from "../features/content/hooks/editor/usePageEditor";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock(
  "../features/content/hooks/editor/usePageEditor",
  () => ({
    usePageEditor: vi.fn(),
  })
);

describe("PageEditor", () => {
  const mockUseParams = ReactRouter.useParams as unknown as Mock;
  const mockUsePageEditor = PageEditorHook
    .usePageEditor as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupMockHook(overrides?: Partial<ReturnType<typeof mockUsePageEditor>>) {
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
      blocks: [],
      addBlock: vi.fn(),
      updateBlock: vi.fn(),
      removeBlock: vi.fn(),
      reorderBlocks: vi.fn(),
      save: vi.fn(),
    };

    mockUsePageEditor.mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  }

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
    expect(
      screen.getByText(/Manage content blocks and SEO for this page./i)
    ).toBeInTheDocument();
  });

  it("renders 'Edit Page' when id is a real id", () => {
    mockUseParams.mockReturnValue({ id: "abc-123" });
    setupMockHook();

    render(<PageEditor />);

    expect(screen.getByText(/Edit Page/i)).toBeInTheDocument();
  });

  it("calls save when clicking 'Save page' button", async () => {
    mockUseParams.mockReturnValue({ id: "new" });
    const saveMock = vi.fn();
    setupMockHook({ save: saveMock });

    render(<PageEditor />);

    const button = screen.getByRole("button", { name: /Save page/i });
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

  it("adds blocks when toolbar buttons are clicked", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    const addBlock = vi.fn();
    setupMockHook({ addBlock });

    render(<PageEditor />);

    fireEvent.click(screen.getByText("+ Heading"));
    fireEvent.click(screen.getByText("+ Paragraph"));
    fireEvent.click(screen.getByText("+ Image"));

    expect(addBlock).toHaveBeenCalledTimes(3);
    expect(addBlock).toHaveBeenNthCalledWith(1, "heading");
    expect(addBlock).toHaveBeenNthCalledWith(2, "paragraph");
    expect(addBlock).toHaveBeenNthCalledWith(3, "image");
  });
});