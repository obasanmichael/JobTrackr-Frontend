"use client";

import { useRef, useState } from "react";
import { Camera, Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  deleteUserAvatarRequest,
  uploadUserAvatarRequest,
} from "@/features/users/api/users-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { UserAvatar } from "@/components/user/user-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ProfilePhotoMenuProps = {
  size?: "md" | "lg";
};

export function ProfilePhotoMenu({ size = "lg" }: ProfilePhotoMenuProps) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const busy = uploading || removing;
  const hasPhoto = Boolean(user?.avatarUrl);

  async function handleUpload(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    try {
      await uploadUserAvatarRequest(file);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveConfirmed() {
    setRemoving(true);
    try {
      await deleteUserAvatarRequest();
      await refreshUser();
      setRemoveConfirmOpen(false);
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleUpload(event.target.files?.[0])}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={busy}>
          <button
            type="button"
            className={cn(
              "group relative rounded-full outline-none transition-shadow",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              busy && "pointer-events-none opacity-70"
            )}
            aria-label="Profile photo options"
          >
            <UserAvatar
              name={user?.name}
              avatarUrl={user?.avatarUrl}
              size={size}
            />
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity",
                "group-hover:opacity-100 group-focus-visible:opacity-100"
              )}
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48">
          {hasPhoto ? (
            <DropdownMenuItem onSelect={() => setViewOpen(true)}>
              <Eye className="h-4 w-4" />
              View photo
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            <Camera className="h-4 w-4" />
            {hasPhoto ? "Change photo" : "Upload photo"}
          </DropdownMenuItem>
          {hasPhoto ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setRemoveConfirmOpen(true)}
                disabled={busy}
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm gap-4 p-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{user?.name ?? "Profile photo"}</DialogTitle>
          </DialogHeader>
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name ? `${user.name}'s profile photo` : "Profile photo"}
              className="mx-auto aspect-square w-full max-w-[320px] rounded-2xl object-cover"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Remove profile photo?"
        description="Your photo will be deleted and initials will show instead. You can upload a new photo anytime."
        confirmLabel="Remove photo"
        variant="destructive"
        isPending={removing}
        onConfirm={() => void handleRemoveConfirmed()}
      />
    </>
  );
}
