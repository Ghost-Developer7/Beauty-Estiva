import crypto from "crypto";

/**
 * ASP.NET Core Identity V3 password hash verifier.
 * Format: 0x01 + prf(2 bytes) + iterCount(4 bytes) + saltLength(4 bytes) + salt + subkey
 * V3 uses HMAC-SHA256 with 100,000 iterations by default.
 */
export function verifyAspNetIdentityV3Hash(password: string, storedHash: string): boolean {
  const hashBuffer = Buffer.from(storedHash, "base64");

  if (hashBuffer.length < 13 || hashBuffer[0] !== 0x01) {
    return false;
  }

  const prf = hashBuffer.readUInt32BE(1);
  const iterCount = hashBuffer.readUInt32BE(5);
  const saltLength = hashBuffer.readUInt32BE(9);

  if (hashBuffer.length < 13 + saltLength) {
    return false;
  }

  const salt = hashBuffer.subarray(13, 13 + saltLength);
  const storedSubkey = hashBuffer.subarray(13 + saltLength);

  let algorithm: string;
  let keyLength: number;

  switch (prf) {
    case 0: // HMACSHA1
      algorithm = "sha1";
      keyLength = 20;
      break;
    case 1: // HMACSHA256
      algorithm = "sha256";
      keyLength = 32;
      break;
    case 2: // HMACSHA512
      algorithm = "sha512";
      keyLength = 64;
      break;
    default:
      return false;
  }

  if (storedSubkey.length !== keyLength) {
    keyLength = storedSubkey.length;
  }

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterCount, keyLength, algorithm);

  return crypto.timingSafeEqual(derivedKey, storedSubkey);
}

/**
 * Creates an ASP.NET Identity V3 compatible password hash.
 * Uses HMAC-SHA256 with 100,000 iterations (same as default .NET Identity V3).
 */
export function hashPasswordV3(password: string): string {
  const prf = 1; // HMAC-SHA256
  const iterCount = 100000;
  const saltLength = 16;
  const keyLength = 32;

  const salt = crypto.randomBytes(saltLength);
  const subkey = crypto.pbkdf2Sync(password, salt, iterCount, keyLength, "sha256");

  const output = Buffer.alloc(13 + saltLength + keyLength);
  output[0] = 0x01; // format marker
  output.writeUInt32BE(prf, 1);
  output.writeUInt32BE(iterCount, 5);
  output.writeUInt32BE(saltLength, 9);
  salt.copy(output, 13);
  subkey.copy(output, 13 + saltLength);

  return output.toString("base64");
}
