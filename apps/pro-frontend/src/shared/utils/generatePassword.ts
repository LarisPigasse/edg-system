// src/shared/utils/generatePassword.ts

/**
 * Genera una password casuale sicura per la creazione/reimpostazione di
 * account da parte di root (features/sistema). Garantisce almeno un
 * carattere per ogni classe — stessa politica di PasswordUtils.validate()
 * lato backend (auth-service) — usando crypto.getRandomValues invece di
 * Math.random per una migliore qualità dell'entropia.
 */
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const ALL = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL;

function randomChar(charset: string): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return charset[bytes[0] % charset.length];
}

function shuffle(value: string): string {
  const chars = value.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function generateSecurePassword(length = 16): string {
  let password = randomChar(UPPERCASE) + randomChar(LOWERCASE) + randomChar(NUMBERS) + randomChar(SPECIAL);
  for (let i = password.length; i < length; i++) {
    password += randomChar(ALL);
  }
  return shuffle(password);
}
