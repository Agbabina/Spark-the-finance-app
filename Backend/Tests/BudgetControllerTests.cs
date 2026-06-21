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

public class BudgetControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void Create_WithValidUser_AddsBudgetAndReturnsCreated()
    {
        var db = GetDbContext();
        db.Users.Add(new User { Id = "user1", UserName = "user1" });
        db.SaveChanges();

        var service = new BudgetService(db);
        var controller = new BudgetController(service);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "user1"),
            new Claim(JwtRegisteredClaimNames.Sub, "user1")
        };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth")) }
        };

        var budget = new Budget
        {
            Category = "Food",
            Limit = 200,
            Month = 6,
            Year = 2026
        };

        var result = controller.Create(budget);

        Assert.IsType<CreatedAtActionResult>(result.Result);
        var saved = db.Budgets.FirstOrDefault();
        Assert.NotNull(saved);
        Assert.Equal("user1", saved.UserId);
    }

    [Fact]
    public void GetAll_WithoutAuthClaims_ReturnsUnauthorized()
    {
        var db = GetDbContext();
        var service = new BudgetService(db);
        var controller = new BudgetController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var result = controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }
}
