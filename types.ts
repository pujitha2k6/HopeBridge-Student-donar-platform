export type UserRole = 'student' | 'donor' | null;

export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  income: number;
  location: string;
  percentage: number;
  category: string; // 'Single Parent', 'Orphan', 'Very Poor', etc.
  age: number;
  description: string;
  isVerified: boolean;
  documents: Array<{ type: string; url: string; verified: boolean }>;
  photoUrl: string;
}

export interface DonorPreferences {
  budget: number;
  genderPref: 'Female' | 'Male' | 'Any';
  familyBgPref: string;
  studyLevelPref: string;
  locationPref: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  preferences: DonorPreferences;
}

export interface VerificationResult {
  isValid: boolean;
  percentage: number;
  studentName?: string;
  reason: string;
}
