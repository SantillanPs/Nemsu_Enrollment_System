import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// File to store the secret key (in a real production app, this would be in a secure storage)
const KEY_FILE_PATH = path.join(process.cwd(), 'data', 'superadmin_key.json');

// Default key (used only if no key file exists)
const DEFAULT_SECRET_KEY = "super_admin_secret_key_8675309";

// Interface for the key file content
interface KeyFileContent {
  secretKey: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ensures the data directory exists
 */
function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Generates a new secure random key
 */
export function generateNewSecretKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Gets the current secret key
 * If the key file doesn't exist, it creates one with the default key
 */
export function getSecretKey(): string {
  ensureDataDirectoryExists();
  
  // If the key file doesn't exist, create it with the default key
  if (!fs.existsSync(KEY_FILE_PATH)) {
    const initialContent: KeyFileContent = {
      secretKey: DEFAULT_SECRET_KEY,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      KEY_FILE_PATH, 
      JSON.stringify(initialContent, null, 2),
      'utf8'
    );
    
    return DEFAULT_SECRET_KEY;
  }
  
  // Read the key from the file
  try {
    const fileContent = fs.readFileSync(KEY_FILE_PATH, 'utf8');
    const keyData: KeyFileContent = JSON.parse(fileContent);
    return keyData.secretKey;
  } catch (error) {
    console.error('Error reading secret key file:', error);
    return DEFAULT_SECRET_KEY; // Fallback to default key in case of error
  }
}

/**
 * Updates the secret key with a new one
 * Returns the new key
 */
export function updateSecretKey(): string {
  ensureDataDirectoryExists();
  
  const newKey = generateNewSecretKey();
  
  const keyData: KeyFileContent = {
    secretKey: newKey,
    createdAt: fs.existsSync(KEY_FILE_PATH) 
      ? JSON.parse(fs.readFileSync(KEY_FILE_PATH, 'utf8')).createdAt 
      : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    KEY_FILE_PATH, 
    JSON.stringify(keyData, null, 2),
    'utf8'
  );
  
  return newKey;
}

/**
 * Validates if the provided key matches the stored secret key
 */
export function validateSecretKey(providedKey: string): boolean {
  const actualKey = getSecretKey();
  return providedKey === actualKey;
}
