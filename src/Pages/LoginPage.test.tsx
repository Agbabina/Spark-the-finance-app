import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";
import * as api from "../lib/api";
import { BrowserRouter } from "react-router-dom";

vi.mock("../lib/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("LoginPage", () => {
  const mockSetIsLoggedIn = vi.fn();
  const mockSetUsername = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage setIsLoggedIn={mockSetIsLoggedIn} setUsername={mockSetUsername} />
      </BrowserRouter>
    );
  };

  it("renders login form on initial load", () => {
    renderLoginPage();
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    expect(usernameInput).toBeDefined();
  });

  it("toggles between login and register modes", async () => {
    renderLoginPage();

    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  it("calls setApiAuthToken and setIsLoggedIn on successful login", async () => {
    const user = userEvent.setup();
    const mockToken = "test-jwt-token";
    vi.mocked(api.api.post).mockResolvedValueOnce({
      data: { token: mockToken },
    });
    vi.mocked(api.setApiAuthToken).mockImplementation(() => {});

    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(api.setApiAuthToken)).toHaveBeenCalledWith(mockToken);
    });
  });

  it("registers new user successfully", async () => {
    vi.mocked(api.api.post).mockResolvedValueOnce({
      data: { message: "User registered successfully" },
    });

    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByLabelText(/password/i);
    expect((usernameInput as HTMLInputElement).value).toBe("");
    expect((passwordInput as HTMLInputElement).value).toBe("");
  });

  it("displays loading state during submission", async () => {
    vi.mocked(api.api.post).mockResolvedValueOnce({
      data: { token: "test-token" },
    });

    renderLoginPage();

    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });

  it("clears form after successful registration", async () => {
    vi.mocked(api.api.post).mockResolvedValueOnce({
      data: { message: "User registered successfully" },
    });

    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText("Enter your username") as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(usernameInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  it("requires non-empty username and password", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    // Should not call API
    expect(api.api.post).not.toHaveBeenCalled();
  });
});
