using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
//SJD
namespace Backend.Controllers;

[ApiController]
[Route("/api/accounts")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly AccountConnectionService _accountService;

    public AccountController(AccountConnectionService accountService)
    {
        _accountService = accountService;
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    [HttpGet]
    public ActionResult<List<BankAccount>> GetAll()
    {
        try
        {
            var userId = GetCurrentUserId();
            var accounts = _accountService.GetAll(userId);
            return Ok(accounts);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("{id}")]
    public ActionResult<BankAccount> GetById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var account = _accountService.Get(id, userId);
            if (account == null)
            {
                return NotFound();
            }
            return Ok(account);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost("connect")]
    public ActionResult<BankAccount> Connect([FromBody] BankAccount account)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!_accountService.UserExists(userId))
            {
                return Unauthorized("User not found");
            }

            if (string.IsNullOrWhiteSpace(account.InstitutionName))
            {
                return BadRequest("Institution name is required");
            }

            if (string.IsNullOrWhiteSpace(account.LastFourDigits) || account.LastFourDigits.Length != 4)
            {
                return BadRequest("Last four digits are required and must be 4 characters");
            }

            account.UserId = userId;
            account.IsActive = true;
            account.ConnectedAt = DateTime.UtcNow;
            _accountService.Add(account);
            return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error connecting account: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Disconnect(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var account = _accountService.Get(id, userId);
            if (account == null)
            {
                return NotFound();
            }
            _accountService.Delete(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }
}
