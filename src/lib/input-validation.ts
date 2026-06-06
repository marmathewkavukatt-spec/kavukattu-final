import { sanitizeInput, sanitizeHtml, detectSuspiciousPatterns } from './security-enhanced';

// Comprehensive input validation and sanitization

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitizer?: (value: string) => string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export class InputValidator {
  private rules: Map<string, ValidationRule> = new Map();

  constructor() {
    this.setupDefaultRules();
  }

  private setupDefaultRules() {
    // Email validation
    this.rules.set('email', {
      required: true,
      maxLength: 254,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      sanitizer: (value: string) => value.toLowerCase().trim()
    });

    // Password validation
    this.rules.set('password', {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    });

    // Name validation
    this.rules.set('name', {
      required: true,
      minLength: 1,
      maxLength: 120,
      pattern: /^[a-zA-Z\s\-'\.]+$/,
      sanitizer: sanitizeInput
    });

    // Title validation
    this.rules.set('title', {
      required: true,
      minLength: 1,
      maxLength: 180,
      sanitizer: sanitizeHtml
    });

    // Description validation
    this.rules.set('description', {
      maxLength: 10000,
      sanitizer: sanitizeHtml
    });

    // URL validation
    this.rules.set('url', {
      maxLength: 2048,
      pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
      sanitizer: (value: string) => value.trim()
    });

    // Phone validation
    this.rules.set('phone', {
      maxLength: 20,
      pattern: /^\+?[\d\s\-\(\)]+$/,
      sanitizer: (value: string) => value.replace(/[^\d+]/g, '')
    });

    // Category validation
    this.rules.set('category', {
      required: true,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_\-\s]+$/,
      sanitizer: sanitizeInput
    });

    // File path validation
    this.rules.set('filepath', {
      maxLength: 500,
      pattern: /^[a-zA-Z0-9._\-\/]+$/,
      customValidator: (value: string) => !value.includes('..') && !value.includes('//'),
      sanitizer: sanitizeInput
    });

    // ID validation (CUID)
    this.rules.set('id', {
      required: true,
      pattern: /^[a-z0-9]{25,32}$/,
      sanitizer: sanitizeInput
    });

    // Order validation
    this.rules.set('order', {
      customValidator: (value: any) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 0 && num <= 9999;
      }
    });

    // Boolean validation
    this.rules.set('boolean', {
      customValidator: (value: any) => typeof value === 'boolean' || value === 'true' || value === 'false'
    });

    // Date validation
    this.rules.set('date', {
      customValidator: (value: any) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    });

    // Content validation (rich text)
    this.rules.set('content', {
      required: true,
      minLength: 1,
      maxLength: 50000,
      sanitizer: sanitizeHtml
    });

    // Address validation
    this.rules.set('address', {
      maxLength: 500,
      sanitizer: sanitizeHtml
    });
  }

  validate(fieldName: string, value: any, ruleName?: string): ValidationResult {
    const rule = this.rules.get(ruleName || fieldName);
    if (!rule) {
      return { isValid: true, errors: [], sanitizedValue: value };
    }

    const errors: string[] = [];
    let sanitizedValue = value;

    // Check if value exists when required
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    // Skip further validation if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return { isValid: true, errors: [], sanitizedValue: '' };
    }

    // Convert to string for string-based validations
    const stringValue = String(value);

    // Apply sanitizer
    if (rule.sanitizer && typeof rule.sanitizer === 'function') {
      sanitizedValue = rule.sanitizer(stringValue);
    }

    // Check suspicious patterns
    if (detectSuspiciousPatterns(stringValue)) {
      errors.push(`${fieldName} contains suspicious content`);
    }

    // Length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`);
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors.push(`${fieldName} format is invalid`);
    }

    // Custom validation
    if (rule.customValidator && !rule.customValidator(value)) {
      errors.push(`${fieldName} is invalid`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  validateObject(data: Record<string, any>, schema: Record<string, string>): {
    isValid: boolean;
    errors: Record<string, string[]>;
    sanitizedData: Record<string, any>;
  } {
    const errors: Record<string, string[]> = {};
    const sanitizedData: Record<string, any> = {};

    for (const [fieldName, ruleName] of Object.entries(schema)) {
      const result = this.validate(fieldName, data[fieldName], ruleName);
      
      if (!result.isValid) {
        errors[fieldName] = result.errors;
      }
      
      sanitizedData[fieldName] = result.sanitizedValue;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  // Specific validation methods for common use cases
  validateEmail(email: string): ValidationResult {
    return this.validate('email', email, 'email');
  }

  validatePassword(password: string): ValidationResult {
    return this.validate('password', password, 'password');
  }

  validateId(id: string): ValidationResult {
    return this.validate('id', id, 'id');
  }

  validateUrl(url: string): ValidationResult {
    return this.validate('url', url, 'url');
  }

  // Batch validation for forms
  validateForm(formData: FormData, schema: Record<string, string>): {
    isValid: boolean;
    errors: Record<string, string[]>;
    sanitizedData: Record<string, any>;
  } {
    const data: Record<string, any> = {};
    
    for (const [key, value] of Array.from(formData.entries())) {
      data[key] = value;
    }

    return this.validateObject(data, schema);
  }

  // JSON validation with size limits
  validateJSON(jsonString: string, maxSizeKB: number = 100): ValidationResult {
    const errors: string[] = [];
    
    // Check size
    const sizeKB = Buffer.byteLength(jsonString, 'utf8') / 1024;
    if (sizeKB > maxSizeKB) {
      errors.push(`JSON payload too large: ${sizeKB.toFixed(2)}KB (max: ${maxSizeKB}KB)`);
    }

    // Check for suspicious patterns
    if (detectSuspiciousPatterns(jsonString)) {
      errors.push('JSON contains suspicious content');
    }

    try {
      const parsed = JSON.parse(jsonString);
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue: parsed
      };
    } catch (e) {
      errors.push('Invalid JSON format');
      return { isValid: false, errors };
    }
  }

  // File validation
  validateFile(file: File, allowedTypes: string[], maxSizeMB: number = 50): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      errors.push(`File too large: ${sizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`);
    }

    // Check filename
    const filenameResult = this.validate('filename', file.name, 'filepath');
    if (!filenameResult.isValid) {
      errors.push(...filenameResult.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: file
    };
  }
}

// Export singleton instance
export const validator = new InputValidator();

// Utility functions for common validations
export function isValidEmail(email: string): boolean {
  return validator.validateEmail(email).isValid;
}

export function isValidPassword(password: string): boolean {
  return validator.validatePassword(password).isValid;
}

export function isValidId(id: string): boolean {
  return validator.validateId(id).isValid;
}

export function sanitizeFormData(formData: FormData): FormData {
  const sanitized = new FormData();
  
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === 'string') {
      sanitized.append(sanitizeInput(key), sanitizeHtml(value));
    } else {
      sanitized.append(sanitizeInput(key), value);
    }
  }
  
  return sanitized;
}

