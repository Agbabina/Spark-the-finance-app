using Backend;
using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
//POle
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 3;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(jwtKey))
    {
        jwtKey = "YourSuperSecretKeyHere12345678901234567890";
    }
    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "YourIssuer";
    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "YourAudience";
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                context.NoResult();
            }
            return Task.CompletedTask;
        }
    };
})
.AddCookie("External")
.AddGoogle("Google", options =>
{
    options.SignInScheme = "External";
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? string.Empty;
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? string.Empty;
    options.SaveTokens = true;
    options.Scope.Add("profile");
    options.Scope.Add("email");
});

builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<BudgetService>();
builder.Services.AddScoped<BudgetRoomService>();
builder.Services.AddScoped<GoalService>();
builder.Services.AddScoped<AccountConnectionService>();
builder.Services.AddScoped<ConnectionService>();
builder.Services.AddHttpClient<AiInsightService>();

var frontendUrl = builder.Configuration["Frontend:Url"] ?? "http://localhost:5173";
var allowedOrigins = new[] { frontendUrl }.Where(origin => !string.IsNullOrWhiteSpace(origin)).ToArray();

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy("AllowReact", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .WithExposedHeaders("Content-Disposition");
        });
    }
);

var app = builder.Build();

try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        EnsureTransactionUserIdColumn(db);
        EnsureBudgetTable(db);
        EnsureGoalTable(db);
        EnsureBankAccountTable(db);
        EnsureBudgetIsSharedColumn(db);
        EnsureConnectionRequestsTable(db);
        EnsureSharedTransactionsTable(db);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database initialization error: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
}

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    app.Urls.Add($"http://0.0.0.0:{port}");
}

app.UseStaticFiles();
app.UseDefaultFiles();

app.UseRouting();

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();

static void EnsureTransactionUserIdColumn(AppDbContext db)
{
    // Repair older SQLite databases that were created before Transaction.UserId existed.
    var connection = db.Database.GetDbConnection();
    var shouldClose = connection.State != System.Data.ConnectionState.Open;

    if (shouldClose)
    {
        connection.Open();
    }

    try
    {
        var hasUserIdColumn = false;

        using (var pragmaCommand = connection.CreateCommand())
        {
            pragmaCommand.CommandText = "PRAGMA table_info(Transactions);";
            using var reader = pragmaCommand.ExecuteReader();

            while (reader.Read())
            {
                var columnName = reader.GetString(1);
                if (string.Equals(columnName, "UserId", StringComparison.OrdinalIgnoreCase))
                {
                    hasUserIdColumn = true;
                    break;
                }
            }
        }

        if (!hasUserIdColumn)
        {
            using var alterCommand = connection.CreateCommand();
            alterCommand.CommandText = "ALTER TABLE Transactions ADD COLUMN UserId TEXT NOT NULL DEFAULT '';";
            alterCommand.ExecuteNonQuery();
        }
    }
    finally
    {
        if (shouldClose)
        {
            connection.Close();
        }
    }
}

