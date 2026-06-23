import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, setApiAuthToken } from "../lib/api";

describe("API Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete api.defaults.headers.common.Authorization;
  });

  describe("setApiAuthToken", () => {
    it("sets Authorization header when token is provided", () => {
      const token = "test-jwt-token";

      setApiAuthToken(token);

      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);
    });

    it("removes Authorization header when null token is provided", () => {
      // First set a token
      api.defaults.headers.common.Authorization = "Bearer some-token";

      // Then clear it
      setApiAuthToken(null);

      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });

    it("removes Authorization header when empty string is provided", () => {
      // First set a token
      api.defaults.headers.common.Authorization = "Bearer some-token";

      // Then clear it with empty string
      setApiAuthToken("");

      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });

    it("handles token with special characters", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      setApiAuthToken(token);

      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);
    });

    it("maintains other headers when setting auth token", () => {
      api.defaults.headers.common["X-Custom-Header"] = "custom-value";

      setApiAuthToken("test-token");

      expect(api.defaults.headers.common.Authorization).toBe("Bearer test-token");
      expect(api.defaults.headers.common["X-Custom-Header"]).toBe("custom-value");
    });
  });

  describe("api instance", () => {
    it("has correct base URL from environment", () => {
      // The api instance should be created with the base URL
      expect(api.defaults.baseURL).toBeDefined();
    });

    it("is an axios instance", () => {
      expect(api.interceptors).toBeDefined();
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });

    it("should have default baseURL as fallback", () => {
      expect(api.defaults.baseURL).toBe("https://spark-the-finance-app.fly.dev");
    });
  });

  describe("Multiple token changes", () => {
    it("handles multiple token changes correctly", () => {
      const token1 = "token-1";
      const token2 = "token-2";

      setApiAuthToken(token1);
      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${token1}`);

      setApiAuthToken(token2);
      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${token2}`);

      setApiAuthToken(null);
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });
  });
});
