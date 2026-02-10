from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Dict
import uvicorn

app = FastAPI(title="Expense Splitter API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Participant(BaseModel):
    name: str
    email: EmailStr
    amount_paid: float

# --- Chat Models ---
class MessageCreate(BaseModel):
    sender_name: str
    text: str
    participants: list[str] | None = None

class MessageResponse(BaseModel):
    id: str
    event_id: str
    sender_name: str
    text: str
    created_at: str

# In-memory message store and participant registry
from datetime import datetime
import uuid
chat_store: Dict[str, list] = {}
event_participants: Dict[str, list] = {}

class ExpenseRequest(BaseModel):
    participants: List[Participant]

class Transaction(BaseModel):
    from_name: str
    from_email: str
    to_name: str
    to_email: str
    amount: float

class SettlementResponse(BaseModel):
    total_expense: float
    per_person_share: float
    transactions: List[Transaction]
    summary: Dict[str, Dict[str, float]]

def minimize_transactions(participants: List[Participant]) -> SettlementResponse:
    """
    Smart algorithm to minimize the number of transactions needed to settle expenses.
    Uses a greedy approach: match largest debtor with largest creditor.
    """
    if not participants:
        raise HTTPException(status_code=400, detail="No participants provided")
    
    # Calculate total expense and per-person share
    total_expense = sum(p.amount_paid for p in participants)
    num_participants = len(participants)
    per_person_share = total_expense / num_participants
    
    # Calculate balance for each participant (positive = should receive, negative = should pay)
    balances = []
    for p in participants:
        balance = p.amount_paid - per_person_share
        balances.append({
            'name': p.name,
            'email': p.email,
            'balance': round(balance, 2)
        })
    
    # Separate creditors (should receive) and debtors (should pay)
    creditors = [b for b in balances if b['balance'] > 0.01]  # Small tolerance for floating point
    debtors = [b for b in balances if b['balance'] < -0.01]
    
    # Sort by absolute balance (largest first)
    creditors.sort(key=lambda x: x['balance'], reverse=True)
    debtors.sort(key=lambda x: x['balance'])
    
    # Generate minimal transactions
    transactions = []
    i, j = 0, 0
    
    while i < len(creditors) and j < len(debtors):
        creditor = creditors[i]
        debtor = debtors[j]
        
        # Amount to transfer is minimum of what creditor should receive and debtor should pay
        amount = min(creditor['balance'], abs(debtor['balance']))
        
        if amount > 0.01:  # Only create transaction if amount is significant
            transactions.append(Transaction(
                from_name=debtor['name'],
                from_email=debtor['email'],
                to_name=creditor['name'],
                to_email=creditor['email'],
                amount=round(amount, 2)
            ))
        
        # Update balances
        creditor['balance'] -= amount
        debtor['balance'] += amount
        
        # Move to next creditor or debtor if balance is settled
        if creditor['balance'] < 0.01:
            i += 1
        if abs(debtor['balance']) < 0.01:
            j += 1
    
    # Create summary for each participant
    summary = {}
    for p in participants:
        summary[p.email] = {
            'name': p.name,
            'amount_paid': p.amount_paid,
            'should_pay': max(0, per_person_share - p.amount_paid),
            'should_receive': max(0, p.amount_paid - per_person_share)
        }
    
    return SettlementResponse(
        total_expense=round(total_expense, 2),
        per_person_share=round(per_person_share, 2),
        transactions=transactions,
        summary=summary
    )

@app.get("/")
def read_root():
    return {
        "message": "Expense Splitter API",
        "version": "1.0",
        "endpoints": {
            "POST /calculate-settlement": "Calculate expense settlement",
            "GET /events/{event_id}/messages": "Get chat messages for event",
            "POST /events/{event_id}/messages": "Send a chat message to event",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/calculate-settlement", response_model=SettlementResponse)
def calculate_settlement(request: ExpenseRequest):
    """
    Calculate optimal expense settlement with minimal transactions.
    """
    try:
        return minimize_transactions(request.participants)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Chat Endpoints ---

@app.get("/events/{event_id}/messages", response_model=List[MessageResponse])
def get_messages(event_id: str):
    """Get all messages for a specific event, ordered by creation time."""
    messages = chat_store.get(event_id, [])
    return sorted(messages, key=lambda m: m["created_at"])

@app.post("/events/{event_id}/messages", response_model=MessageResponse, status_code=201)
def create_message(event_id: str, message: MessageCreate):
    """Create a new chat message for a specific event."""
    if not message.sender_name.strip():
        raise HTTPException(status_code=400, detail="sender_name is required")
    if not message.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    if len(message.text) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 chars)")

    # Update and validate participant list
    if message.participants:
        event_participants[event_id] = message.participants
    known = event_participants.get(event_id)
    if known and message.sender_name.strip() not in known:
        raise HTTPException(
            status_code=403,
            detail=f"Unknown sender '{message.sender_name}'. Allowed: {', '.join(known)}"
        )

    msg = {
        "id": f"msg_{uuid.uuid4().hex[:12]}",
        "event_id": event_id,
        "sender_name": message.sender_name.strip(),
        "text": message.text.strip(),
        "created_at": datetime.utcnow().isoformat(),
    }

    if event_id not in chat_store:
        chat_store[event_id] = []
    chat_store[event_id].append(msg)

    return msg

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
