namespace Backend.Models;

public class BudgetSummaryDto
{
    public Budget Budget { get; set; } = new();
    public decimal Spent { get; set; }
    public decimal Remaining => Budget.Limit - Spent;
    public decimal UsagePercent => Budget.Limit <= 0 ? 0 : Math.Min(100, (Spent / Budget.Limit) * 100);
}
