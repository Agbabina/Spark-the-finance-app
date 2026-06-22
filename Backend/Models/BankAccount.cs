using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class BankAccount
{
    [Key]
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }

    public string InstitutionName { get; set; } = string.Empty;
    public string AccountType { get; set; } = "checking";
    public string AccountName { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
}
