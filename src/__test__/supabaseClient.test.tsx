import { describe, it, expect } from "vitest";
import { supabase } from "../lib/supabaseClient";

describe("Supabase Connection", () => {
  it("should connect successfully with valid credentials", async () => {
    const { data, error } = await supabase.from("users").select("*").limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});