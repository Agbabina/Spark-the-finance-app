using Backend.Models;

namespace Backend.Services;

public class BudgetService
{
    private readonly AppDbContext _context;

    public BudgetService(AppDbContext context)
    {
        _context = context;
    }

    public List<Budget> GetAll(string userId) =>
        _context.Budgets
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .ThenBy(b => b.Category)
            .ToList();

    public Budget? Get(int id, string userId) =>
        _context.Budgets.FirstOrDefault(b => b.Id == id && b.UserId == userId);

    public Budget? GetForPeriod(string userId, string category, int month, int year) =>
        _context.Budgets.FirstOrDefault(b =>
            b.UserId == userId &&
            b.Category == category &&
            b.Month == month &&
            b.Year == year);

    public List<BudgetSummaryDto> GetSummaries(string userId, int? month = null, int? year = null)
    {
        var budgets = _context.Budgets.Where(b => b.UserId == userId);

        if (month.HasValue)
        {
            budgets = budgets.Where(b => b.Month == month.Value);
        }

        if (year.HasValue)
        {
            budgets = budgets.Where(b => b.Year == year.Value);
        }

        var budgetList = budgets
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .ThenBy(b => b.Category)
            .ToList();

        return budgetList
            .Select(budget =>
            {
                var spent = _context.Transactions
                    .Where(t =>
                        t.UserId == userId &&
                        t.Type == "expense" &&
                        t.Category == budget.Category &&
                        t.Date.Month == budget.Month &&
                        t.Date.Year == budget.Year)
                    .Sum(t => t.Amount);

                return new BudgetSummaryDto
                {
                    Budget = budget,
                    Spent = spent
                };
            })
            .ToList();
    }

    public void Add(Budget budget)
    {
        _context.Budgets.Add(budget);
        _context.SaveChanges();
    }

    public void Delete(int id, string userId)
    {
        var budget = Get(id, userId);
        if (budget != null)
        {
            _context.Budgets.Remove(budget);
            _context.SaveChanges();
        }
    }

    public void Update(Budget budget, string userId)
    {
        var existing = Get(budget.Id, userId);
        if (existing != null)
        {
            _context.Entry(existing).CurrentValues.SetValues(budget);
            _context.SaveChanges();
        }
    }

    public bool UserExists(string userId) => _context.Users.Any(u => u.Id == userId);
}
