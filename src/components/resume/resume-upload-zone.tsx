"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RESUME_UPLOAD_MAX_BYTES } from "@/lib/constants";

const ACCEPT = "application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatMaxSize(): string {
  const mb = RESUME_UPLOAD_MAX_BYTES / (1024 * 1024);
  return `${mb} MB`;
}

interface ResumeUploadZoneProps {
  disabled?: boolean;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
}

export function ResumeUploadZone({
  disabled,
  isUploading,
  onFileSelected,
}: ResumeUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndForward = useCallback(
    (file: File) => {
      const allowed =
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      if (!allowed) {
        toast.error("Please upload a PDF or DOCX resume.");
        return;
      }
      if (file.size > RESUME_UPLOAD_MAX_BYTES) {
        toast.error(`Resume must be under ${formatMaxSize()}.`);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className={cn(
        "relative rounded-xl border border-dashed border-border bg-card/40 p-8 text-center transition-colors",
        dragOver && "border-sidebar-primary/70 bg-sidebar-primary/5",
        (disabled || isUploading) && "pointer-events-none opacity-60"
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndForward(file);
      }}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Upload your resume</p>
          <p className="text-sm text-muted-foreground">
            Drag and drop a PDF or DOCX, or browse. Max {formatMaxSize()}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-left text-xs leading-relaxed text-muted-foreground border border-border/80 rounded-lg px-3 py-2 bg-muted/30 max-w-md">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <span>
            Resumes contain personal information. Only upload files you are comfortable storing in
            JobTrackr. The backend validates types and size as well.
          </span>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateAndForward(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading…" : "Choose file"}
          </Button>
        </div>
      </div>
    </div>
  );
}
