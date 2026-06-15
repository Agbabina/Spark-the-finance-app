using Backend.Models;

namespace Backend.Services;

public class TransactionService
{
    private readonly AppDbContext _context;

    public TransactionService(AppDbContext context)
    {
        _context = context;
    }

    public List<Transaction> GetAll(string userId) => _context.Transactions.Where(t => t.UserId == userId).ToList();

    public Transaction? Get(int id, string userId) => _context.Transactions.FirstOrDefault(t => t.Id == id && t.UserId == userId);

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
            Console.WriteLine($"Error saving transaction: {ex}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException}");
            }
            throw;
        }
    }

    public void Delete(int id, string userId)
    {
        var transaction = Get(id, userId);
        if (transaction != null)
        {
            _context.Transactions.Remove(transaction);
            _context.SaveChanges();
        }
    }

    public void Update(Transaction transaction, string userId)
    {
        var existing = Get(transaction.Id, userId);
        if (existing != null)
        {
            _context.Transactions.Update(transaction);
            _context.SaveChanges();
        }
    }

    public bool UserExists(string userId) => _context.Users.Any(u => u.Id == userId);
}