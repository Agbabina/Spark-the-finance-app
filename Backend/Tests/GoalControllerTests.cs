using Backend.Controllers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace Backend.Tests;

public class GoalControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void Create_WithValidUser_AddsGoalAndReturnsCreated()
    {
        var db = GetDbContext();
        db.Users.Add(new User { Id = "user1", UserName = "user1" });
        db.SaveChanges();

        var service = new GoalService(db);
        var controller = new GoalsController(service);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "user1"),
            new Claim(JwtRegisteredClaimNames.Sub, "user1")
        };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth")) }
        };

        var goal = new Goal
        {
            Title = "Emergency Fund",
            TargetAmount = 50000,
            CurrentAmount = 10000
        };

        var result = controller.Create(goal);

        Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.NotNull(db.Goals.FirstOrDefault());
    }

    [Fact]
    public void Update_WithoutClaims_ReturnsUnauthorized()
    {
        var db = GetDbContext();
        var service = new GoalService(db);
        var controller = new GoalsController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var result = controller.Update(1, new Goal { Title = "Emergency Fund", TargetAmount = 1000, CurrentAmount = 100 });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
