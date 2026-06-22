using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class SharedTransaction
{
    [Key]
    public int Id { get; set; }
    public int OriginalTransactionId { get; set; }
    public string SharedByUserId { get; set; } = string.Empty;
    public string SharedWithUserId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? SharedByUser { get; set; }
    public User? SharedWithUser { get; set; }
}
