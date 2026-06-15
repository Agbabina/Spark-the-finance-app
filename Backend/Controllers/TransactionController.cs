
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("/api/transactions")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly TransactionService _transactionService;

        public TransactionController(TransactionService transactionService)
        {
            _transactionService = transactionService;
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
        public ActionResult<List<Transaction>> GetAll()
        {
            try
            {
                var userId = GetCurrentUserId();
                var transactions = _transactionService.GetAll(userId);
                return Ok(transactions);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Transaction> GetById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var transaction = _transactionService.Get(id, userId);
                if (transaction == null)
                {
                    return NotFound();
                }
                return Ok(transaction);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
        }

        [HttpPost]
        public ActionResult<Transaction> Create([FromBody] Transaction transaction)
        {
            try
            {
                // Debug logging to help trace 401 issues
                Console.WriteLine($"Authorization header: {Request.Headers["Authorization"]}");
                var userClaims = User.Claims.Select(c => $"{c.Type}={c.Value}");
                Console.WriteLine($"User claims: {string.Join(",", userClaims)}");

                var userId = GetCurrentUserId();
                if (!_transactionService.UserExists(userId))
                {
                    Console.WriteLine($"User {userId} not found in database.");
                    return Unauthorized("User not found");
                }
                Console.WriteLine($"Creating transaction for user {userId}: Title={transaction.Title}, Amount={transaction.Amount}, Type={transaction.Type}, Date={transaction.Date}");
                
                if (String.IsNullOrWhiteSpace(transaction.Title))
                {
                    Console.WriteLine("Transaction title is required");
                    return BadRequest("Transaction title is required");
                }

                transaction.UserId = userId;
                _transactionService.Add(transaction);
                Console.WriteLine($"Transaction created with Id={transaction.Id}");
                return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating transaction: {ex}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException}");
                }
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var transaction = _transactionService.Get(id, userId);
                if (transaction == null)
                {
                    return NotFound();
                }
                _transactionService.Delete(id, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Transaction transaction)
        {
            try
            {
                var userId = GetCurrentUserId();
                var existing = _transactionService.Get(id, userId);
                if (existing == null)
                {
                    return NotFound();
                }
                transaction.Id = id;
                transaction.UserId = userId;
                _transactionService.Update(transaction, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Invalid token");
            }
        }
    }
}
