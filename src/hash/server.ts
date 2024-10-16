'use server';

import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';
import bcrypt from 'bcrypt';

// Generate SHA256 hash
const hashAlgorithm = (s: string): string => crypto.SHA256(s).toString(crypto.enc.Hex);

export const decrypt = async (cryptoString: string) => {
  // Extract bcrypt hash and token
  const bcryptHash = cryptoString.slice(0, 60); // Bcrypt hashes are 60 chars long
  const token = cryptoString.slice(60); // Rest is the JWT token
  // Verify the JWT token
  const state = jwt.verify(token, process.env.JWT_SECRET_KEY || '') as any;
  delete state.exp;
  delete state.iat;
  // Recreate the original hash from the decrypted state
  const stateString = JSON.stringify(state);
  const originalHash = hashAlgorithm(stateString);
  // Compare the original hash with the stored bcrypt hash
  const isValid = await bcrypt.compare(originalHash, bcryptHash);
  if (isValid) {
    return state;
  } else {
    throw new Error('decryption failed');
  }
};
