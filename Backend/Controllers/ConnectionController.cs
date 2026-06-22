using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Backend.Controllers;

[ApiController]
[Route("/api/connections")]
[Authorize]
public class ConnectionController : ControllerBase
{
    private readonly ConnectionService _connectionService;
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _context;

    public ConnectionController(ConnectionService connectionService, UserManager<User> userManager, AppDbContext context)
    {
        _connectionService = connectionService;
        _userManager = userManager;
        _context = context;
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

    [HttpGet("pending")]
    public ActionResult<List<ConnectionRequest>> GetPendingRequests()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_connectionService.GetPendingRequests(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("sent")]
    public ActionResult<List<ConnectionRequest>> GetSentRequests()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_connectionService.GetSentRequests(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("users")]
    public ActionResult<List<object>> GetConnectedUsers()
    {
        try
        {
            var userId = GetCurrentUserId();
            var connectedUsers = _connectionService.GetConnectedUsers(userId);
            return Ok(connectedUsers.Select(u => new
            {
                id = u.Id,
                username = u.UserName ?? string.Empty,
                email = u.Email ?? string.Empty
            }));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost("request")]
    public ActionResult<object> SendRequest([FromBody] ConnectionRequestModel model)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(model.UsernameOrEmail))
            {
                return BadRequest(new { message = "Username or email is required" });
            }

            var targetUser = _userManager.Users
                .FirstOrDefault(u => u.UserName == model.UsernameOrEmail || u.Email == model.UsernameOrEmail);

            if (targetUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (targetUser.Id == userId)
            {
                return BadRequest(new { message = "Cannot connect with yourself" });
            }

            var request = _connectionService.SendRequest(userId, targetUser.Id);
            if (request == null)
            {
                return BadRequest(new { message = "Connection request already exists" });
            }

            return Ok(new
            {
                message = "Connection request sent",
                requestId = request.Id
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending connection request: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("accept/{requestId}")]
    public IActionResult AcceptRequest(int requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = _connectionService.AcceptRequest(requestId, userId);
            if (!success)
            {
                return NotFound(new { message = "Request not found" });
            }
            return Ok(new { message = "Connection request accepted" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost("reject/{requestId}")]
    public IActionResult RejectRequest(int requestId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = _connectionService.RejectRequest(requestId, userId);
            if (!success)
            {
                return NotFound(new { message = "Request not found" });
            }
            return Ok(new { message = "Connection request rejected" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("shared-transactions")]
    public ActionResult<List<SharedTransaction>> GetSharedTransactions()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_connectionService.GetSharedTransactions(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost("share-transaction")]
    public ActionResult<SharedTransaction> ShareTransaction([FromBody] ShareTransactionModel model)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!_connectionService.UserExists(model.SharedWithUserId))
            {
                return BadRequest(new { message = "User not found" });
            }

            var isConnected = _connectionService.GetConnectedUsers(userId)
                .Any(u => u.Id == model.SharedWithUserId);

            if (!isConnected)
            {
                return BadRequest(new { message = "You can only share with connected users" });
            }

            var transaction = _context.Transactions.FirstOrDefault(t => t.Id == model.TransactionId && t.UserId == userId);
            if (transaction == null)
            {
                return NotFound(new { message = "Transaction not found" });
            }

            var shared = _connectionService.ShareTransaction(userId, model.SharedWithUserId, transaction);
            return CreatedAtAction(nameof(GetSharedTransactions), shared);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sharing transaction: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("shared-budgets")]
    public ActionResult<List<Budget>> GetSharedBudgets()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_connectionService.GetSharedBudgets(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }
}

public class ConnectionRequestModel
{
    public string UsernameOrEmail { get; set; } = string.Empty;
}

public class ShareTransactionModel
{
    public int TransactionId { get; set; }
    public string SharedWithUserId { get; set; } = string.Empty;
}
