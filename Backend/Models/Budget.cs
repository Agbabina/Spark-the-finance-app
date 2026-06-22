using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Budget
{
    [Key]
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal Limit { get; set; }

    public int Month { get; set; }

    public int Year { get; set; }

    public bool IsShared { get; set; } = false;

    public User? User { get; set; }
}
