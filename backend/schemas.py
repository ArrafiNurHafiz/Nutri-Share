"""Pydantic schemas for request validation and response models.

Mirrors the Zod schemas from server/validate.ts exactly.
"""
from __future__ import annotations

from pydantic import BaseModel, Field

# --- Request Schemas ---

class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class RegisterDonorRequest(BaseModel):
    business_name: str = Field(min_length=1)
    email: str = Field(min_length=1)
    password: str = Field(min_length=6)
    business_type: str = Field(pattern=r"^(hotel|restoran|kafe|katering|lainnya)$")
    address: str = Field(min_length=1)
    latitude: str = Field(min_length=1)
    longitude: str = Field(min_length=1)
    phone: str = Field(default="")


class RegisterRecipientRequest(BaseModel):
    institution_name: str = Field(min_length=1)
    email: str = Field(min_length=1)
    password: str = Field(min_length=6)
    institution_type: str = Field(
        pattern=r"^(panti_asuhan|rumah_singgah|lembaga_sosial|lainnya)$"
    )
    address: str = Field(min_length=1)
    latitude: str = Field(min_length=1)
    longitude: str = Field(min_length=1)
    phone: str = Field(default="")
    resident_count: str = Field(min_length=1)
    age_range: str = Field(min_length=1)
    health_condition: str = Field(min_length=1)
    daily_protein_need: str = Field(min_length=1)
    daily_calorie_need: str = Field(min_length=1)
    daily_iron_need: str = Field(min_length=1)
    daily_vitamin_c_need: str = Field(min_length=1)


class RegisterAdminRequest(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=1)
    password: str = Field(min_length=6)
    admin_key: str = Field(min_length=1)


class CreateDonationRequest(BaseModel):
    food_name: str = Field(min_length=1)
    food_type: str = Field(
        pattern=r"^(makanan_berat|sayur|lauk_protein|snack|minuman|lainnya)$"
    )
    portion_count: str | int = Field(default=0)
    protein_per_portion: str | int | float = Field(default=0)
    calorie_per_portion: str | int | float = Field(default=0)
    hours_valid: str | int = Field(default=24)
    pickup_latitude: str | int | float = Field(default=0)
    pickup_longitude: str | int | float = Field(default=0)
    notes: str = Field(default="")
    iron_mg: str | int | float | None = Field(default=None)
    vitamin_c_mg: str | int | float | None = Field(default=None)


class ClaimDonationRequest(BaseModel):
    recipient_id: int | None = None


class ReviewRequest(BaseModel):
    donation_id: int
    donor_id: int | None = None
    recipient_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str = Field(default="")


class AdminVerifyRequest(BaseModel):
    urgency_score: str | int | None = None


class EmergencyRequest(BaseModel):
    user_id: int


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=6)


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    address: str | None = None
    latitude: str | None = None
    longitude: str | None = None
    phone: str | None = None
    logo_url: str | None = None
    institution_name: str | None = None
    institution_type: str | None = None
    resident_count: str | None = None
    daily_protein_need: str | None = None
    daily_calorie_need: str | None = None
    daily_iron_need: str | None = None
    daily_vitamin_c_need: str | None = None


# --- Response Schemas ---

class MessageResponse(BaseModel):
    message: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str


class DonorProfileOut(BaseModel):
    id: int | None = None
    user_id: int
    business_name: str
    business_type: str
    address: str
    latitude: float
    longitude: float
    phone: str
    logo_url: str
    total_donations: int


class RecipientProfileOut(BaseModel):
    id: int | None = None
    user_id: int
    institution_name: str
    institution_type: str
    address: str
    latitude: float
    longitude: float
    phone: str
    resident_count: int
    age_range: str
    health_condition: str
    daily_protein_need: float
    daily_calorie_need: float
    daily_iron_need: float
    daily_vitamin_c_need: float
    urgency_score: int
    emergency: str
    last_received_donation: str | None = None
    document_url: str
