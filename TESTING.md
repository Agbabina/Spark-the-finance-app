# Testing Guide

This project includes comprehensive testing for both frontend and backend.

## Frontend Testing

Frontend tests use **Vitest** with **React Testing Library**.

### Running Frontend Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI dashboard
npm run test:ui
```

### Test Files

- **`src/App.test.tsx`** - Main app component tests (routing, localStorage, token handling)
- **`src/Pages/LoginPage.test.tsx`** - Login/Register page tests (form submission, auth flow)
- **`src/lib/api.test.ts`** - API client tests (token management, axios configuration)

### Frontend Test Coverage

-  Login/Register form submission
-  Error handling and validation
-  JWT token management
-  localStorage integration
-  API client configuration
-  Route protection and redirects

---

## Backend Testing

Backend tests use **xUnit** with **Moq** for mocking.

### Running Backend Tests

```bash
# Run backend tests from root directory
npm run test:backend

# Or navigate to Backend directory
cd Backend
dotnet test

# Run specific test class
dotnet test --filter "ClassName"

# Run with verbose output
dotnet test --verbosity normal
```

### Test Files

- **`Backend/Tests/AuthControllerTests.cs`** - Authentication endpoint tests
  - Register with valid/invalid models
  - Login with correct/incorrect credentials
  - JWT token generation

- **`Backend/Tests/TransactionServiceTests.cs`** - Transaction service logic tests
  - User-scoped transaction retrieval
  - Create, read, update, delete operations
  - Data isolation between users

### Backend Test Coverage

-  User registration and password validation
-  User authentication and JWT generation
-  Transaction CRUD operations
-  User data isolation (transactions filtered by UserId)
-  Error handling

---

## Running All Tests

```bash
# Run all frontend and backend tests
npm run test:all
```

---

## Test Structure

### Frontend Tests
- Use `describe()` blocks to group related tests
- Use `it()` for individual test cases
- Mock API calls with `vi.mock()`
- Use `userEvent` for user interactions
- Use `waitFor()` for async operations

### Backend Tests
- Use `[Fact]` attribute for test methods
- Use `Moq` to mock dependencies
- Use in-memory database for persistence tests
- Follow Arrange-Act-Assert pattern

---

## Key Testing Patterns

### Frontend
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Component", () => {
  it("should do something", async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole("button"));
    
    await waitFor(() => {
      expect(screen.getByText("text")).toBeDefined();
    });
  });
});
```

### Backend
```csharp
[Fact]
public async Task MethodName_Condition_ExpectedResult()
{
    // Arrange
    var mockService = new Mock<IService>();
    
    // Act
    var result = await controller.Method();
    
    // Assert
    Assert.NotNull(result);
}
```

---

## Debugging Tests

### Frontend
- Run `npm run test:ui` to see test results in a visual dashboard
- Use `console.log()` in tests (output visible in test runner)
- Add `.only` to run a single test: `it.only("test", ...)`

### Backend
- Use Visual Studio's Test Explorer
- Add breakpoints in test methods
- Use `--verbosity detailed` flag

---

## CI/CD Integration

To run tests in CI/CD pipeline:

```bash
npm run test:run && npm run test:backend
```

Both must pass for the build to succeed.
