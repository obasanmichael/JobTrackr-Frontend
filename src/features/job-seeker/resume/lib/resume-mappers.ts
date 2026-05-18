import type {
  CandidateProfile as UiCandidateProfile,
  Resume as UiResume,
  ResumeParseStatus,
  UpdateCandidateProfilePayload,
} from "@/types";

export interface ResumeApiRecord {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string | null;
  /** Present in API; omitted from UI model */
  storageKey?: string;
  status: ResumeParseStatus;
  parsedText: string | null;
  parseError: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function resumeFromApi(raw: ResumeApiRecord): UiResume {
  const { storageKey: _omit, ...rest } = raw;
  void _omit;
  return {
    ...rest,
    parsedText: raw.parsedText,
    parseError: raw.parseError,
  };
}

/** Candidate profile as returned by the API (JSON blobs) */
export interface CandidateProfileApiRecord {
  id: string;
  userId: string;
  resumeId: string;
  headline: string | null;
  summary: string | null;
  skills: unknown;
  tools: unknown;
  roles: unknown;
  industries: unknown;
  yearsOfExperience: number | null;
  locations: unknown;
  workModes: unknown;
  education: unknown;
  certifications: unknown;
  projects: unknown;
  experience: unknown;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

function stringifyListEntries(value: unknown): string[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (typeof entry === "string") return entry;
    if (typeof entry === "number") return String(entry);
    try {
      return JSON.stringify(entry);
    } catch {
      return "";
    }
  });
}

/** Collapse newline-oriented JSON arrays (we store arrays of plain strings client-side). */
export function linesFromJsonArray(value: unknown): string[] {
  return stringifyListEntries(value);
}

export function candidateProfileFromApi(raw: CandidateProfileApiRecord): UiCandidateProfile {
  return {
    id: raw.id,
    userId: raw.userId,
    resumeId: raw.resumeId,
    headline: raw.headline,
    summary: raw.summary,
    skills: stringifyListEntries(raw.skills),
    tools: stringifyListEntries(raw.tools),
    roles: stringifyListEntries(raw.roles),
    industries: stringifyListEntries(raw.industries),
    yearsOfExperience: raw.yearsOfExperience,
    locations: stringifyListEntries(raw.locations),
    workModes: stringifyListEntries(raw.workModes),
    educationLines: linesFromJsonArray(raw.education),
    certificationLines: linesFromJsonArray(raw.certifications),
    projectLines: linesFromJsonArray(raw.projects),
    experienceLines: linesFromJsonArray(raw.experience),
    isConfirmed: raw.isConfirmed,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function updateProfilePayloadToApi(
  payload: UpdateCandidateProfilePayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.headline !== undefined) body.headline = payload.headline;
  if (payload.summary !== undefined) body.summary = payload.summary;
  if (payload.skills !== undefined) body.skills = payload.skills;
  if (payload.tools !== undefined) body.tools = payload.tools;
  if (payload.roles !== undefined) body.roles = payload.roles;
  if (payload.industries !== undefined) body.industries = payload.industries;
  if (payload.yearsOfExperience !== undefined) {
    body.yearsOfExperience = payload.yearsOfExperience;
  }
  if (payload.locations !== undefined) body.locations = payload.locations;
  if (payload.workModes !== undefined) body.workModes = payload.workModes;
  if (payload.educationLines !== undefined) {
    body.education = payload.educationLines;
  }
  if (payload.certificationLines !== undefined) {
    body.certifications = payload.certificationLines;
  }
  if (payload.projectLines !== undefined) body.projects = payload.projectLines;
  if (payload.experienceLines !== undefined) {
    body.experience = payload.experienceLines;
  }
  if (payload.isConfirmed !== undefined) body.isConfirmed = payload.isConfirmed;
  return body;
}
