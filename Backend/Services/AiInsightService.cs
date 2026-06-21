using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Backend.Models;

namespace Backend.Services;

public class AiInsightService
{
    private static readonly string[] ExpenseCategories =
    [
        "Food",
        "Groceries",
        "Bills",
        "Rent",
        "Transport",
        "Health",
        "Shopping",
        "Entertainment",
        "Education",
        "Subscriptions",
        "Travel",
        "Savings",
        "Debt",
        "Other"
    ];

    private static readonly Dictionary<AiPersonality, string> PersonalityPrompts = new()
    {
        [AiPersonality.Friendly] = "You are Spark's finance coach. Give warm, encouraging guidance with a friendly tone. Celebrate small wins! Use emojis sparingly. Return only valid JSON with summary and actions array.",
        [AiPersonality.Direct] = "You are Spark's finance coach. Be concise and direct. No fluff, just actionable steps. Return only valid JSON with summary and actions array.",
        [AiPersonality.Motivational] = "You are Spark's fiery finance coach. Be hype and motivational! Use energetic language to push users toward their goals. Exclaim wins! Return only valid JSON with summary and actions array.",
        [AiPersonality.Cautious] = "You are Spark's conservative finance coach. Highlight risks, suggest careful planning, and warn about overspending. Promote sustainable habits. Return only valid JSON with summary and actions array.",
        [AiPersonality.Witty] = "You are Spark's witty finance coach. Be clever and add light humor while giving practical advice. Drop a finance pun when appropriate. Return only valid JSON with summary and actions array."
    };

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AiInsightService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<AiInsightResponse> GenerateAsync(
        List<Transaction> transactions,
        List<Budget> budgets,
        List<Goal> goals,
        CancellationToken cancellationToken = default)
    {
        if (!IsAiConfigured())
        {
            return new AiInsightResponse
            {
                Summary = "AI insights are not configured yet. Add an API key to enable personalized guidance.",
                Actions = ["Add your AI API key on the backend", "Restart the backend after changing configuration"]
            };
        }

        var personality = SelectPersonality(transactions, budgets, goals);
        var requestBody = BuildChatRequestBody(
            PersonalityPrompts[personality],
            BuildSnapshot(transactions, budgets, goals),
            maxTokens: 450);

        try
        {
            var content = await SendAiRequestAsync(requestBody, cancellationToken);
            using var document = JsonDocument.Parse(content);
            var message = GetMessageContent(document);

            if (string.IsNullOrWhiteSpace(message))
            {
                return BuildFallbackInsight(transactions, budgets, goals, personality);
            }

            var response = ParseInsight(message, personality);
            return response;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or InvalidOperationException)
        {
            Console.WriteLine($"AI insight fallback used: {ex.Message}");
            return BuildFallbackInsight(transactions, budgets, goals, personality);
        }
    }
    public async Task<AiQuestionResponse> AnswerQuestionAsync(
        string question,
        List<Transaction> transactions,
        List<Budget> budgets,
        List<Goal> goals,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(question))
        {
            return new AiQuestionResponse { Answer = "Ask a finance question first." };
        }

        var fallback = BuildQuestionFallback(question, transactions, budgets, goals);
        if (!IsAiConfigured())
        {
            return fallback;
        }

        var requestBody = BuildChatRequestBody(
            "You are Spark's online finance coach. Answer the user's question using only their provided finance snapshot. Be concise, practical, and avoid investment, legal, or tax certainty. Return only valid JSON with a string property named answer.",
            new
            {
                question,
                snapshot = BuildSnapshot(transactions, budgets, goals)
            },
            maxTokens: 500);

        try
        {
            var content = await SendAiRequestAsync(requestBody, cancellationToken);
            using var document = JsonDocument.Parse(content);
            var message = GetMessageContent(document);

            if (string.IsNullOrWhiteSpace(message))
            {
                return fallback;
            }

            var parsed = JsonSerializer.Deserialize<AiQuestionResponse>(
                message,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return parsed != null && !string.IsNullOrWhiteSpace(parsed.Answer) ? parsed : fallback;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or InvalidOperationException)
        {
            Console.WriteLine($"AI question fallback used: {ex.Message}");
            return fallback;
        }
    }

    public async Task<AiTransactionDraftResponse> BuildTransactionDraftAsync(
        string text,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return new AiTransactionDraftResponse { Note = "Describe the transaction first." };
        }

        var fallback = BuildTransactionDraftFallback(text);
        if (!IsAiConfigured())
        {
            return fallback;
        }

