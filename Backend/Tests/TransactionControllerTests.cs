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

public class TransactionControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void Create_WithValidUser_AddsTransactionAndReturnsCreated()
    {
        // Arrange
        var db = GetDbContext();
        var service = new TransactionService(db);
        var controller = new TransactionController(service);

        var userId = "user1";
        db.Users.Add(new User { Id = userId, UserName = "testuser", Email = "test@example.com" });
        db.SaveChanges();

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(JwtRegisteredClaimNames.Sub, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        var transaction = new Transaction
        {
            Title = "Test Transaction",
            Amount = 123.45m,
            Type = "income",
            Date = DateTime.Now
        };

        // Act
        var actionResult = controller.Create(transaction);

        // Assert
        Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var saved = db.Transactions.FirstOrDefault(t => t.Title == "Test Transaction");
        Assert.NotNull(saved);
        Assert.Equal(userId, saved.UserId);
    }

    [Fact]
    public void Create_WithoutUserClaims_ReturnsUnauthorized()
    {
        // Arrange
        var db = GetDbContext();
        var service = new TransactionService(db);
        var controller = new TransactionController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var transaction = new Transaction
        {
            Title = "NoAuth",
            Amount = 50,
            Type = "expense",
            Date = DateTime.Now
        };

        // Act
        var actionResult = controller.Create(transaction);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(actionResult.Result);
    }
}
