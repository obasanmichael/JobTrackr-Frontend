import { describe, it, expect } from "vitest";
import { getSafeInternalRedirectPath } from "./safe-redirect-path";

describe("getSafeInternalRedirectPath", () => {
  it("returns undefined for null or empty input", () => {
    expect(getSafeInternalRedirectPath(null)).toBeUndefined();
    expect(getSafeInternalRedirectPath("")).toBeUndefined();
  });

  it("allows same-origin relative paths", () => {
    expect(getSafeInternalRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeInternalRedirectPath("/dashboard/applications")).toBe(
      "/dashboard/applications"
    );
  });

  it("decodes a URL-encoded path", () => {
    expect(getSafeInternalRedirectPath(encodeURIComponent("/dashboard"))).toBe(
      "/dashboard"
    );
  });

  it("rejects protocol-relative URLs (open redirect)", () => {
    expect(getSafeInternalRedirectPath("//evil.com")).toBeUndefined();
  });

  it("rejects absolute URLs", () => {
    expect(getSafeInternalRedirectPath("https://evil.com")).toBeUndefined();
  });
});
