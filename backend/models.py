"""SQLModel models mirroring the existing NutriShare SQLite schema.

All tables match the Node.js schema exactly — no column renames, no type changes.
"""
from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    password: str
    role: str = Field()  # 'donor' | 'recipient' | 'admin'
    status: str = Field(default="pending")  # 'pending' | 'verified' | 'rejected'
    reset_token: Optional[str] = Field(default=None)
    reset_token_expiry: Optional[str] = Field(default=None)


class DonorProfile(SQLModel, table=True):
    __tablename__ = "donor_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(unique=True, foreign_key="users.id")
    business_name: str
    business_type: str  # 'hotel' | 'restoran' | 'kafe' | 'katering' | 'lainnya'
    address: str = Field(default="")
    latitude: float = Field(default=0)
    longitude: float = Field(default=0)
    phone: str = Field(default="")
    logo_url: str = Field(default="")
    total_donations: int = Field(default=0)


class RecipientProfile(SQLModel, table=True):
    __tablename__ = "recipient_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(unique=True, foreign_key="users.id")
    institution_name: str
    institution_type: str  # 'panti_asuhan' | 'rumah_singgah' | 'lembaga_sosial' | 'lainnya'
    address: str = Field(default="")
    latitude: float = Field(default=0)
    longitude: float = Field(default=0)
    phone: str = Field(default="")
    resident_count: int = Field(default=0)
    age_range: str = Field(default="")
    health_condition: str = Field(default="")
    daily_protein_need: float = Field(default=0)
    daily_calorie_need: float = Field(default=0)
    daily_iron_need: float = Field(default=0)
    daily_vitamin_c_need: float = Field(default=0)
    urgency_score: int = Field(default=1)
    emergency: str = Field(default="none")  # 'none' | 'pending' | 'active'
    last_received_donation: Optional[str] = Field(default=None)
    document_url: str = Field(default="")


class Donation(SQLModel, table=True):
    __tablename__ = "donations"
    id: Optional[int] = Field(default=None, primary_key=True)
    donor_id: int = Field(foreign_key="users.id")
    food_name: str
    food_type: str  # 'makanan_berat' | 'sayur' | 'lauk_protein' | 'snack' | 'minuman' | 'lainnya'
    portion_count: int
    protein_per_portion: float = Field(default=0)
    calorie_per_portion: float = Field(default=0)
    iron_mg: Optional[float] = Field(default=None)
    vitamin_c_mg: Optional[float] = Field(default=None)
    valid_until: str
    pickup_latitude: float
    pickup_longitude: float
    photo_url: str = Field(default="")
    notes: str = Field(default="")
    status: str = Field(default="active")  # 'active' | 'claimed' | 'completed' | 'expired'
    claimed_by: Optional[int] = Field(default=None)
    claimed_at: Optional[str] = Field(default=None)
    arrived_at: Optional[str] = Field(default=None)
    completed_at: Optional[str] = Field(default=None)
    created_at: str


class TopsisResult(SQLModel, table=True):
    __tablename__ = "topsis_results"
    id: Optional[int] = Field(default=None, primary_key=True)
    donation_id: int = Field(foreign_key="donations.id")
    recipient_id: int = Field(foreign_key="users.id")
    rank_position: int
    raw_c1: float = Field(default=0)
    raw_c2: float = Field(default=0)
    raw_c3: float = Field(default=0)
    raw_c4: float = Field(default=0)
    raw_c5: float = Field(default=0)
    weight_c1: float = Field(default=0)
    weight_c2: float = Field(default=0)
    weight_c3: float = Field(default=0)
    weight_c4: float = Field(default=0)
    weight_c5: float = Field(default=0)
    d_plus: float = Field(default=0)
    d_minus: float = Field(default=0)
    ci_score: float = Field(default=0)
    calculated_at: str


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    title: str
    message: str
    type: str  # 'donation_available' | 'claim_approved' | 'verification' | 'system'
    is_read: int = Field(default=0)
    related_donation_id: Optional[int] = Field(default=None)
    created_at: str


class Claim(SQLModel, table=True):
    __tablename__ = "claims"
    id: Optional[int] = Field(default=None, primary_key=True)
    donation_id: int = Field(foreign_key="donations.id")
    recipient_id: int = Field(foreign_key="users.id")
    topsis_rank_at_claim: int = Field(default=99)
    status: str = Field(default="pending")  # 'pending' | 'approved' | 'rejected'
    admin_note: Optional[str] = Field(default=None)
    created_at: str
    reviewed_at: Optional[str] = Field(default=None)
    reviewed_by: Optional[int] = Field(default=None)


class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    id: Optional[int] = Field(default=None, primary_key=True)
    donation_id: int = Field(foreign_key="donations.id")
    donor_id: int = Field(foreign_key="users.id")
    recipient_id: int = Field(foreign_key="users.id")
    rating: int = Field()  # 1-5
    comment: str = Field(default="")
    created_at: str


class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    action: str
    details: str = Field(default="")
    created_at: str
