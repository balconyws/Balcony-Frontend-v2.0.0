'use client';

import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';
import bcrypt from 'bcryptjs';

// Generate SHA256 hash
export const hashAlgorithm = (s: string): string => crypto.SHA256(s).toString(crypto.enc.Hex);

export const encrypt = (state: any): string => {
  const stateString = JSON.stringify(state);
  // Hash the state
  const hash = hashAlgorithm(stateString);
  // Generate a JWT token
  const token = jwt.sign(state, process.env.JWT_SECRET_KEY || '', {
    expiresIn: '1m',
  });
  // Hash the SHA256 output using bcrypt to add complexity
  const salt = bcrypt.genSaltSync(10);
  const bcryptHash = bcrypt.hashSync(hash, salt);
  // Return combined bcrypt hash and JWT token
  return `${bcryptHash}${token}`;
};
