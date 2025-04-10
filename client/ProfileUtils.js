import { getUserProfile } from './api';

// Check if user has completed their profile forms
export const checkProfileStatus = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    
    // Profile status object
    const profileStatus = {
      isProfileComplete: false,
      isReasonsComplete: false,
      hasCompletedOnboarding: false
    };
    
    // Check if basic profile info is complete
    if (userProfile.age !== null && 
        userProfile.gender !== null && 
        userProfile.specialty !== null) {
      profileStatus.isProfileComplete = true;
    }
    
    // Check if reasons have been selected
    if (userProfile.reasons && userProfile.reasons.length > 0) {
      profileStatus.isReasonsComplete = true;
    }
    
    // Determine if user has completed all required onboarding
    profileStatus.hasCompletedOnboarding = 
      profileStatus.isProfileComplete && profileStatus.isReasonsComplete;
    
    return profileStatus;
    
  } catch (error) {
    console.error("Error checking profile status:", error);
    return {
      isProfileComplete: false,
      isReasonsComplete: false,
      hasCompletedOnboarding: false
    };
  }
};