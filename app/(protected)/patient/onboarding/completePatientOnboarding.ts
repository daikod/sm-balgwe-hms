'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function completePatientOnboarding(userId?: string) {
  try {
    // Determine the target Clerk userId
    let currentUserId: string | undefined =
      userId ?? (await auth()).userId ?? undefined;

    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Await the client instance
    const client = await clerkClient();

    // Update the user's publicMetadata to mark them onboarded
    await client.users.updateUserMetadata(currentUserId, {
      publicMetadata: { onboarded: true },
    });

    return { success: true };
  } catch (error) {
    console.error('completePatientOnboarding failed:', error);
    return { success: false };
  }
}
