/** Comma-separated user UUIDs that may see admin navigation (mirrors backend ADMIN_USER_IDS). */
export function getAdminUserIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.trim();
  if (!raw) {
    return [];
  }
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

export function isAdminUser(userId: string | undefined): boolean {
  if (!userId) {
    return false;
  }
  return getAdminUserIds().includes(userId);
}
