using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("/api/goals")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly GoalService _goalService;

    public GoalsController(GoalService goalService)
    {
        _goalService = goalService;
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
    public ActionResult<List<Goal>> GetAll()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_goalService.GetAll(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("summary")]
    public ActionResult<List<GoalSummaryDto>> GetSummaries()
    {
        try
        {
            var userId = GetCurrentUserId();
            return Ok(_goalService.GetSummaries(userId));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpGet("{id}")]
    public ActionResult<Goal> GetById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var goal = _goalService.Get(id, userId);
            if (goal == null)
            {
                return NotFound();
            }
            return Ok(goal);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost]
    public ActionResult<Goal> Create([FromBody] Goal goal)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!_goalService.UserExists(userId))
            {
                return Unauthorized("User not found");
            }

            if (string.IsNullOrWhiteSpace(goal.Title))
            {
                return BadRequest("Title is required");
            }

            if (goal.TargetAmount <= 0)
            {
                return BadRequest("Target amount must be greater than zero");
            }

            if (goal.CurrentAmount < 0)
            {
                return BadRequest("Current amount cannot be negative");
            }

            goal.UserId = userId;
            _goalService.Add(goal);
            return CreatedAtAction(nameof(GetById), new { id = goal.Id }, goal);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating goal: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Goal goal)
    {
        try
        {
            var userId = GetCurrentUserId();
            var existing = _goalService.Get(id, userId);
            if (existing == null)
            {
                return NotFound();
            }

            goal.Id = id;
            goal.UserId = userId;
            _goalService.Update(goal, userId);
            return Ok(goal);
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
            var existing = _goalService.Get(id, userId);
            if (existing == null)
            {
                return NotFound();
            }

            _goalService.Delete(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid token");
        }
    }
}