static void EnsureBudgetTable(AppDbContext db)
{
    var connection = db.Database.GetDbConnection();
    var shouldClose = connection.State != System.Data.ConnectionState.Open;

    if (shouldClose)
    {
        connection.Open();
    }

    try
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS Budgets (
                Id INTEGER NOT NULL CONSTRAINT PK_Budgets PRIMARY KEY AUTOINCREMENT,
                UserId TEXT NOT NULL,
                Category TEXT NOT NULL,
                [Limit] REAL NOT NULL,
                Month INTEGER NOT NULL,
                Year INTEGER NOT NULL,
                CONSTRAINT FK_Budgets_AspNetUsers_UserId FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
            );
            """;
        command.ExecuteNonQuery();
    }
    finally
    {
        if (shouldClose)
        {
            connection.Close();
        }
    }
}

    static void EnsureGoalTable(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                CREATE TABLE IF NOT EXISTS Goals (
                    Id INTEGER NOT NULL CONSTRAINT PK_Goals PRIMARY KEY AUTOINCREMENT,
                    UserId TEXT NOT NULL,
                    Title TEXT NOT NULL,
                    TargetAmount REAL NOT NULL,
                    CurrentAmount REAL NOT NULL,
                    TargetDate TEXT NULL,
                    CONSTRAINT FK_Goals_AspNetUsers_UserId FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
                );
                """;
            command.ExecuteNonQuery();
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    static void EnsureBankAccountTable(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                CREATE TABLE IF NOT EXISTS BankAccounts (
                    Id INTEGER NOT NULL CONSTRAINT PK_BankAccounts PRIMARY KEY AUTOINCREMENT,
                    UserId TEXT NOT NULL,
                    InstitutionName TEXT NOT NULL,
                    AccountType TEXT NOT NULL,
                    AccountName TEXT NOT NULL,
                    LastFourDigits TEXT NOT NULL,
                    Balance REAL NOT NULL,
                    IsActive INTEGER NOT NULL,
                    ConnectedAt TEXT NOT NULL,
                    CONSTRAINT FK_BankAccounts_AspNetUsers_UserId FOREIGN KEY (UserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
                );
                """;
            command.ExecuteNonQuery();
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    static void EnsureBudgetIsSharedColumn(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            var hasIsSharedColumn = false;

            using (var pragmaCommand = connection.CreateCommand())
            {
                pragmaCommand.CommandText = "PRAGMA table_info(Budgets);";
                using var reader = pragmaCommand.ExecuteReader();

                while (reader.Read())
                {
                    var columnName = reader.GetString(1);
                    if (string.Equals(columnName, "IsShared", StringComparison.OrdinalIgnoreCase))
                    {
                        hasIsSharedColumn = true;
                        break;
                    }
                }
            }

            if (!hasIsSharedColumn)
            {
                using var alterCommand = connection.CreateCommand();
                alterCommand.CommandText = "ALTER TABLE Budgets ADD COLUMN IsShared INTEGER NOT NULL DEFAULT 0;";
                alterCommand.ExecuteNonQuery();
            }
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    static void EnsureConnectionRequestsTable(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                CREATE TABLE IF NOT EXISTS ConnectionRequests (
                    Id INTEGER NOT NULL CONSTRAINT PK_ConnectionRequests PRIMARY KEY AUTOINCREMENT,
                    RequesterId TEXT NOT NULL,
                    ReceiverId TEXT NOT NULL,
                    Status TEXT NOT NULL DEFAULT 'pending',
                    CreatedAt TEXT NOT NULL,
                    RespondedAt TEXT NULL,
                    CONSTRAINT FK_ConnectionRequests_AspNetUsers_RequesterId FOREIGN KEY (RequesterId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE,
                    CONSTRAINT FK_ConnectionRequests_AspNetUsers_ReceiverId FOREIGN KEY (ReceiverId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
                );
                """;
            command.ExecuteNonQuery();
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    static void EnsureSharedTransactionsTable(AppDbContext db)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != System.Data.ConnectionState.Open;

        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = """
                CREATE TABLE IF NOT EXISTS SharedTransactions (
                    Id INTEGER NOT NULL CONSTRAINT PK_SharedTransactions PRIMARY KEY AUTOINCREMENT,
                    OriginalTransactionId INTEGER NOT NULL,
                    SharedByUserId TEXT NOT NULL,
                    SharedWithUserId TEXT NOT NULL,
                    Category TEXT NOT NULL,
                    Amount REAL NOT NULL,
                    Type TEXT NOT NULL,
                    Date TEXT NOT NULL,
                    Description TEXT NULL,
                    CreatedAt TEXT NOT NULL,
                    CONSTRAINT FK_SharedTransactions_AspNetUsers_SharedByUserId FOREIGN KEY (SharedByUserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE,
                    CONSTRAINT FK_SharedTransactions_AspNetUsers_SharedWithUserId FOREIGN KEY (SharedWithUserId) REFERENCES AspNetUsers (Id) ON DELETE CASCADE
                );
                """;
            command.ExecuteNonQuery();
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }
