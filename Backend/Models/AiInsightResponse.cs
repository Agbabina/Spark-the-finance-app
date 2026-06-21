namespace Backend.Models;

public enum AiPersonality
{
    Friendly,
    Direct,
    Motivational,
    Cautious,
    Witty
}

public class AiInsightResponse
{
    public string Summary { get; set; } = string.Empty;
    public List<string> Actions { get; set; } = [];
    public string? PersonalityUsed { get; set; }
}

public class AiQuestionRequest
{
    public string Question { get; set; } = string.Empty;
}

public class AiQuestionResponse
{
    public string Answer { get; set; } = string.Empty;
}

public class AiTransactionDraftRequest
{
    public string Text { get; set; } = string.Empty;
}

public class AiTransactionDraftResponse
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense";
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public string Note { get; set; } = string.Empty;
}
