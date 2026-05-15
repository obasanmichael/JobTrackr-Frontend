import type { User } from "@/types";

/** Matches `AuthResponseDto` from the NestJS API. */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}
