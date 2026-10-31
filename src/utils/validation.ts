export type AppLanguage = 'mr' | 'en';

export interface FieldValidationResult {
  isValid: boolean;
  normalizedValue: string;
  error?: string;
}

/**
 * Validates an email address according to Section 9 requirements:
 * - Trims leading and trailing whitespace
 * - Rejects empty values when required
 * - Rejects internal spaces, missing/multiple '@', missing domain/TLD, or leading/trailing dots
 * - Permits '+' subaddressing and uncommon valid domains
 */
export function validateEmail(
  raw: string | undefined | null,
  lang: AppLanguage = 'mr',
  required = true
): FieldValidationResult {
  const trimmed = String(raw ?? '').trim();

  if (!trimmed) {
    if (!required) {
      return { isValid: true, normalizedValue: '' };
    }
    return {
      isValid: false,
      normalizedValue: '',
      error:
        lang === 'mr'
          ? 'कृपया ईमेल पत्ता भरा.'
          : 'Enter your email address.',
    };
  }

  // Reject any internal whitespace
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  const [local, domain] = parts;
  if (
    !local ||
    !domain ||
    local.length > 64 ||
    domain.length > 253 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..') ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.startsWith('-') ||
    domain.endsWith('-') ||
    domain.includes('..')
  ) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z0-9-]+$/.test(tld) || /^\d+$/.test(tld)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  // Ensure each domain label has valid characters
  for (const label of domainLabels) {
    if (
      !label ||
      label.startsWith('-') ||
      label.endsWith('-') ||
      !/^[a-zA-Z0-9-]+$/.test(label)
    ) {
      return {
        isValid: false,
        normalizedValue: trimmed,
        error:
          lang === 'mr'
            ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
            : 'Check the email address format.',
      };
    }
  }

  // Check local part characters (standard RFC 5322 unquoted safe subset including '+')
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'ईमेल पत्त्याचा फॉरमॅट तपासा.'
          : 'Check the email address format.',
    };
  }

  return {
    isValid: true,
    normalizedValue: trimmed.toLowerCase(),
  };
}

/**
 * Validates a domestic Indian mobile number according to Section 9 requirements:
 * - Accepts 10-digit Indian mobile numbers starting with 6, 7, 8, or 9
 * - Accepts spaces or hyphens by normalizing before validation
 * - Handles '+91' prefix consistently
 * - Rejects 11- or 12-digit numbers without '+' (e.g. '919822011223' or '09822011223')
 * - Rejects alphabetic characters and invalid leading digits (0-5)
 */
export function validateIndianPhone(
  raw: string | undefined | null,
  lang: AppLanguage = 'mr',
  required = true
): FieldValidationResult {
  const trimmed = String(raw ?? '').trim();

  if (!trimmed) {
    if (!required) {
      return { isValid: true, normalizedValue: '' };
    }
    return {
      isValid: false,
      normalizedValue: '',
      error:
        lang === 'mr'
          ? 'कृपया मोबाईल क्रमांक भरा.'
          : 'Enter your mobile number.',
    };
  }

  // Reject any alphabetic or unexpected characters (only digits, spaces, hyphens, and leading '+' allowed)
  if (!/^\+?[\d\s-]+$/.test(trimmed)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'वैध १० अंकी भारतीय मोबाईल क्रमांक टाका.'
          : 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  // Collapse spaces and hyphens
  const compact = trimmed.replace(/[\s-]+/g, '');

  let coreTenDigits = compact;

  if (compact.startsWith('+')) {
    if (!compact.startsWith('+91')) {
      return {
        isValid: false,
        normalizedValue: trimmed,
        error:
          lang === 'mr'
            ? 'देश कोड वापरत असल्यास फक्त +91 जोडा.'
            : 'Include +91 only if you are entering the country code.',
      };
    }
    coreTenDigits = compact.slice(3);
  } else if (compact.length === 12 && compact.startsWith('91')) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'देश कोड वापरत असल्यास +91 जोडा किंवा १० अंकी मोबाईल क्रमांक टाका.'
          : 'Include +91 only if you are entering the country code.',
    };
  } else if (compact.length === 11 && compact.startsWith('0')) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'सुरुवातीला ० न लावता वैध १० अंकी भारतीय मोबाईल क्रमांक टाका.'
          : 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  if (!/^\d{10}$/.test(coreTenDigits)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'वैध १० अंकी भारतीय मोबाईल क्रमांक टाका.'
          : 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  if (!/^[6-9]\d{9}$/.test(coreTenDigits)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'वैध १० अंकी भारतीय मोबाईल क्रमांक टाका (६, ७, ८ किंवा ९ ने सुरू होणारा).'
          : 'Enter a valid 10-digit Indian mobile number.',
    };
  }

  return {
    isValid: true,
    normalizedValue: coreTenDigits,
  };
}

export function validateIndianPinCode(
  raw: string | undefined | null,
  lang: AppLanguage = 'mr'
): FieldValidationResult {
  const trimmed = String(raw ?? '').trim().replace(/\s+/g, '');
  if (!trimmed) {
    return {
      isValid: false,
      normalizedValue: '',
      error:
        lang === 'mr'
          ? 'कृपया ६ अंकी पिनकोड (PIN Code) भरा.'
          : 'Enter your 6-digit postal PIN code.',
    };
  }
  if (!/^[1-9]\d{5}$/.test(trimmed)) {
    return {
      isValid: false,
      normalizedValue: trimmed,
      error:
        lang === 'mr'
          ? 'वैध ६ अंकी भारतीय पिनकोड (PIN Code) टाका.'
          : 'Enter a valid 6-digit Indian postal PIN code.',
    };
  }
  return {
    isValid: true,
    normalizedValue: trimmed,
  };
}
