import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from email_utils import send_email

router = APIRouter(prefix="/api/contact", tags=["Contact"])

class ContactRequest(BaseModel):
    firstName: str = ""
    lastName: str = ""
    name: str = ""
    email: EmailStr
    message: str

@router.post("/")
def submit_contact_form(body: ContactRequest):
    sender_name = body.name if body.name else f"{body.firstName} {body.lastName}".strip()
    subject = f"New Contact Submission from {sender_name}"
    
    email_body = f"""
    You have received a new contact message via Cardamo.
    
    Name: {sender_name}
    Email: {body.email}
    
    Message:
    {body.message}
    """
    
    recipient = os.getenv("SMTP_EMAIL")
    if not recipient:
        raise HTTPException(status_code=500, detail="Server email not configured.")
        
    success = send_email(recipient, subject, email_body, cc_email=body.email)
    
    if success:
        return {"message": "Email sent successfully."}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email. Check your SMTP configuration.")
