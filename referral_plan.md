# Referral System Implementation Plan

## Overview
Create a referral system where users can invite others to join the waitlist and both parties receive free months.

## Free Month Rules
1. **Every waitlist signup** → 1 month free (base reward)
2. **Referral signup** → Additional 1 month free (total: 2 months)
3. **Successful referrer** → 1 month free per successful referral (only when referee joins)

## Database Schema Changes

### 1. Update Waitlist Table
```sql
-- Add referrer tracking to existing waitlist table
ALTER TABLE waitlist ADD COLUMN referrer_id uuid REFERENCES waitlist(id);
```

### 2. New Referral Transactions Table
```sql
CREATE TABLE referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES waitlist(id),
  transaction_type TEXT NOT NULL, -- 'base_signup', 'referral_bonus', 'referrer_reward'
  months_count INTEGER NOT NULL,
  description TEXT,
  referred_user_id uuid REFERENCES waitlist(id), -- for referrer_reward type
  created_at TIMESTAMP DEFAULT now()
);
```

### 3. Referral Analytics Table
```sql
CREATE TABLE referral_analytics (
  user_id uuid PRIMARY KEY REFERENCES waitlist(id),
  total_referrals INTEGER DEFAULT 0,
  total_free_months INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT now()
);
```

## Implementation Phases

### Phase 1: Database Foundation
- [ ] Create database migration with new tables
- [ ] Update `src/drizzle/src/db/schema.ts` with referral schemas
- [ ] Add Zod validation schemas for referral data
- [ ] Create database mutations for referral operations

### Phase 2: Core Business Logic
- [ ] Create `src/services/referral.ts` service file
- [ ] Implement `processReferralRewards(newUserId, referrerId?)` function
- [ ] Add referral link generation utilities
- [ ] Create referral analytics query functions

### Phase 3: API Integration
- [ ] Update `src/server/api/routers/waitlist.ts` to handle referrals
- [ ] Add referral parameter to waitlist submission
- [ ] Create referral analytics endpoints
- [ ] Add referral link generation endpoint

### Phase 4: Frontend Updates
- [ ] Update `WaitlistForm.tsx` to capture `?ref=userId` URL parameter
- [ ] Modify success screen to show referral sharing options
- [ ] Create `ReferralSharing.tsx` component with copyable links
- [ ] Add referral analytics display (optional)

### Phase 5: Testing & Validation
- [ ] Test complete referral flow
- [ ] Verify reward attribution logic
- [ ] Test edge cases (invalid refs, self-referrals, etc.)
- [ ] Run lint and typecheck

## Core Functions

### `processReferralRewards(newUserId: string, referrerId?: string)`
1. Create base signup reward (1 month) for new user
2. If referrerId exists:
   - Create referral bonus (1 month) for new user
   - Create referrer reward (1 month) for referrer
3. Update analytics for both users

### Referral Link Generation
- Format: `${baseUrl}?ref=${userId}`
- Validation: Check if referrer exists in waitlist
- Prevent self-referrals

## User Flow Examples

### Scenario 1: Alice joins waitlist
1. Alice fills out waitlist form
2. Alice gets 1 month free (base signup)
3. Success screen shows referral sharing options

### Scenario 2: Alice refers Bob
1. Bob clicks Alice's referral link (`?ref=alice_id`)
2. Bob fills out waitlist form
3. System processes rewards:
   - Bob gets 2 months free (1 base + 1 referral)
   - Alice gets +1 month free (referrer reward)
4. Both users' analytics updated

### Scenario 3: Bob refers Charlie
1. Charlie clicks Bob's referral link (`?ref=bob_id`)
2. Charlie joins waitlist
3. System processes rewards:
   - Charlie gets 2 months free
   - Bob gets +1 month free (now has 3 months total)

## Files to Modify/Create

### New Files
- `src/services/referral.ts` - Core referral business logic
- `src/app/_components/waitlist/ReferralSharing.tsx` - Sharing component
- Database migration file

### Modified Files
- `src/drizzle/src/db/schema.ts` - Add referral tables
- `src/drizzle/src/db/mutations.ts` - Add referral mutations
- `src/drizzle/src/db/queries.ts` - Add referral queries
- `src/server/api/routers/waitlist.ts` - Handle referral logic
- `src/app/_components/waitlist/WaitlistForm.tsx` - Capture referral param
- Success screen component - Add referral sharing

## Error Handling & Edge Cases
- Invalid referrer IDs
- Self-referral attempts
- Duplicate referral attempts
- Database transaction failures
- URL parameter validation

## Analytics & Metrics
Track the following metrics:
- Total referrals per user
- Referral conversion rates
- Most active referrers
- Total free months distributed
- Referral success rates

## Future Enhancements
- Referral leaderboards
- Time-limited referral bonuses
- Referral expiration dates
- Social sharing integrations