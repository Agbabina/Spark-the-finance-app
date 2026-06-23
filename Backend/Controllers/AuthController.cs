using Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers;

[ApiController]
[Route("/api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        Console.WriteLine($"Register attempt: Username={model.Username}, Email={model.Email}, Password length={model.Password?.Length ?? 0}");

        if (string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
        {
            return BadRequest(new { message = "Username and password are required" });
        }

        if (model.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long" });
        }

        var user = new User { UserName = model.Username, Email = model.Email};
        var result = await _userManager.CreateAsync(user, model.Password);
        if (result.Succeeded)
        {
            Console.WriteLine("User registered successfully");
            var token = GenerateJwtToken(user);
            return Ok(new
            {
                token,
                username = user.UserName ?? user.Email ?? model.Username,
                message = "User registered successfully"
            });
        }
        
        var errors = result.Errors.Select(e => e.Description).ToList();
        Console.WriteLine($"Registration failed: {string.Join(", ", errors)}");
        return BadRequest(new { message = "Registration failed", errors });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var loginIdentifier = model.Username?.Trim();
        if (string.IsNullOrWhiteSpace(loginIdentifier))
        {
            loginIdentifier = model.Email?.Trim();
        }

        Console.WriteLine($"Login attempt: Identifier={loginIdentifier}, Password length={model.Password?.Length ?? 0}");

        if (string.IsNullOrWhiteSpace(loginIdentifier) || string.IsNullOrWhiteSpace(model.Password))
        {
            return BadRequest(new { message = "Username or email and password are required" });
        }

        var user = await _userManager.FindByNameAsync(loginIdentifier)
            ?? await _userManager.FindByEmailAsync(loginIdentifier);

        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            var token = GenerateJwtToken(user);
            Console.WriteLine("Login successful");
            return Ok(new
            {
                token,
                username = user.UserName ?? user.Email ?? loginIdentifier,
            });
        }
        Console.WriteLine("Login failed: Invalid credentials");
        return Unauthorized(new { message = "Invalid username or password" });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyHere12345678901234567890";
        var issuer = _configuration["Jwt:Issuer"] ?? "YourIssuer";
        var audience = _configuration["Jwt:Audience"] ?? "YourAudience";

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
            new Claim("username", user.UserName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpGet("google")]
    public IActionResult GoogleLogin([FromQuery] string? returnUrl = null)
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback), "Auth", new { returnUrl });
        var properties = new Microsoft.AspNetCore.Authentication.AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, "Google");
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? returnUrl = null)
    {
        var result = await HttpContext.AuthenticateAsync("External");
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "External authentication failed" });
        }

        var email = result.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var name = result.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Email not provided by Google" });
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new User { UserName = name ?? email, Email = email };
            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return BadRequest(new { message = "Failed to create user account" });
            }
        }

        var token = GenerateJwtToken(user);
        var frontendUrl = _configuration["Frontend:Url"];
        if (string.IsNullOrEmpty(frontendUrl))
        {
            var requestOrigin = $"{Request.Scheme}://{Request.Host}";
            frontendUrl = Request.Headers["Origin"].ToString();
            if (string.IsNullOrEmpty(frontendUrl))
            {
                frontendUrl = requestOrigin;
            }
        }
        var targetUrl = !string.IsNullOrEmpty(returnUrl) ? returnUrl : frontendUrl;

        if (!targetUrl.EndsWith("/login") && !targetUrl.EndsWith("/"))
        {
            targetUrl = targetUrl.TrimEnd('/') + "/login";
        }

        return Redirect($"{targetUrl}?token={token}");
    }
}

public class RegisterModel
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginModel
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
