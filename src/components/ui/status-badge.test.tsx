import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders the configured label for a known status", () => {
    render(<StatusBadge status="Applied" />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("falls back to the raw status string for unknown keys", () => {
    render(<StatusBadge status="Custom" />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
