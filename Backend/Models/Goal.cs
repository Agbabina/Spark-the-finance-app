using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
//How much you are willing to save to buy that product

public class Goal
{
    [Key]
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public decimal TargetAmount { get; set; }

    public decimal CurrentAmount { get; set; }

    public DateTime? TargetDate { get; set; }

    public User? User { get; set; }
}
