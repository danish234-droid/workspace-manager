/**
 * Reusable validation functions for forms and data import.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  if (!email.trim()) errors.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format.');
  return { valid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  if (!password) errors.push('Password is required.');
  else if (password.length < 6) errors.push('Password must be at least 6 characters.');
  return { valid: errors.length === 0, errors };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  const errors: string[] = [];
  if (!value.trim()) errors.push(`${fieldName} is required.`);
  return { valid: errors.length === 0, errors };
}

export function validateName(name: string, fieldName = 'Name', maxLength = 100): ValidationResult {
  const errors: string[] = [];
  if (!name.trim()) errors.push(`${fieldName} is required.`);
  else if (name.length > maxLength) errors.push(`${fieldName} must be ${maxLength} characters or fewer.`);
  return { valid: errors.length === 0, errors };
}

export function validateImportData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: expected a JSON object.');
    return { valid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== 'string') {
    errors.push('Missing or invalid "version" field.');
  }
  if (!obj.workspace || typeof obj.workspace !== 'object') {
    errors.push('Missing or invalid "workspace" field.');
  }
  if (!Array.isArray(obj.projects)) {
    errors.push('Missing or invalid "projects" field (expected array).');
  }
  if (!Array.isArray(obj.tasks)) {
    errors.push('Missing or invalid "tasks" field (expected array).');
  }

  return { valid: errors.length === 0, errors };
}

export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  return { valid: allErrors.length === 0, errors: allErrors };
}
