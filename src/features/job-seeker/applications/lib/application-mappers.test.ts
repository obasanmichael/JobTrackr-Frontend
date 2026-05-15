import { describe, it, expect } from "vitest";
import {
  applicationFromApi,
  createPayloadToApi,
  updatePayloadToApi,
  type ApplicationApiRecord,
} from "./application-mappers";

function sampleApiRecord(
  overrides: Partial<ApplicationApiRecord> = {}
): ApplicationApiRecord {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000099",
    jobTitle: "Engineer",
    companyName: "Acme",
    workMode: "REMOTE",
    status: "APPLIED",
    source: "LINKEDIN",
    salaryMin: 100,
    salaryMax: 200,
    currency: "USD",
    jobUrl: "https://jobs.example.com/1",
    location: "Remote",
    deadline: "2026-06-01T00:00:00.000Z",
    notes: "Hello",
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-02T10:00:00.000Z",
    ...overrides,
  };
}

describe("applicationFromApi", () => {
  it("maps API enums and companyName to UI fields", () => {
    const app = applicationFromApi(sampleApiRecord());
    expect(app.company).toBe("Acme");
    expect(app.status).toBe("Applied");
    expect(app.workMode).toBe("Remote");
    expect(app.source).toBe("LinkedIn");
    expect(app.jobTitle).toBe("Engineer");
    expect(app.salaryMin).toBe(100);
    expect(app.currency).toBe("USD");
  });

  it("defaults unknown API status to Saved", () => {
    const app = applicationFromApi(sampleApiRecord({ status: "UNKNOWN_ENUM" }));
    expect(app.status).toBe("Saved");
  });

  it("omits source when API sends null", () => {
    const app = applicationFromApi(sampleApiRecord({ source: null }));
    expect(app.source).toBeUndefined();
  });
});

describe("createPayloadToApi", () => {
  it("maps UI create payload to API body", () => {
    const body = createPayloadToApi({
      jobTitle: "PM",
      company: "Globex",
      status: "Screening",
      workMode: "Hybrid",
      source: "Twitter/X",
      salaryMin: 80_000,
      salaryMax: 120_000,
      currency: "USD",
      deadline: "2026-07-01T12:00:00.000Z",
      notes: "Note",
    });
    expect(body).toMatchObject({
      jobTitle: "PM",
      companyName: "Globex",
      status: "SCREENING",
      workMode: "HYBRID",
      source: "TWITTER",
      salaryMin: 80_000,
      salaryMax: 120_000,
      currency: "USD",
      deadline: "2026-07-01T12:00:00.000Z",
      notes: "Note",
    });
  });

  it("omits optional URL and notes when empty", () => {
    const body = createPayloadToApi({
      jobTitle: "Dev",
      company: "Co",
      status: "Applied",
      jobUrl: undefined,
      notes: "",
    });
    expect(body.jobUrl).toBeUndefined();
    expect(body.notes).toBeUndefined();
  });
});

describe("updatePayloadToApi", () => {
  it("only includes keys that are present on the partial", () => {
    expect(updatePayloadToApi({ status: "Offer" })).toEqual({
      status: "OFFER",
    });
  });

  it("maps cleared job URL to undefined", () => {
    expect(updatePayloadToApi({ jobUrl: "" })).toEqual({
      jobUrl: undefined,
    });
  });

  it("maps company renames to companyName", () => {
    expect(updatePayloadToApi({ company: "NewCo" })).toEqual({
      companyName: "NewCo",
    });
  });
});