        var today = DateTime.UtcNow.Date;
        var requestBody = BuildChatRequestBody(
            $"You convert short personal-finance notes into one transaction draft. Today's date is {today:yyyy-MM-dd}. Allowed type values: income, expense. Allowed expense categories: {string.Join(", ", ExpenseCategories)}. Return only valid JSON with title, amount, type, category, date, and note. Date must be ISO 8601. Use NGN by default when currency is not stated.",
            new { text },
            maxTokens: 250);

        try
        {
            var content = await SendAiRequestAsync(requestBody, cancellationToken);
            using var document = JsonDocument.Parse(content);
            var message = GetMessageContent(document);

            if (string.IsNullOrWhiteSpace(message))
            {
                return fallback;
            }

            var parsed = JsonSerializer.Deserialize<AiTransactionDraftResponse>(
                message,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return parsed == null ? fallback : NormalizeTransactionDraft(parsed, fallback);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or InvalidOperationException)
        {
            Console.WriteLine($"AI transaction draft fallback used: {ex.Message}");
            return fallback;
        }
    }

    private bool IsAiConfigured()
    {
        return !string.IsNullOrWhiteSpace(_configuration["Ai:ApiKey"]);
    }

    private object BuildChatRequestBody(string systemPrompt, object userPayload, int maxTokens)
    {
        var model = _configuration["Ai:Model"] ?? "openai/gpt-4o-mini";
        return new
        {
            model,
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = systemPrompt
                },
                new
                {
                    role = "user",
                    content = JsonSerializer.Serialize(userPayload)
                }
            },
            temperature = 0.3,
            max_tokens = maxTokens,
            response_format = new { type = "json_object" }
        };
    }

    private async Task<string> SendAiRequestAsync(object requestBody, CancellationToken cancellationToken)
    {
        var apiKey = _configuration["Ai:ApiKey"];
        var baseUrl = _configuration["Ai:BaseUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";

        using var request = new HttpRequestMessage(HttpMethod.Post, baseUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.TryAddWithoutValidation("HTTP-Referer", "http://localhost:5219");
        request.Headers.TryAddWithoutValidation("X-Title", "Spark Finance");
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"AI request failed: {(int)response.StatusCode} {content}");
            throw new HttpRequestException($"AI request failed with status {(int)response.StatusCode}");
        }

        return content;
    }

    private static string? GetMessageContent(JsonDocument document)
    {
        return document.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
    }

    private static object BuildSnapshot(List<Transaction> transactions, List<Budget> budgets, List<Goal> goals)
    {
        var totalIncome = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        return new
        {
            currency = "NGN",
            totals = new
            {
                income = totalIncome,
                expenses = totalExpenses,
                balance = totalIncome - totalExpenses
            },
            expenseCategories = transactions
                .Where(t => t.Type == "expense" && !string.IsNullOrWhiteSpace(t.Category))
                .GroupBy(t => t.Category)
                .Select(g => new { category = g.Key, total = g.Sum(t => t.Amount) })
                .OrderByDescending(x => x.total)
                .Take(8),
            currentBudgets = budgets
                .Where(b => b.Month == currentMonth && b.Year == currentYear)
                .Select(b => new { b.Category, limit = b.Limit }),
            goals = goals.Select(g => new
            {
                g.Title,
                target = g.TargetAmount,
                saved = g.CurrentAmount,
                g.TargetDate
            }),
            recentTransactions = transactions
                .OrderByDescending(t => t.Date)
                .Take(20)
                .Select(t => new { t.Title, t.Amount, t.Type, t.Category, t.Date })
        };
    }

    private static AiInsightResponse ParseInsight(string message, AiPersonality personality)
    {
        try
        {
            var parsed = JsonSerializer.Deserialize<AiInsightResponse>(
                message,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (parsed != null && !string.IsNullOrWhiteSpace(parsed.Summary))
            {
                parsed.Actions = parsed.Actions?.Take(3).ToList() ?? [];
                parsed.PersonalityUsed = personality.ToString();
                return parsed;
            }
        }
        catch (JsonException)
        {
        }

        return new AiInsightResponse
        {
            Summary = message.Trim(),
            Actions = [],
            PersonalityUsed = personality.ToString()
        };
    }

    private static AiQuestionResponse BuildQuestionFallback(
        string question,
        List<Transaction> transactions,
        List<Budget> budgets,
        List<Goal> goals)
    {
        var totalIncome = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);
        var topCategory = transactions
            .Where(t => t.Type == "expense" && !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.Total)
            .FirstOrDefault();
        var lowered = question.ToLowerInvariant();

        if (lowered.Contains("budget") && budgets.Count > 0)
        {
            return new AiQuestionResponse { Answer = $"You have {budgets.Count} budgets. Your total recorded expenses are NGN {totalExpenses:N0}, so check the biggest categories before raising limits." };
        }

        if (lowered.Contains("goal") && goals.Count > 0)
        {
            var nextGoal = goals.First();
            return new AiQuestionResponse { Answer = $"{nextGoal.Title} has NGN {nextGoal.CurrentAmount:N0} saved toward NGN {nextGoal.TargetAmount:N0}. Keep contributions consistent after income arrives." };
        }

        var topCategoryText = topCategory == null
            ? "Add categorized expenses for sharper answers."
            : $"{topCategory.Category} is your highest expense category at NGN {topCategory.Total:N0}.";

        return new AiQuestionResponse
        {
            Answer = $"AI is unavailable, so here is a local answer: income is NGN {totalIncome:N0}, expenses are NGN {totalExpenses:N0}, and {topCategoryText}"
        };
    }

    private static AiInsightResponse BuildFallbackInsight(List<Transaction> transactions, List<Budget> budgets, List<Goal> goals, AiPersonality personality)
    {
        var totalIncome = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);
        var balance = totalIncome - totalExpenses;
        var topCategory = transactions
            .Where(t => t.Type == "expense" && !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.Total)
            .FirstOrDefault();
        var completedGoals = goals.Count(g => g.CurrentAmount >= g.TargetAmount && g.TargetAmount > 0);

        var (summary, actions) = personality switch
        {
            AiPersonality.Witty => (
                topCategory == null
                    ? $"Your current balance is NGN {Math.Abs(balance):N0}. Add more categorized transactions to unlock sharper AI guidance — your wallet called, it wants to be understood!"
                    : $"Your current balance is NGN {Math.Abs(balance):N0}, and {topCategory.Category} is gobbling up NGN {topCategory.Total:N0}. Time to show those expenses who's boss!",
                new List<string>
                {
                    balance >= 0 ? "Move part of the surplus into a goal — make your money work for you!" : "Pause nonessential spending until income catches up — your wallet needs a breather",
                    budgets.Count > 0 ? "Compare this month's spending against each budget — detective mode on" : "Create a budget for your top spending category — future you will thank you",
                    completedGoals > 0 ? $"Celebrate your completed goals — {completedGoals} down!" : (goals.Count > 0 ? "Update your savings goals after each deposit" : "Add one savings goal with a clear target")
                }),
            AiPersonality.Motivational => (
                topCategory == null
                    ? $"Your current balance is NGN {Math.Abs(balance):N0}. You're building momentum — add more transactions and watch your financial clarity explode!"
                    : $"Your current balance is NGN {Math.Abs(balance):N0}, and {topCategory.Category} is your highest expense at NGN {topCategory.Total:N0}. Crush those costs!",
                new List<string>
                {
                    balance >= 0 ? "Move part of the surplus into a goal — you're on fire!" : "Pause nonessential spending — your discipline is your superpower",
                    budgets.Count > 0 ? "Compare this month's spending against each budget — smash those limits!" : "Create a budget for your top spending category — let's go!",
                    goals.Count > 0 ? "Update your savings goals after each deposit — consistency wins!" : "Add one savings goal with a clear target — your future self is waiting!"
                }),
            AiPersonality.Cautious => (
                topCategory == null
                    ? $"Your current balance is NGN {Math.Abs(balance):N0}. Proceed carefully — more categorized transactions will reveal spending patterns."
                    : $"Your current balance is NGN {Math.Abs(balance):N0}. {topCategory.Category} expenses total NGN {topCategory.Total:N0}. Consider caps for sustainability.",
                new List<string>
                {
                    balance >= 0 ? "Move part of the surplus into an emergency buffer" : "Pause nonessential spending until income catches up",
                    budgets.Count > 0 ? "Review this month's spending against each budget for early warnings" : "Create a conservative budget for your top spending category",
                    goals.Count > 0 ? "Update savings goals, but plan for potential setbacks" : "Add one savings goal with a realistic, conservative target"
                }),
            AiPersonality.Direct => (
                topCategory == null
                    ? $"Balance: NGN {Math.Abs(balance):N0}. Add categorized transactions for better insights."
                    : $"Balance: NGN {Math.Abs(balance):N0}. Top expense: {topCategory.Category} (NGN {topCategory.Total:N0}).",
                new List<string>
                {
                    balance >= 0 ? "Save surplus to goal" : "Reduce nonessential expenses",
                    budgets.Count > 0 ? "Review budget limits" : "Set budget for top category",
                    goals.Count > 0 ? "Update goal progress" : "Add a savings goal"
                }),
            _ => (
                topCategory == null
                    ? $"Your current balance is NGN {Math.Abs(balance):N0}. Add more categorized transactions to unlock sharper AI guidance."
                    : $"Your current balance is NGN {Math.Abs(balance):N0}, and {topCategory.Category} is your highest expense category at NGN {topCategory.Total:N0}.",
                new List<string>
                {
                    balance >= 0 ? "Move part of the surplus into a goal" : "Pause nonessential spending until income catches up",
                    budgets.Count > 0 ? "Compare this month's spending against each budget" : "Create a budget for your top spending category",
                    goals.Count > 0 ? "Update your savings goals after each deposit" : "Add one savings goal with a clear target"
                })
        };

        return new AiInsightResponse
        {
            Summary = summary,
            Actions = actions,
            PersonalityUsed = personality.ToString()
        };
    }

    private static AiPersonality SelectPersonality(List<Transaction> transactions, List<Budget> budgets, List<Goal> goals)
    {
        var totalIncome = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);
        var balance = totalIncome - totalExpenses;
        var completedGoals = goals.Count(g => g.CurrentAmount >= g.TargetAmount && g.TargetAmount > 0);

        if (completedGoals > 0) return AiPersonality.Motivational;
        if (Math.Abs(balance) < 10000) return AiPersonality.Motivational;
        if (balance < 0) return AiPersonality.Cautious;
        if (totalExpenses > (totalIncome * 0.8m)) return AiPersonality.Direct;
        return AiPersonality.Friendly;
    }

    private static AiTransactionDraftResponse BuildTransactionDraftFallback(string text)
    {
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var amount = words
            .Select(word => new string(word.Where(character => char.IsDigit(character) || character == '.').ToArray()))
            .Where(value => decimal.TryParse(value, out _))
            .Select(decimal.Parse)
            .FirstOrDefault();
        var lowered = text.ToLowerInvariant();
        var type = lowered.Contains("salary") || lowered.Contains("income") || lowered.Contains("received") || lowered.Contains("paid me")
            ? "income"
            : "expense";
        var category = type == "income" ? string.Empty : GuessCategory(text);

        return new AiTransactionDraftResponse
        {
            Title = string.IsNullOrWhiteSpace(text) ? "New transaction" : text.Trim(),
            Amount = amount,
            Type = type,
            Category = category,
            Date = DateTime.UtcNow.Date,
            Note = "Drafted locally because online AI was unavailable. Please review before saving."
        };
    }

    private static AiTransactionDraftResponse NormalizeTransactionDraft(
        AiTransactionDraftResponse parsed,
        AiTransactionDraftResponse fallback)
    {
        var type = parsed.Type.Equals("income", StringComparison.OrdinalIgnoreCase) ? "income" : "expense";
        var category = type == "income"
            ? string.Empty
            : ExpenseCategories.Contains(parsed.Category) ? parsed.Category : fallback.Category;

        return new AiTransactionDraftResponse
        {
            Title = string.IsNullOrWhiteSpace(parsed.Title) ? fallback.Title : parsed.Title.Trim(),
            Amount = parsed.Amount > 0 ? parsed.Amount : fallback.Amount,
            Type = type,
            Category = category,
            Date = parsed.Date == default ? fallback.Date : parsed.Date.Date,
            Note = string.IsNullOrWhiteSpace(parsed.Note) ? "Review this AI draft before saving." : parsed.Note.Trim()
        };
    }

    private static string GuessCategory(string text)
    {
        var lowered = text.ToLowerInvariant();
        if (ContainsAny(lowered, ["restaurant", "meal", "food", "lunch", "dinner", "pizza", "kfc"])) return "Food";
        if (ContainsAny(lowered, ["grocery", "groceries", "shoprite", "market", "supermarket"])) return "Groceries";
        if (ContainsAny(lowered, ["uber", "bolt", "bus", "taxi", "fuel", "petrol"])) return "Transport";
        if (ContainsAny(lowered, ["electric", "internet", "airtime", "data", "water", "bill"])) return "Bills";
        if (ContainsAny(lowered, ["netflix", "spotify", "prime", "subscription", "youtube"])) return "Subscriptions";
        if (ContainsAny(lowered, ["clinic", "hospital", "pharmacy", "medicine"])) return "Health";
        if (ContainsAny(lowered, ["school", "course", "book", "tuition"])) return "Education";
        if (ContainsAny(lowered, ["loan", "debt", "repay"])) return "Debt";
        return "Other";
    }

    private static bool ContainsAny(string text, string[] keywords)
    {
        return keywords.Any(text.Contains);
    }
}
