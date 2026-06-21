using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("/api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly TransactionService _transactionService;
    private readonly BudgetService _budgetService;
    private readonly GoalService _goalService;
    private readonly AiInsightService _aiInsightService;

    public AiController(
        TransactionService transactionService,
        BudgetService budgetService,
        GoalService goalService,
        AiInsightService aiInsightService)
    {
        _transactionService = transactionService;
        _budgetService = budgetService;
        _goalService = goalService;
        _aiInsightService = aiInsightService;
    }

    [HttpPost("insights")]
    public async Task<ActionResult<AiInsightResponse>> CreateInsight(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var insight = await _aiInsightService.GenerateAsync(
                _transactionService.GetAll(userId),
                _budgetService.GetAll(userId),
                _goalService.GetAll(userId),
                cancellationToken);

            return Ok(insight);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating AI insight: {ex}");
            return StatusCode(500, new { message = "AI insight failed. Please try again later." });
        }
    }

    [HttpPost("ask")]
    public async Task<ActionResult<AiQuestionResponse>> AskQuestion(
        [FromBody] AiQuestionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new { message = "Question is required." });
            }

            var userId = GetCurrentUserId();
            var answer = await _aiInsightService.AnswerQuestionAsync(
                request.Question,
                _transactionService.GetAll(userId),
                _budgetService.GetAll(userId),
                _goalService.GetAll(userId),
                cancellationToken);

            return Ok(answer);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error answering AI question: {ex}");
            return StatusCode(500, new { message = "AI question failed. Please try again later." });
        }
    }

    [HttpPost("transaction-draft")]
    public async Task<ActionResult<AiTransactionDraftResponse>> CreateTransactionDraft(
        [FromBody] AiTransactionDraftRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { message = "Transaction description is required." });
            }

            _ = GetCurrentUserId();
            var draft = await _aiInsightService.BuildTransactionDraftAsync(request.Text, cancellationToken);

            return Ok(draft);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating AI transaction draft: {ex}");
            return StatusCode(500, new { message = "AI transaction draft failed. Please try again later." });
        }
    }

    private string GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}
