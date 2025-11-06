/**
 * Two-Factor Authentication (2FA) Utilities
 * Provides TOTP-based 2FA functionality for admin users
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const APP_NAME = 'Duely Admin';
const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production-32ch';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

// Ensure key is 32 bytes for aes-256
const getEncryptionKey = (): Buffer => {
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);
  return Buffer.from(key);
};

/**
 * Encrypt sensitive data (2FA secrets)
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data (2FA secrets)
 */
function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(username: string): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${username})`,
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
}

/**
 * Generate QR code data URL from otpauth URL
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after current time
    });
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    codes.push(formatted);
  }

  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map(code => {
    return crypto.createHash('sha256').update(code).digest('hex');
  });
}

/**
 * Verify a backup code against hashed codes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
  return hashedCodes.includes(hashedInput);
}

/**
 * Setup 2FA for an admin user
 */
export async function setupTwoFactor(adminId: string, secret: string): Promise<{
  success: boolean;
  backupCodes?: string[];
  error?: string;
}> {
  try {
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedCodes = hashBackupCodes(backupCodes);

    // Encrypt the secret before storing
    const encryptedSecret = encrypt(secret);

    // Create or update 2FA record
    await prisma.adminTwoFactor.upsert({
      where: { adminId },
      create: {
        adminId,
        secret: encryptedSecret,
        backupCodes: JSON.stringify(hashedCodes),
        isEnabled: true,
        enabledAt: new Date(),
      },
      update: {
        secret: encryptedSecret,
        backupCodes: JSON.stringify(hashedCodes),
        isEnabled: true,
        enabledAt: new Date(),
      },
    });

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return {
      success: false,
      error: 'Failed to setup two-factor authentication',
    };
  }
}

/**
 * Verify 2FA token for an admin user
 */
export async function verifyUserTOTPToken(
  adminId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get 2FA record
    const twoFactor = await prisma.adminTwoFactor.findUnique({
      where: { adminId },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      return {
        success: false,
        error: '2FA not enabled for this user',
      };
    }

    // Decrypt secret
    const secret = decrypt(twoFactor.secret);

    // Verify token
    const isValid = verifyTOTPToken(token, secret);

    if (isValid) {
      // Update last used timestamp
      await prisma.adminTwoFactor.update({
        where: { adminId },
        data: { lastUsedAt: new Date() },
      });

      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid verification code',
    };
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return {
      success: false,
      error: 'Failed to verify code',
    };
  }
}

/**
 * Verify backup code for an admin user
 */
export async function verifyUserBackupCode(
  adminId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get 2FA record
    const twoFactor = await prisma.adminTwoFactor.findUnique({
      where: { adminId },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      return {
        success: false,
        error: '2FA not enabled for this user',
      };
    }

    // Parse backup codes
    const hashedCodes: string[] = JSON.parse(twoFactor.backupCodes);

    // Verify code
    const isValid = verifyBackupCode(code, hashedCodes);

    if (isValid) {
      // Remove used backup code
      const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
      const remainingCodes = hashedCodes.filter(c => c !== hashedInput);

      // Update backup codes
      await prisma.adminTwoFactor.update({
        where: { adminId },
        data: {
          backupCodes: JSON.stringify(remainingCodes),
          lastUsedAt: new Date(),
        },
      });

      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid backup code',
    };
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return {
      success: false,
      error: 'Failed to verify backup code',
    };
  }
}

/**
 * Disable 2FA for an admin user
 */
export async function disableTwoFactor(adminId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Update 2FA record
    await prisma.adminTwoFactor.update({
      where: { adminId },
      data: { isEnabled: false },
    });

    return { success: true };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return {
      success: false,
      error: 'Failed to disable two-factor authentication',
    };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(adminId: string): Promise<boolean> {
  try {
    const twoFactor = await prisma.adminTwoFactor.findUnique({
      where: { adminId },
    });

    return twoFactor?.isEnabled || false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}

/**
 * Get remaining backup codes count
 */
export async function getRemainingBackupCodesCount(adminId: string): Promise<number> {
  try {
    const twoFactor = await prisma.adminTwoFactor.findUnique({
      where: { adminId },
    });

    if (!twoFactor) return 0;

    const hashedCodes: string[] = JSON.parse(twoFactor.backupCodes);
    return hashedCodes.length;
  } catch (error) {
    console.error('Error getting backup codes count:', error);
    return 0;
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(adminId: string): Promise<{
  success: boolean;
  backupCodes?: string[];
  error?: string;
}> {
  try {
    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    const hashedCodes = hashBackupCodes(backupCodes);

    // Update 2FA record
    await prisma.adminTwoFactor.update({
      where: { adminId },
      data: { backupCodes: JSON.stringify(hashedCodes) },
    });

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return {
      success: false,
      error: 'Failed to regenerate backup codes',
    };
  }
}
