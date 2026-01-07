import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomeEditor from "../pages/Dashboard/HomeEditor";
import { useHomeEditor } from "../features/content/hooks/editor/useHomeEditor";

vi.mock("../features/content/hooks/editor/useHomeEditor", () => ({
  useHomeEditor: vi.fn(),
}));

vi.mock("../components/editor/BlocksEditorDnd", () => ({
  __esModule: true,
  default: ({ blocks }: { blocks: any[] }) => (
    <div data-testid="blocks-editor-mock">
      Blocks editor mock – {blocks?.length ?? 0} blocks
    </div>
  ),
}));

const mockedUseHomeEditor = useHomeEditor as unknown as Mock;

describe("HomeEditor", () => {
  const mockSave = vi.fn();
  const mockSetStatus = vi.fn();
  const mockAddBlock = vi.fn();
  const mockUpdateBlock = vi.fn();
  const mockRemoveBlock = vi.fn();
  const mockReorderBlocks = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseHomeEditor.mockReturnValue({
      loading: false,
      saving: false,
      error: null,
      status: "draft",
      setStatus: mockSetStatus,
      blocks: [],
      addBlock: mockAddBlock,
      updateBlock: mockUpdateBlock,
      removeBlock: mockRemoveBlock,
      reorderBlocks: mockReorderBlocks,
      save: mockSave,
      updatedAt: null,
    });
  });

  it("shows loading state when loading is true", () => {
    mockedUseHomeEditor.mockReturnValueOnce({
      loading: true,
    });

    render(<HomeEditor />);

    expect(
      screen.getByText(/loading home content/i)
    ).toBeInTheDocument();
  });

  it("renders main layout when not loading", () => {
    render(<HomeEditor />);

    expect(
      screen.getByRole("heading", { name: /home content/i })
    ).toBeInTheDocument();

    expect(screen.getByTestId("blocks-editor-mock")).toBeInTheDocument();
  });

  it("calls addBlock('hero') when clicking + Hero button", () => {
    render(<HomeEditor />);

    const heroBtn = screen.getByRole("button", { name: /\+ hero/i });
    fireEvent.click(heroBtn);

    expect(mockAddBlock).toHaveBeenCalledWith("hero");
  });

  it("calls addBlock('columns') when clicking + Columns button", () => {
    render(<HomeEditor />);

    const columnsBtn = screen.getByRole("button", {
      name: /\+ columns/i,
    });
    fireEvent.click(columnsBtn);

    expect(mockAddBlock).toHaveBeenCalledWith("columns");
  });

  it("calls addBlock for heading, paragraph and image", () => {
    render(<HomeEditor />);

    fireEvent.click(screen.getByRole("button", { name: /\+ heading/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /\+ paragraph/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /\+ image/i }));

    expect(mockAddBlock).toHaveBeenCalledWith("heading");
    expect(mockAddBlock).toHaveBeenCalledWith("paragraph");
    expect(mockAddBlock).toHaveBeenCalledWith("image");
  });

  it("calls save when clicking 'Save home' button in header", () => {
    render(<HomeEditor />);

    const saveBtn = screen.getByRole("button", { name: /save home/i });
    fireEvent.click(saveBtn);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("calls save when submitting the form (Save & stay)", () => {
    render(<HomeEditor />);

    const submitBtn = screen.getByRole("button", {
      name: /save & stay/i,
    });

    fireEvent.click(submitBtn);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("changes status and calls setStatus when selecting 'published'", () => {
    render(<HomeEditor />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "published" } });

    expect(mockSetStatus).toHaveBeenCalledWith("published");
  });

  it("shows error message when error is present", () => {
    mockedUseHomeEditor.mockReturnValueOnce({
      loading: false,
      saving: false,
      error: "Something went wrong",
      status: "draft",
      setStatus: mockSetStatus,
      blocks: [],
      addBlock: mockAddBlock,
      updateBlock: mockUpdateBlock,
      removeBlock: mockRemoveBlock,
      reorderBlocks: mockReorderBlocks,
      save: mockSave,
      updatedAt: null,
    });

    render(<HomeEditor />);

    expect(
      screen.getByText(/something went wrong/i)
    ).toBeInTheDocument();
  });
});