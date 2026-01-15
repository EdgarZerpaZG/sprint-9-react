import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsManagement from "../pages/Dashboard/SettingsManagement";
import * as UseSiteSettingsHook from "../hooks/useSiteSettings";

// useSiteSettings Mock
vi.mock("../hooks/useSiteSettings", () => ({
  useSiteSettings: vi.fn(),
}));

// LogoUploader mock
vi.mock("../components/settings/LogoUploader", () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (url: string) => void }) => (
    <div>
      <span data-testid="logo-value">{value}</span>
      <button type="button" onClick={() => onChange("https://example.com/logo.png")}>
        Mock upload
      </button>
    </div>
  ),
}));

describe("SettingsManagement", () => {
  const mockUseSiteSettings = UseSiteSettingsHook.useSiteSettings as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseSiteSettings.mockReturnValue({
      settings: {
        id: "settings-1",
        manager_title: "My ShellPets",
        show_calendar: true,
        logo_url: "https://example.com/initial-logo.png",
      },
      loading: false,
      error: null,
      updateSettings: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn(),
    });
  });

  it("shows loading state when loading is true", () => {
    mockUseSiteSettings.mockReturnValue({
      settings: null,
      loading: true,
      error: null,
      updateSettings: vi.fn(),
      reload: vi.fn(),
    });

    render(<SettingsManagement />);

    expect(screen.getByText(/Loading settings.../i)).toBeInTheDocument();
  });

  it("renders form with initial values from settings", () => {
    render(<SettingsManagement />);

    // Title input
    const titleInput = screen.getByLabelText(/Dashboard \/ site title/i);
    expect(titleInput).toHaveValue("My ShellPets");

    // Calendar checkbox
    const calendarCheckbox = screen.getByRole("checkbox", {
      name: /Enable public calendar in navbar/i,
    });
    expect(calendarCheckbox).toBeChecked();

    // Logo
    expect(screen.getByTestId("logo-value")).toHaveTextContent(
      "https://example.com/initial-logo.png"
    );
  });

  it("calls updateSettings with edited values when submitting", async () => {
    const updateSettingsMock = vi.fn().mockResolvedValue(undefined);

    mockUseSiteSettings.mockReturnValue({
      settings: {
        id: "settings-1",
        manager_title: "My ShellPets",
        show_calendar: true,
        logo_url: "https://example.com/initial-logo.png",
      },
      loading: false,
      error: null,
      updateSettings: updateSettingsMock,
      reload: vi.fn(),
    });

    render(<SettingsManagement />);

    // Change title
    const titleInput = screen.getByLabelText(/Dashboard \/ site title/i);
    fireEvent.change(titleInput, { target: { value: "New Site Title" } });

    // Upload logo
    const uploadButton = screen.getByRole("button", { name: /Mock upload/i });
    fireEvent.click(uploadButton);

    // Disable calendar
    const calendarCheckbox = screen.getByRole("checkbox", {
      name: /Enable public calendar in navbar/i,
    });
    fireEvent.click(calendarCheckbox);

    // Submit form
    const saveButton = screen.getByRole("button", { name: /Save settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateSettingsMock).toHaveBeenCalledTimes(1);
    });

    expect(updateSettingsMock).toHaveBeenCalledWith({
      managerTitle: "New Site Title",
      showCalendar: false,
      logoUrl: "https://example.com/logo.png",
    });

    // Success message
    await waitFor(() => {
      expect(
        screen.getByText(/Settings saved successfully./i)
      ).toBeInTheDocument();
    });
  });

  it("shows error message when hook returns error", () => {
    mockUseSiteSettings.mockReturnValue({
      settings: null,
      loading: false,
      error: "Something went wrong loading settings",
      updateSettings: vi.fn(),
      reload: vi.fn(),
    });

    render(<SettingsManagement />);

    expect(
      screen.getByText(/Something went wrong loading settings/i)
    ).toBeInTheDocument();
  });

  it("shows local error message when updateSettings throws", async () => {
    const updateSettingsMock = vi
      .fn()
      .mockRejectedValue(new Error("Update failed"));

    mockUseSiteSettings.mockReturnValue({
      settings: {
        id: "settings-1",
        manager_title: "My ShellPets",
        show_calendar: true,
        logo_url: "",
      },
      loading: false,
      error: null,
      updateSettings: updateSettingsMock,
      reload: vi.fn(),
    });

    render(<SettingsManagement />);

    const saveButton = screen.getByRole("button", { name: /Save settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateSettingsMock).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/Update failed/i)
    ).toBeInTheDocument();
  });
});