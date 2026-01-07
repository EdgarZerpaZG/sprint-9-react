import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostEditor from "../pages/Dashboard/PostEditor";
import * as ReactRouter from "react-router-dom";
import * as PostEditorHook from "../features/content/hooks/editor/usePostEditor";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouter>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock(
  "../features/content/hooks/editor/usePostEditor",
  () => ({
    usePostEditor: vi.fn(),
  })
);

describe("PostEditor", () => {
  const mockUseParams = ReactRouter.useParams as unknown as Mock;
  const mockUsePostEditor = PostEditorHook
    .usePostEditor as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupMockHook(
    overrides?: Partial<ReturnType<typeof mockUsePostEditor>>
  ) {
    const defaultReturn = {
      loading: false,
      saving: false,
      error: null,
      title: "Initial post",
      setTitle: vi.fn(),
      slug: "initial-post",
      setSlug: vi.fn(),
      excerpt: "Initial post excerpt",
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

    mockUsePostEditor.mockReturnValue({
      ...defaultReturn,
      ...overrides,
    });
  }

  it("shows loading state when loading is true", () => {
    mockUseParams.mockReturnValue({ id: "123" });
    setupMockHook({ loading: true });

    render(<PostEditor />);

    expect(screen.getByText(/Loading post/i)).toBeInTheDocument();
  });

  it("renders 'New Post' when id is 'new'", () => {
    mockUseParams.mockReturnValue({ id: "new" });
    setupMockHook();

    render(<PostEditor />);

    expect(screen.getByText(/New Post/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Manage content blocks and SEO for this post./i)
    ).toBeInTheDocument();
  });

  it("renders 'Edit Post' when id is a real id", () => {
    mockUseParams.mockReturnValue({ id: "abc-123" });
    setupMockHook();

    render(<PostEditor />);

    expect(screen.getByText(/Edit Post/i)).toBeInTheDocument();
  });

  it("calls save when clicking 'Save post' button", () => {
    mockUseParams.mockReturnValue({ id: "new" });
    const saveMock = vi.fn();
    setupMockHook({ save: saveMock });

    render(<PostEditor />);

    const button = screen.getByRole("button", { name: /Save post/i });
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

    render(<PostEditor />);

    const titleInput = screen.getByPlaceholderText(/Post title/i);
    const slugInput = screen.getByPlaceholderText(/post-slug/i);

    fireEvent.change(titleInput, { target: { value: "My new post" } });
    fireEvent.change(slugInput, { target: { value: "my-new-post" } });

    expect(setTitle).toHaveBeenCalledWith("My new post");
    expect(setSlug).toHaveBeenCalledWith("my-new-post");
  });

  it("adds blocks when toolbar buttons are clicked", () => {
    mockUseParams.mockReturnValue({ id: "new" });

    const addBlock = vi.fn();
    setupMockHook({ addBlock });

    render(<PostEditor />);

    fireEvent.click(screen.getByText("+ Heading"));
    fireEvent.click(screen.getByText("+ Paragraph"));
    fireEvent.click(screen.getByText("+ Image"));

    expect(addBlock).toHaveBeenCalledTimes(3);
    expect(addBlock).toHaveBeenNthCalledWith(1, "heading");
    expect(addBlock).toHaveBeenNthCalledWith(2, "paragraph");
    expect(addBlock).toHaveBeenNthCalledWith(3, "image");
  });
});