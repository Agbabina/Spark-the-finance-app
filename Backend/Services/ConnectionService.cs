using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ConnectionService
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    public ConnectionService(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public List<ConnectionRequest> GetPendingRequests(string userId) =>
        _context.ConnectionRequests
            .Where(r => r.ReceiverId == userId && r.Status == "pending")
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

    public List<ConnectionRequest> GetSentRequests(string userId) =>
        _context.ConnectionRequests
            .Where(r => r.RequesterId == userId && r.Status == "pending")
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

    public List<User> GetConnectedUsers(string userId)
    {
        var acceptedIds = _context.ConnectionRequests
            .Where(r =>
                r.Status == "accepted" &&
                (r.RequesterId == userId || r.ReceiverId == userId))
            .Select(r => r.RequesterId == userId ? r.ReceiverId : r.RequesterId)
            .Distinct()
            .ToList();

        return _context.Users
            .Where(u => acceptedIds.Contains(u.Id))
            .OrderBy(u => u.UserName)
            .ToList();
    }

    public ConnectionRequest? SendRequest(string requesterId, string receiverId)
    {
        if (requesterId == receiverId)
        {
            return null;
        }

        var existing = _context.ConnectionRequests
            .FirstOrDefault(r =>
                ((r.RequesterId == requesterId && r.ReceiverId == receiverId) ||
                 (r.RequesterId == receiverId && r.ReceiverId == requesterId)) &&
                r.Status == "pending");

        if (existing != null)
        {
            return existing;
        }

        var request = new ConnectionRequest
        {
            RequesterId = requesterId,
            ReceiverId = receiverId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.ConnectionRequests.Add(request);
        _context.SaveChanges();
        return request;
    }

    public bool AcceptRequest(int requestId, string userId)
    {
        var request = _context.ConnectionRequests
            .FirstOrDefault(r => r.Id == requestId && r.ReceiverId == userId && r.Status == "pending");

        if (request == null)
        {
            return false;
        }

        request.Status = "accepted";
        request.RespondedAt = DateTime.UtcNow;
        _context.SaveChanges();
        return true;
    }

    public bool RejectRequest(int requestId, string userId)
    {
        var request = _context.ConnectionRequests
            .FirstOrDefault(r => r.Id == requestId && r.ReceiverId == userId && r.Status == "pending");

        if (request == null)
        {
            return false;
        }

        request.Status = "rejected";
        request.RespondedAt = DateTime.UtcNow;
        _context.SaveChanges();
        return true;
    }

    public List<SharedTransaction> GetSharedTransactions(string userId)
    {
        return _context.SharedTransactions
            .Where(s => s.SharedWithUserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToList();
    }

    public SharedTransaction ShareTransaction(string sharedByUserId, string sharedWithUserId, Transaction transaction)
    {
        var shared = new SharedTransaction
        {
            OriginalTransactionId = transaction.Id,
            SharedByUserId = sharedByUserId,
            SharedWithUserId = sharedWithUserId,
            Category = transaction.Category ?? "Other",
            Amount = transaction.Amount,
            Type = transaction.Type ?? "expense",
            Date = transaction.Date,
            Description = transaction.Title,
            CreatedAt = DateTime.UtcNow
        };

        _context.SharedTransactions.Add(shared);
        _context.SaveChanges();
        return shared;
    }

    public List<Budget> GetSharedBudgets(string userId)
    {
        return _context.Budgets
            .Where(b => b.IsShared && b.UserId != userId)
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .ToList();
    }

    public bool UserExists(string userId) => _context.Users.Any(u => u.Id == userId);
}
