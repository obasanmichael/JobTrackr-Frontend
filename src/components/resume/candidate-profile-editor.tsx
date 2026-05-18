"use client";

import type { CandidateProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function linesToCsv(lineField: string): string[] {
  return lineField
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

interface CandidateProfileEditorProps {
  profile: CandidateProfile | null;
  disabled?: boolean;
  isSaving?: boolean;
  onSubmit: (payload: {
    headline: string | null;
    summary: string | null;
    skills: string[];
    tools: string[];
    roles: string[];
    industries: string[];
    yearsOfExperience: number | null;
    locations: string[];
    workModes: string[];
    educationLines: string[];
    certificationLines: string[];
    projectLines: string[];
    experienceLines: string[];
    isConfirmed: boolean;
  }) => void;
}

export function CandidateProfileEditor({
  profile,
  disabled,
  isSaving,
  onSubmit,
}: CandidateProfileEditorProps) {
  if (!profile) return null;

  function handleSubmit(form: HTMLFormElement) {
    const fd = new FormData(form);
    const headline = String(fd.get("headline") ?? "").trim() || null;
    const summary = String(fd.get("summary") ?? "").trim() || null;
    const yearsRaw = String(fd.get("yearsOfExperience") ?? "").trim();
    const yearsParsed = yearsRaw === "" ? null : Number(yearsRaw);
    const yearsOfExperience =
      yearsParsed === null || Number.isNaN(yearsParsed)
        ? null
        : Math.max(0, Math.floor(yearsParsed));
    const isConfirmed = fd.get("isConfirmed") === "on";

    function splitCsv(name: string): string[] {
      return String(fd.get(name) ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    onSubmit({
      headline,
      summary,
      skills: splitCsv("skills"),
      tools: splitCsv("tools"),
      roles: splitCsv("roles"),
      industries: splitCsv("industries"),
      yearsOfExperience,
      locations: splitCsv("locations"),
      workModes: splitCsv("workModes"),
      educationLines: linesToCsv(String(fd.get("educationLines") ?? "")),
      certificationLines: linesToCsv(String(fd.get("certificationLines") ?? "")),
      projectLines: linesToCsv(String(fd.get("projectLines") ?? "")),
      experienceLines: linesToCsv(String(fd.get("experienceLines") ?? "")),
      isConfirmed,
    });
  }

  const skillsDefault = profile.skills.join(", ");
  const toolsDefault = profile.tools.join(", ");
  const rolesDefault = profile.roles.join(", ");
  const industriesDefault = profile.industries.join(", ");

  return (
    <form
      key={profile.updatedAt}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.currentTarget);
      }}
    >
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100/90">
        Parsed fields are extracted automatically and may contain mistakes—treat edits as suggested
        improvements, not authoritative facts.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile.headline ?? ""}
            disabled={disabled}
            placeholder="e.g. Backend engineer focusing on APIs"
            maxLength={500}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of experience</Label>
          <Input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            defaultValue={profile.yearsOfExperience ?? ""}
            disabled={disabled}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={profile.summary ?? ""}
          disabled={disabled}
          rows={4}
          placeholder="Brief overview for recruiters and matching"
          maxLength={8000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Textarea id="skills" name="skills" defaultValue={skillsDefault} rows={3} disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tools">Tools & technologies</Label>
          <Textarea id="tools" name="tools" defaultValue={toolsDefault} rows={3} disabled={disabled} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roles">Target roles</Label>
          <Textarea id="roles" name="roles" defaultValue={rolesDefault} rows={3} disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industries">Industries</Label>
          <Textarea
            id="industries"
            name="industries"
            defaultValue={industriesDefault}
            rows={3}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="locations">Preferred locations</Label>
          <Textarea
            id="locations"
            name="locations"
            defaultValue={profile.locations.join(", ")}
            rows={2}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workModes">Work arrangement preferences</Label>
          <Textarea
            id="workModes"
            name="workModes"
            defaultValue={profile.workModes.join(", ")}
            rows={2}
            disabled={disabled}
            placeholder="e.g. remote-first, hybrid in London"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="educationLines">Education (one bullet per line)</Label>
          <Textarea
            id="educationLines"
            name="educationLines"
            rows={5}
            disabled={disabled}
            defaultValue={profile.educationLines.join("\n")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="certificationLines">Certifications (one per line)</Label>
          <Textarea
            id="certificationLines"
            name="certificationLines"
            rows={4}
            disabled={disabled}
            defaultValue={profile.certificationLines.join("\n")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experienceLines">Experience highlights (one per line)</Label>
          <Textarea
            id="experienceLines"
            name="experienceLines"
            rows={6}
            disabled={disabled}
            defaultValue={profile.experienceLines.join("\n")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectLines">Projects (one per line)</Label>
          <Textarea
            id="projectLines"
            name="projectLines"
            rows={6}
            disabled={disabled}
            defaultValue={profile.projectLines.join("\n")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isConfirmed"
            defaultChecked={profile.isConfirmed}
            disabled={disabled}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-sidebar-primary"
          />
          <span>
            <span className="font-medium">I have reviewed these details</span>
            <span className="block text-muted-foreground text-xs">
              Confirmed profiles are preferred for downstream matching experiments.
            </span>
          </span>
        </label>
        <Button type="submit" disabled={disabled || isSaving}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
