
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    //! Danger does not work
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

        [HttpGet]
        public ActionResult<List<Transaction>> GetAll()
        {
            var transactions = _transactionService.GetAll();
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public ActionResult<Transaction> GetById(int id)
        {
            var transaction = _transactionService.Get(id);
            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        [HttpPost]
        public ActionResult<Transaction> Create([FromBody] Transaction transaction)
        {
            try
            {
                Console.WriteLine($"Creating transaction: Title={transaction.Title}, Amount={transaction.Amount}, Type={transaction.Type}, Date={transaction.Date}");
                if (String.IsNullOrWhiteSpace(transaction.Title))
                {
                    Console.WriteLine("Transaction title is required");
                    return BadRequest("Transaction title is required");
                }
                _transactionService.Add(transaction);
                Console.WriteLine($"Transaction created with Id={transaction.Id}");
                return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating transaction: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _transactionService.Delete(id);
            return NoContent();
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Transaction transaction)
        {
            var existing = _transactionService.Get(id);
            if (existing == null)
            {
                return NotFound();
            }
            transaction.Id = id;
            _transactionService.Update(transaction);
            return NoContent();
        }
    }
}
