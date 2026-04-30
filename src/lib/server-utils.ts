export interface HashInfo {
  algorithm: string;
  description: string;
  length: number;
  category: string;
}

const HASH_PATTERNS: HashInfo[] = [
  { algorithm: "MD5", description: "MD5 hash - weak, collision-prone", length: 32, category: "General" },
  { algorithm: "SHA-1", description: "SHA-1 hash - deprecated", length: 40, category: "General" },
  { algorithm: "SHA-256", description: "SHA-256 hash - secure", length: 64, category: "General" },
  { algorithm: "SHA-512", description: "SHA-512 hash - very secure", length: 128, category: "General" },
  { algorithm: "NTLM", description: "Windows NTLM hash", length: 32, category: "Windows" },
  { algorithm: "bcrypt", description: "bcrypt hash (full: 60 chars)", length: 60, category: "Password" },
  { algorithm: "MySQL5", description: "MySQL 4.1+ password hash", length: 41, category: "Database" },
  { algorithm: "MySQL323", description: "MySQL 3.23 password hash", length: 16, category: "Database" },
  { algorithm: "Blowfish", description: "Blowfish crypt hash", length: 59, category: "Password" },
  { algorithm: "SHA-384", description: "SHA-384 hash", length: 96, category: "General" },
  { algorithm: "SHA-224", description: "SHA-224 hash", length: 56, category: "General" },
  { algorithm: "RIPEMD-160", description: "RIPEMD-160 hash", length: 40, category: "General" },
  { algorithm: "Whirlpool", description: "Whirlpool hash", length: 128, category: "General" },
  { algorithm: "CRC32", description: "CRC32 checksum", length: 8, category: "Checksum" },
  { algorithm: "ADLER32", description: "Adler-32 checksum", length: 8, category: "Checksum" },
  { algorithm: "FNV-1a 32", description: "FNV-1a 32-bit hash", length: 8, category: "Checksum" },
  { algorithm: "FNV-1a 64", description: "FNV-1a 64-bit hash", length: 16, category: "Checksum" },
  { algorithm: "MurmurHash3", description: "MurmurHash3 32-bit", length: 8, category: "Checksum" },
  { algorithm: "bcrypt $2a$", description: "bcrypt $2a$ variant", length: 60, category: "Password" },
  { algorithm: "bcrypt $2b$", description: "bcrypt $2b$ variant", length: 60, category: "Password" },
  { algorithm: "Scrypt", description: "Scrypt hash (typically 92+ chars)", length: 92, category: "Password" },
  { algorithm: "Oracle 11g", description: "Oracle 11g password hash (case-insensitive)", length: 40, category: "Database" },
  { algorithm: "Oracle 12c", description: "Oracle 12c password hash (SHA-512 based)", length: 128, category: "Database" },
  { algorithm: "PostgreSQL MD5", description: "PostgreSQL MD5 password hash", length: 35, category: "Database" },
  { algorithm: "Joomla", description: "Joomla password hash (MD5+salt)", length: 34, category: "CMS" },
  { algorithm: "vBulletin", description: "vBulletin password hash (MD5+salt)", length: 35, category: "CMS" },
  { algorithm: "WordPress", description: "WordPress password hash (MD5+salt)", length: 34, category: "CMS" },
  { algorithm: "Drupal", description: "Drupal password hash (SHA-512+salt)", length: 128, category: "CMS" },
  { algorithm: "Keccak-256", description: "Keccak-256 hash (Ethereum)", length: 64, category: "Blockchain" },
  { algorithm: "Keccak-512", description: "Keccak-512 hash", length: 128, category: "Blockchain" },
];

export function identifyHash(hash: string): HashInfo[] {
  const clean = hash.trim().replace(/[^a-fA-F0-9$\s]/g, "");
  const results: HashInfo[] = [];

  // Check bcrypt patterns first
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    const bcryptVariants = HASH_PATTERNS.filter(p =>
      p.algorithm === "bcrypt" || p.algorithm === "bcrypt $2a$" || p.algorithm === "bcrypt $2b$" || p.algorithm === "Blowfish"
    );
    results.push(...bcryptVariants);
    return results;
  }

  // Check by length
  const hexLen = clean.replace(/\s/g, "").length;
  const matches = HASH_PATTERNS.filter(p => p.length === hexLen);

  if (matches.length > 0) {
    results.push(...matches);
  }

  // PostgreSQL MD5 starts with "md5"
  if (hash.startsWith("md5") && hexLen === 35) {
    const pgMatch = HASH_PATTERNS.find(p => p.algorithm === "PostgreSQL MD5");
    if (pgMatch && !results.includes(pgMatch)) results.push(pgMatch);
  }

  if (results.length === 0) {
    results.push({
      algorithm: "Unknown",
      description: "Hash type could not be identified",
      length: hash.length,
      category: "Unknown",
    });
  }

  return results;
}

export function extractJSON(raw: string): string {
  let cleaned = raw.trim();

  // Remove code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }

  // Try direct parse
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}

  // Try to find JSON object/array in the response
  const jsonPatterns = [
    /\{[\s\S]*\}/,   // JSON object
    /\[[\s\S]*\]/,   // JSON array
  ];

  for (const pattern of jsonPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let jsonStr = match[0];
      // Try to find the balanced braces
      try {
        JSON.parse(jsonStr);
        return jsonStr;
      } catch {}
      // Try fixing trailing commas
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      try {
        JSON.parse(jsonStr);
        return jsonStr;
      } catch {}
    }
  }

  // Try removing markdown formatting
  cleaned = cleaned.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}

  // Return the raw string if no JSON found
  return cleaned;
}
