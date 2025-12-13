# FastAPI Expense Splitter Backend

## Installation

Install the required dependencies:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Running the Server

Start the FastAPI server:

\`\`\`bash
python fastapi_server.py
\`\`\`

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Endpoints

### POST /calculate-settlement

Calculate optimal expense settlement with minimal transactions.

**Request Body:**
\`\`\`json
{
  "participants": [
    {
      "name": "Alice",
      "email": "alice@example.com",
      "amount_paid": 120.00
    },
    {
      "name": "Bob",
      "email": "bob@example.com",
      "amount_paid": 80.00
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "total_expense": 200.00,
  "per_person_share": 100.00,
  "transactions": [
    {
      "from_name": "Bob",
      "from_email": "bob@example.com",
      "to_name": "Alice",
      "to_email": "alice@example.com",
      "amount": 20.00
    }
  ],
  "summary": {
    "alice@example.com": {
      "name": "Alice",
      "amount_paid": 120.00,
      "should_pay": 0,
      "should_receive": 20.00
    },
    "bob@example.com": {
      "name": "Bob",
      "amount_paid": 80.00,
      "should_pay": 20.00,
      "should_receive": 0
    }
  }
}
