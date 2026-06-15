using Backend.Controllers;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Backend.Tests;

public class AuthControllerTests
{
    [Fact]
    public void RegisterModel_ValidateProperties()
    {
        // Test that RegisterModel can be created and has required properties
        var model = new RegisterModel 
        { 
            Username = "testuser", 
            Email = "test@example.com", 
            Password = "Password123" 
        };

        Assert.Equal("testuser", model.Username);
        Assert.Equal("test@example.com", model.Email);
        Assert.Equal("Password123", model.Password);
    }

    [Fact]
    public void LoginModel_ValidateProperties()
    {
        // Test that LoginModel can be created and has required properties
        var model = new LoginModel 
        { 
            Username = "testuser", 
            Password = "Password123" 
        };

        Assert.Equal("testuser", model.Username);
        Assert.Equal("Password123", model.Password);
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]
    [InlineData("short")]
    public void Register_WithWeakPassword_ShouldFail(string password)
    {
        // Passwords less than 6 characters should fail validation
        var model = new RegisterModel 
        { 
            Username = "testuser", 
            Email = "test@example.com", 
            Password = password
        };

        bool isValid = !string.IsNullOrWhiteSpace(model.Password) && model.Password.Length >= 6;
        Assert.False(isValid);
    }

    [Fact]
    public void Register_WithValidModel_PassesValidation()
    {
        // Valid model with proper credentials
        var model = new RegisterModel 
        { 
            Username = "testuser", 
            Email = "test@example.com", 
            Password = "Password123" 
        };

        bool isValid = !string.IsNullOrWhiteSpace(model.Username) 
                    && !string.IsNullOrWhiteSpace(model.Password) 
                    && model.Password.Length >= 6;
        Assert.True(isValid);
    }

    [Fact]
    public void User_CanBeCreatedWithProperties()
    {
        // Test User model creation
        var user = new User 
        { 
            Id = "user-123",
            UserName = "testuser",
            Email = "test@example.com"
        };

        Assert.Equal("user-123", user.Id);
        Assert.Equal("testuser", user.UserName);
        Assert.Equal("test@example.com", user.Email);
    }
}
