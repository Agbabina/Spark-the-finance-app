using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests;

public class GoalServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void GetAll_ReturnsOnlyUserGoals()
    {
        var db = GetDbContext();
        var service = new GoalService(db);

        db.Goals.AddRange(
            new Goal { Id = 1, UserId = "user1", Title = "Emergency Fund", TargetAmount = 50000, CurrentAmount = 10000 },
            new Goal { Id = 2, UserId = "user1", Title = "Laptop", TargetAmount = 300000, CurrentAmount = 50000 },
            new Goal { Id = 3, UserId = "user2", Title = "Trip", TargetAmount = 200000, CurrentAmount = 1000 }
        );
        db.SaveChanges();

        var result = service.GetAll("user1");

        Assert.Equal(2, result.Count);
        Assert.All(result, goal => Assert.Equal("user1", goal.UserId));
    }
}
