import { describe, expect, it } from "vitest";
import { jobSourceSubmissionFromApi } from "./job-source-submission-mappers";

describe("jobSourceSubmissionFromApi", () => {
  it("maps API payload to a normalized submission record", () => {
    const result = jobSourceSubmissionFromApi({
      id: "sub-1",
      companyName: "Acme",
      careersUrl: "https://boards.greenhouse.io/acme",
      submitterEmail: "ops@acme.com",
      submitterUserId: null,
      detectedAtsType: "GREENHOUSE",
      detectedSlug: "acme",
      status: "PENDING",
      jobSourceId: null,
      reviewerNotes: null,
      reviewedAt: null,
      createdAt: "2026-05-20T12:00:00.000Z",
      updatedAt: "2026-05-20T12:00:00.000Z",
    });

    expect(result.companyName).toBe("Acme");
    expect(result.detectedAtsType).toBe("GREENHOUSE");
    expect(result.detectedSlug).toBe("acme");
  });
});
