using Backend.Models;

namespace Backend.Services;

public class AccountConnectionService
{
    private readonly AppDbContext _context;

    public AccountConnectionService(AppDbContext context)
    {
        _context = context;
    }

    public List<BankAccount> GetAll(string userId) => _context.BankAccounts
        .Where(a => a.UserId == userId)
        .ToList();

    public BankAccount? Get(int id, string userId) => _context.BankAccounts
        .FirstOrDefault(a => a.Id == id && a.UserId == userId);

    public void Add(BankAccount account)
    {
        account.UserId = account.UserId;
        _context.BankAccounts.Add(account);
        _context.SaveChanges();
    }

    public void Delete(int id, string userId)
    {
        var account = Get(id, userId);
        if (account != null)
        {
            _context.BankAccounts.Remove(account);
            _context.SaveChanges();
        }
    }

    public void Update(BankAccount account, string userId)
    {
        var existing = Get(account.Id, userId);
        if (existing != null)
        {
            existing.InstitutionName = account.InstitutionName;
            existing.AccountType = account.AccountType;
            existing.AccountName = account.AccountName;
            existing.LastFourDigits = account.LastFourDigits;
            existing.Balance = account.Balance;
            existing.IsActive = account.IsActive;
            _context.SaveChanges();
        }
    }

    public bool UserExists(string userId) => _context.Users.Any(u => u.Id == userId);
}
