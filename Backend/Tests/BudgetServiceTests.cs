using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests;

public class BudgetServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void GetAll_ReturnsOnlyUserBudgets()
    {
        var db = GetDbContext();
        var service = new BudgetService(db);

        db.Budgets.AddRange(
            new Budget { Id = 1, UserId = "user1", Category = "Food", Limit = 100, Month = 6, Year = 2026 },
            new Budget { Id = 2, UserId = "user1", Category = "Bills", Limit = 200, Month = 6, Year = 2026 },
            new Budget { Id = 3, UserId = "user2", Category = "Food", Limit = 300, Month = 6, Year = 2026 }
        );
        db.SaveChanges();

        var result = service.GetAll("user1");

        Assert.Equal(2, result.Count);
        Assert.All(result, budget => Assert.Equal("user1", budget.UserId));
    }

    [Fact]
    public void GetSummaries_CalculatesSpentAmounts()
    {
        var db = GetDbContext();
        var service = new BudgetService(db);

        db.Budgets.Add(new Budget { Id = 1, UserId = "user1", Category = "Food", Limit = 150, Month = 6, Year = 2026 });
        db.Transactions.AddRange(
            new Transaction { Id = 1, UserId = "user1", Title = "Groceries", Amount = 40, Type = "expense", Category = "Food", Date = new DateTime(2026, 6, 10) },
            new Transaction { Id = 2, UserId = "user1", Title = "Lunch", Amount = 20, Type = "expense", Category = "Food", Date = new DateTime(2026, 6, 11) },
            new Transaction { Id = 3, UserId = "user1", Title = "Salary", Amount = 1000, Type = "income", Category = "Food", Date = new DateTime(2026, 6, 12) },
            new Transaction { Id = 4, UserId = "user2", Title = "Other", Amount = 999, Type = "expense", Category = "Food", Date = new DateTime(2026, 6, 10) }
        );
        db.SaveChanges();

        var result = service.GetSummaries("user1", 6, 2026);

        Assert.Single(result);
        Assert.Equal(60, result[0].Spent);
        Assert.Equal(90, result[0].Remaining);
    }
}
