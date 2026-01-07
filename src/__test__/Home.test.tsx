import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import { supabase } from "../lib/supabaseClient";

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../hooks/useUserRole", () => ({
  useUserRole: () => ({ role: "user", loadingRole: false }),
}));

describe("Home page", () => {
  it("renders home content blocks when status is published", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: "home-1",
              status: "published",
              blocks: [
                {
                  id: "1",
                  type: "heading",
                  data: { text: "Welcome!", level: 1 },
                },
              ],
              updated_at: "2025-01-01T00:00:00Z",
            },
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Welcome!")).toBeInTheDocument();
    });
  });
});