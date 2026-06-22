
namespace Backend.Models;

public class TransactionMessage
{
    public string Action{get; set;}= string.Empty;
    public string BudgetId{get; set;}= string.Empty;
    public decimal Amount {get; set;}
    public string Category {get; set;}= string.Empty;
    
}