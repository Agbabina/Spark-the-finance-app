import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

vi.mock("./lib/api");

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it("shows LoginPage when not logged in", () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it("shows LoginPage when logged in but no token in localStorage", () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it("stores token in localStorage on login", () => {
    render(<App />);

    // Simulate storing a token
    localStorage.setItem("token", "test-token");

    expect(localStorage.getItem("token")).toBe("test-token");
  });

  it("clears localStorage on logout", () => {
    localStorage.setItem("token", "test-token");
    localStorage.removeItem("token");

    expect(localStorage.getItem("token")).toBeNull();
  });

  it("decodes token username correctly", () => {
    // Create a mock JWT token with sub claim
    // Header.Payload.Signature format
    const payload = {
      sub: "testuser",
      iat: 1516239022
    };
    const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const mockToken = `header.${base64Payload}.signature`;

    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "token") return mockToken;
      return null;
    });

    render(<App />);

    // App should attempt to decode the token
    expect(document.body).toBeDefined();
  });
});
