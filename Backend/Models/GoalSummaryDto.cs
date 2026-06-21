namespace Backend.Models;

public class GoalSummaryDto
{
    public Goal Goal { get; set; } = new();
    //For progress bar 32000 20000 
    // int b= Math.Min(100, 34)
    //Console.WriteLine(b)
    //0.625* 100 = 62.5--> Returned 
    public decimal Remaining => Goal.TargetAmount - Goal.CurrentAmount;
    public decimal ProgressPercent => Goal.TargetAmount <= 0 ? 0 : Math.Min(100, (Goal.CurrentAmount / Goal.TargetAmount) * 100);
}