// Database-specific validation schemas
export const dbSchemas = {
  admin: {
    email: 'email',
    password: 'password'
  },
  
  announcement: {
    title: 'title',
    subtitle: 'description',
    description: 'description',
    content: 'content',
    category: 'category',
    coverImage: 'url',
    fileUrl: 'url'
  },
  
  gallery: {
    image: 'url',
    caption: 'description',
    order: 'order'
  },
  
  galleryCategory: {
    title: 'title',
    coverImage: 'url',
    order: 'order'
  },
  
  galleryItem: {
    categoryId: 'id',
    image: 'url',
    title: 'title',
    order: 'order'
  },
  
  resource: {
    title: 'title',
    description: 'description',
    fileUrl: 'url',
    linkUrl: 'url',
    order: 'order'
  },
  
  archiveDocument: {
    title: 'title',
    subtitle: 'description',
    description: 'description',
    fileUrl: 'url',
    fileName: 'name',
    fileType: 'category'
  },
  
  testimony: {
    authorName: 'name',
    content: 'content',
    authorImage: 'url',
    order: 'order'
  },
  
  contribution: {
    type: 'category',
    name: 'name',
    address: 'address',
    description: 'description'
  },
  
  favourReceived: {
    authorName: 'name',
    content: 'content',
    authorImage: 'url',
    order: 'order'
  }
};
