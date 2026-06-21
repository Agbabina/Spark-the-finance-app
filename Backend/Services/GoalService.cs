using Backend.Models;

namespace Backend.Services;

public class GoalService
{
    private readonly AppDbContext _context;

    public GoalService(AppDbContext context)
    {
        _context = context;
    }

    public List<Goal> GetAll(string userId) =>
        _context.Goals
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.TargetDate ?? DateTime.MaxValue)
            .ThenBy(g => g.Title)
            .ToList();

    public Goal? Get(int id, string userId) =>
        _context.Goals.FirstOrDefault(g => g.Id == id && g.UserId == userId);

    public void Add(Goal goal)
    {
        _context.Goals.Add(goal);
        _context.SaveChanges();
    }

    public void Update(Goal goal, string userId)
    {
        var existing = Get(goal.Id, userId);
        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(goal);
            _context.SaveChanges();
        }
    }

    public void Delete(int id, string userId)
    {
        var goal = Get(id, userId);
        if (goal != null)
        {
            _context.Goals.Remove(goal);
            _context.SaveChanges();
        }
    }

    public bool UserExists(string userId) => _context.Users.Any(u => u.Id == userId);

    public List<GoalSummaryDto> GetSummaries(string userId) =>
        GetAll(userId)
            .Select(goal => new GoalSummaryDto { Goal = goal })
            .ToList();
}
