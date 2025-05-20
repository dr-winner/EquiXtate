
// Password validation rules
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRES_LOWERCASE: true,
  REQUIRES_UPPERCASE: true,
  REQUIRES_NUMBER: true,
  REQUIRES_SPECIAL: true
};

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty123',
  'admin123',
  'welcome1',
  'password123'
];

/**
 * Validates password strength according to requirements
 * @param password - The password to validate
 * @returns Object with validity status and feedback messages
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' } => {
  const errors: string[] = [];
  
  // Check for minimum length
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  }
  
  // Check for lowercase letter requirement
  if (PASSWORD_REQUIREMENTS.REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter');
  }
  
  // Check for uppercase letter requirement
  if (PASSWORD_REQUIREMENTS.REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  }
  
  // Check for number requirement
  if (PASSWORD_REQUIREMENTS.REQUIRES_NUMBER && !/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }
  
  // Check for special character requirement
  if (PASSWORD_REQUIREMENTS.REQUIRES_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must include at least one special character');
  }
  
  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This is a commonly used password and is not secure');
  }
  
  // Determine password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (errors.length === 0) {
    strength = password.length >= 12 ? 'strong' : 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

/**
 * Validates email format
 * @param email - The email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates US phone number format
 * @param phone - The phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Allow formats: (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^(\+1|1)?[-. ]?(\([0-9]{3}\)|[0-9]{3})[-. ]?[0-9]{3}[-. ]?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Formats a phone number for display
 * @param phone - Raw phone number input
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Strip all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  // Format as +1 (XXX) XXX-XXXX
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  // Return original if can't format
  return phone;
};
