import { describe, it, expect } from "vitest";
import axios from "axios";
import { getApiErrorMessage } from "./api-errors";

describe("getApiErrorMessage", () => {
  it("maps invalid-credentials 401 to the login copy", () => {
    const err = new axios.AxiosError("Unauthorized");
    err.response = {
      status: 401,
      data: { message: "Invalid credentials" },
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
    };
    expect(getApiErrorMessage(err)).toBe("Invalid email or password.");
  });

  it("maps other 401 responses to session-expired copy", () => {
    const err = new axios.AxiosError("Unauthorized");
    err.response = {
      status: 401,
      data: { message: "jwt expired" },
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
    };
    expect(getApiErrorMessage(err)).toBe(
      "Session expired. Please log in again."
    );
  });

  it("returns the server string message when present", () => {
    const err = new axios.AxiosError("Bad Request");
    err.response = {
      status: 409,
      data: { message: "An account with this email already exists." },
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    };
    expect(getApiErrorMessage(err)).toBe(
      "An account with this email already exists."
    );
  });

  it("returns the first validation message when message is an array", () => {
    const err = new axios.AxiosError("Bad Request");
    err.response = {
      status: 400,
      data: { message: ["email must be an email", "password too short"] },
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    };
    expect(getApiErrorMessage(err)).toBe("email must be an email");
  });

  it("returns a generic message for non-Axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again."
    );
  });
});
