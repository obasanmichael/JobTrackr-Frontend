import axios from "axios";
import { api } from "@/shared/lib/http-client";

/**
 * True if the current session may call admin APIs (DB membership or legacy env on server).
 * 403 → false; network/other errors propagate.
 */
export async function probeAdminAccess(): Promise<boolean> {
  try {
    await api.get("/admin/users", { params: { page: 1, limit: 1 } });
    return true;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 403) {
      return false;
    }
    throw e;
  }
}
