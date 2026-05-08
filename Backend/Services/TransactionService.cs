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
        _context.Transactions.Add(transaction);
        _context.SaveChanges();
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