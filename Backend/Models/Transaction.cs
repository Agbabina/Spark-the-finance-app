namespace Backend.Models;

public class Transaction
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Category { get; set; }
    public int Amount { get; set; }
    public string? Type { get; set; } // "income" or "expense"
    public DateTime Date { get; set; }
}