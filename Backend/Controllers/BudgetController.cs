using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
//  https://github.io/Spark-the-finance-app
//On X, https://x.com/Agbabinathedev
//Do not copy the first two slashes pls, it serves as code comments

namespace Backend.Controllers;

[ApiController]
[Route("/api/budgets")]
[Authorize]
public class BudgetController : ControllerBase
{
    private readonly BudgetService _budgetService;

    public BudgetController(BudgetService budgetService)
    {
        _budgetService = budgetService;
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

    [HttpGet]
    public ActionResult<List<Budget>> GetAll()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_budgetService.GetAll(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("summary")]
    public ActionResult<List<BudgetSummaryDto>> GetSummaries([FromQuery] int? month = null, [FromQuery] int? year = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_budgetService.GetSummaries(userId, month, year));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("{id}")]
    public ActionResult<Budget> GetById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var budget = _budgetService.Get(id, userId);
            if (budget == null)
            {
                return NotFound();
            }
            return Ok(budget);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost]
    public ActionResult<Budget> Create([FromBody] Budget budget)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!_budgetService.UserExists(userId))
            {
                return Unauthorized("User not found");
            }

            if (string.IsNullOrWhiteSpace(budget.Category))
            {
                return BadRequest("Category is required");
            }

            if (budget.Limit <= 0)
            {
                return BadRequest("Budget limit must be greater than zero");
            }

            if (budget.Month is < 1 or > 12)
            {
                return BadRequest("Month must be between 1 and 12");
            }

            if (budget.Year < 2000)
            {
                return BadRequest("Year is required");
            }

            var existing = _budgetService.GetForPeriod(userId, budget.Category, budget.Month, budget.Year);
            if (existing != null)
            {
                return Conflict(new { message = "A budget already exists for this category and month" });
            }

            budget.UserId = userId;
            _budgetService.Add(budget);
            return CreatedAtAction(nameof(GetById), new { id = budget.Id }, budget);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating budget: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Budget budget)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = _budgetService.Get(id, userId);
            if (existing == null)
            {
                return NotFound();
            }

            budget.Id = id;
            budget.UserId = userId;
            _budgetService.Update(budget, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = _budgetService.Get(id, userId);
            if (existing == null)
            {
                return NotFound();
            }

            _budgetService.Delete(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }
}
