'use server';

import { completePatientOnboarding } from './completePatientOnboarding';

/**
 * Calls the shared onboarding function with the given userId.
 */
export async function handlePatientOnboarding(userId: string) {
  try {
    const result = await completePatientOnboarding(userId);
    return result;
  } catch (err) {
    console.error('handlePatientOnboarding failed:', err);
    return { success: false };
  }
}
