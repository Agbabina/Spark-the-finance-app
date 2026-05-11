using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Transaction
{
    [Key]
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public string? Type { get; set; } // "income" or "expense"
    public DateTime Date { get; set; }
}
