import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AddTransaction from "./AddTransaction";
import { api } from "../lib/api";

describe("AddTransaction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("sends Authorization header when token exists", async () => {
    const mockPost = vi.spyOn(api, "post").mockResolvedValue({ data: { id: 1, title: "T", amount: 100 } });
    localStorage.setItem("token", "test-token");

    const setTransactions = vi.fn();
    const setGlobalError = vi.fn();

    render(
      <MemoryRouter>
        <AddTransaction setTransactions={setTransactions} darkMode={false} username={"user"} setGlobalError={setGlobalError} />
      </MemoryRouter>
    );

    const titleInput = screen.getByPlaceholderText("e.g. Salary payment");
    fireEvent.change(titleInput, { target: { name: "title", value: "Test Title" } });

    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { name: "amount", value: "100" } });

    const saveButton = screen.getByText("Save Transaction");
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockPost).toHaveBeenCalled());

    const call = mockPost.mock.calls[0];
    expect(call[0]).toBe("/api/transactions");
    // Authorization should be attached to the api defaults by the app
    expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${localStorage.getItem("token")}`);
  });
});
