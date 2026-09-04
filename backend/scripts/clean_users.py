"""Script to clean up non-admin user accounts except arrafinur2@gmail.com and arrafinur1@gmail.com."""
from __future__ import annotations

import asyncio
from sqlmodel import select, col, delete

from backend.database import init_db, get_session_maker
from backend.models import User, DonorProfile, RecipientProfile, Donation, Claim, Review, Notification, TopsisResult, ActivityLog


async def clean_users(dry_run: bool = False):
    init_db()
    SessionMaker = get_session_maker()
    async with SessionMaker() as session:
        result = await session.execute(select(User))
        all_users = result.scalars().all()
        
        keep_emails = {'arrafinur1@gmail.com', 'arrafinur2@gmail.com', 'arrafinur3@gmail.com'}
        keep_users = [u for u in all_users if u.email in keep_emails]
        delete_users = [u for u in all_users if u not in keep_users]
        
        delete_ids = [u.id for u in delete_users]
        keep_ids = [u.id for u in keep_users]
        
        print(f"Total initial users: {len(all_users)}")
        print(f"Users to keep ({len(keep_users)}): {[u.email for u in keep_users]}")
        print(f"Users to delete: {len(delete_users)}")
        
        if not delete_ids:
            print("No users to delete. Done.")
            return

        # Get donations created by deleted donors
        don_by_del = (await session.execute(select(Donation.id).where(col(Donation.donor_id).in_(delete_ids)))).scalars().all()
        
        # 1. Reset claimed_by on kept donations if claimed by a deleted recipient
        reset_donations = (await session.execute(
            select(Donation).where(col(Donation.claimed_by).in_(delete_ids))
        )).scalars().all()
        for d in reset_donations:
            if d.donor_id in keep_ids:
                print(f"Resetting claimed_by for kept donation ID {d.id} (food: {d.food_name})")
                d.claimed_by = None
                d.claimed_at = None
                d.status = "active"
                session.add(d)

        # 2. Delete TopsisResults
        stmt = delete(TopsisResult).where(
            col(TopsisResult.recipient_id).in_(delete_ids) | col(TopsisResult.donation_id).in_(don_by_del if don_by_del else [-1])
        )
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} TopsisResult records")

        # 3. Delete Claims
        stmt = delete(Claim).where(
            col(Claim.recipient_id).in_(delete_ids) | 
            col(Claim.reviewed_by).in_(delete_ids) | 
            col(Claim.donation_id).in_(don_by_del if don_by_del else [-1])
        )
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} Claim records")

        # 4. Delete Reviews
        stmt = delete(Review).where(
            col(Review.donor_id).in_(delete_ids) | 
            col(Review.recipient_id).in_(delete_ids) | 
            col(Review.donation_id).in_(don_by_del if don_by_del else [-1])
        )
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} Review records")

        # 5. Delete Notifications
        stmt = delete(Notification).where(
            col(Notification.user_id).in_(delete_ids) | 
            col(Notification.related_donation_id).in_(don_by_del if don_by_del else [-1])
        )
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} Notification records")

        # 6. Delete Donations
        if don_by_del:
            stmt = delete(Donation).where(col(Donation.id).in_(don_by_del))
            r = await session.execute(stmt)
            print(f"Deleted {r.rowcount} Donation records")

        # 7. Delete DonorProfiles
        stmt = delete(DonorProfile).where(col(DonorProfile.user_id).in_(delete_ids))
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} DonorProfile records")

        # 8. Delete RecipientProfiles
        stmt = delete(RecipientProfile).where(col(RecipientProfile.user_id).in_(delete_ids))
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} RecipientProfile records")

        # 9. Delete ActivityLogs
        stmt = delete(ActivityLog).where(col(ActivityLog.user_id).in_(delete_ids))
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} ActivityLog records")

        # 10. Delete Users
        stmt = delete(User).where(col(User.id).in_(delete_ids))
        r = await session.execute(stmt)
        print(f"Deleted {r.rowcount} User records")

        if dry_run:
            print("DRY RUN - Rolling back changes.")
            await session.rollback()
        else:
            print("COMMITTING DELETIONS TO DATABASE...")
            await session.commit()

        # Check final user list
        remaining = (await session.execute(select(User))).scalars().all()
        print(f"\nFinal remaining users count: {len(remaining)}")
        for u in remaining:
            print(f"  ID: {u.id}, Email: {u.email}, Role: {u.role}, Name: {u.name}")


if __name__ == "__main__":
    import sys
    dry_run_flag = "--dry-run" in sys.argv
    asyncio.run(clean_users(dry_run=dry_run_flag))
