using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class ConnectionRequest
{
    [Key]
    public int Id { get; set; }
    public string RequesterId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }

    public User? Requester { get; set; }
    public User? Receiver { get; set; }
}
