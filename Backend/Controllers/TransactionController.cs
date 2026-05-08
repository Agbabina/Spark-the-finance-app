
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            if (String.IsNullOrWhiteSpace(transaction.Title))
            {
                return BadRequest("Transaction title is required");
            }
            _transactionService.Add(transaction);
            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
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