
namespace Backend.Models;
public class Budget
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public string Category { get; set; } = null!;
    public decimal Limit{get;set;}
}