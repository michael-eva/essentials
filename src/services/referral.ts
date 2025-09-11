import { 
  insertReferralTransaction, 
  insertReferralAnalytics, 
  upsertReferralAnalytics,
  insertWaitlist,
} from "@/drizzle/src/db/mutations";
import type { 
  NewReferralTransaction, 
  NewWaitlist,
  Waitlist 
} from "@/drizzle/src/db/queries";
import { db } from "@/drizzle/src/db/mutations";
import { 
  waitlist, 
  referralAnalytics, 
  referralTransactions 
} from "@/drizzle/src/db/schema";
import { eq, sql } from "drizzle-orm";

export interface ProcessReferralRewardsParams {
  newUserId: string;
  referrerId?: string;
}

export interface ReferralReward {
  userId: string;
  rewardType: 'base_signup' | 'referral_bonus' | 'referrer_reward';
  monthsCount: number;
  description: string;
}

/**
 * Core function to process referral rewards
 * 1. Gives new user 1 month free (base signup reward)
 * 2. If referrerId exists:
 *    - Gives new user additional 1 month free (referral bonus) = 2 months total
 *    - Gives referrer 1 month free (referrer reward)
 * 3. Updates analytics for both users
 */
export async function processReferralRewards({
  newUserId,
  referrerId,
}: ProcessReferralRewardsParams): Promise<ReferralReward[]> {
  const rewards: ReferralReward[] = [];
  
  try {
    // 1. Always give base signup reward (1 month free)
    const baseReward = await insertReferralTransaction({
      userId: newUserId,
      transactionType: 'base_signup',
      monthsCount: 1,
      description: 'Welcome bonus for joining waitlist',
    });
    
    rewards.push({
      userId: newUserId,
      rewardType: 'base_signup',
      monthsCount: 1,
      description: 'Welcome bonus for joining waitlist',
    });

    // 2. If there's a referrer, process referral rewards
    if (referrerId) {
      // Validate that referrer exists
      const referrer = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.id, referrerId))
        .limit(1);

      if (referrer.length === 0) {
        console.warn(`Referrer ${referrerId} not found in waitlist`);
        return rewards; // Return just the base reward
      }

      // Prevent self-referrals
      if (referrerId === newUserId) {
        console.warn(`Self-referral attempt blocked for user ${newUserId}`);
        return rewards; // Return just the base reward
      }

      // Give new user referral bonus (1 additional month)
      const referralBonus = await insertReferralTransaction({
        userId: newUserId,
        transactionType: 'referral_bonus',
        monthsCount: 1,
        description: 'Bonus for joining via referral',
        referredUserId: newUserId, // The person who got referred
      });

      rewards.push({
        userId: newUserId,
        rewardType: 'referral_bonus',
        monthsCount: 1,
        description: 'Bonus for joining via referral',
      });

      // Give referrer reward (1 month)
      const referrerReward = await insertReferralTransaction({
        userId: referrerId,
        transactionType: 'referrer_reward',
        monthsCount: 1,
        description: 'Reward for successful referral',
        referredUserId: newUserId, // The person they referred
      });

      rewards.push({
        userId: referrerId,
        rewardType: 'referrer_reward',
        monthsCount: 1,
        description: 'Reward for successful referral',
      });

      // Update analytics for referrer
      await updateReferrerAnalytics(referrerId);
    }

    // Update analytics for new user
    await updateUserAnalytics(newUserId);

    console.log(`Successfully processed referral rewards:`, rewards);
    return rewards;

  } catch (error) {
    console.error('Error processing referral rewards:', error);
    throw new Error(`Failed to process referral rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update analytics for a user based on their referral transactions
 */
async function updateUserAnalytics(userId: string): Promise<void> {
  // Calculate total free months for this user
  const freeMonthsResult = await db
    .select({
      totalFreeMonths: sql<number>`COALESCE(SUM(${referralTransactions.monthsCount}), 0)`,
    })
    .from(referralTransactions)
    .where(eq(referralTransactions.userId, userId));

  const totalFreeMonths = freeMonthsResult[0]?.totalFreeMonths ?? 0;

  // Count successful referrals (how many people this user has referred)
  const referralsResult = await db
    .select({
      totalReferrals: sql<number>`COUNT(*)`,
    })
    .from(referralTransactions)
    .where(
      sql`${referralTransactions.userId} = ${userId} AND ${referralTransactions.transactionType} = 'referrer_reward'`
    );

  const totalReferrals = referralsResult[0]?.totalReferrals ?? 0;

  // Upsert analytics
  await upsertReferralAnalytics(userId, {
    totalReferrals: totalReferrals,
    totalFreeMonths: totalFreeMonths,
  });
}

/**
 * Update analytics specifically for a referrer
 */
async function updateReferrerAnalytics(referrerId: string): Promise<void> {
  await updateUserAnalytics(referrerId);
}

/**
 * Generate a referral link for a user
 */
export function generateReferralLink(userId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}?ref=${userId}`;
}

/**
 * Validate a referral code (userId) exists in waitlist
 */
export async function validateReferralCode(referralCode: string): Promise<boolean> {
  try {
    const result = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.id, referralCode))
      .limit(1);
    
    return result.length > 0;
  } catch (error) {
    console.error('Error validating referral code:', error);
    return false;
  }
}

/**
 * Get referral analytics for a user
 */
export async function getUserReferralAnalytics(userId: string) {
  const analytics = await db
    .select()
    .from(referralAnalytics)
    .where(eq(referralAnalytics.userId, userId))
    .limit(1);

  if (analytics.length === 0) {
    return {
      totalReferrals: 0,
      totalFreeMonths: 0,
      lastUpdated: null,
    };
  }

  return analytics[0];
}

/**
 * Get all referral transactions for a user
 */
export async function getUserReferralTransactions(userId: string) {
  return await db
    .select()
    .from(referralTransactions)
    .where(eq(referralTransactions.userId, userId))
    .orderBy(sql`${referralTransactions.createdAt} DESC`);
}

/**
 * Enhanced waitlist insertion with referral processing
 */
export async function insertWaitlistWithReferral(
  waitlistData: Omit<NewWaitlist, 'id'> & { referrerId?: string }
): Promise<{ waitlistEntry: Waitlist; rewards: ReferralReward[] }> {
  const { referrerId, ...waitlistFields } = waitlistData;
  
  // First, insert the waitlist entry
  const waitlistEntry = await insertWaitlist(waitlistFields);
  
  // Then process referral rewards
  const rewards = await processReferralRewards({
    newUserId: waitlistEntry.id,
    referrerId,
  });
  
  return {
    waitlistEntry,
    rewards,
  };
}