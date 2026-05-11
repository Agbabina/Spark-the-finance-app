using Backend.Models;

namespace Backend.Services;

public class TransactionService
{
    private readonly AppDbContext _context;

    public TransactionService(AppDbContext context)
    {
        _context = context;
    }

    public List<Transaction> GetAll() => _context.Transactions.ToList();

    public Transaction? Get(int id) => _context.Transactions.FirstOrDefault(t => t.Id == id);

    public void Add(Transaction transaction)
    {
        try
        {
            Console.WriteLine($"Adding transaction to context: {transaction.Title}");
            _context.Transactions.Add(transaction);
            Console.WriteLine("Saving changes...");
            _context.SaveChanges();
            Console.WriteLine($"Transaction saved with Id={transaction.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving transaction: {ex.Message}");
            throw;
        }
    }

    public void Delete(int id)
    {
        var transaction = Get(id);
        if (transaction != null)
        {
            _context.Transactions.Remove(transaction);
            _context.SaveChanges();
        }
    }

    public void Update(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
        _context.SaveChanges();
    }
}