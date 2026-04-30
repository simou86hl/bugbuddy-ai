'use client'

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Client-side versions of server functions (for frontend use)
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
  { algorithm: "Oracle 11g", description: "Oracle 11g password hash", length: 40, category: "Database" },
  { algorithm: "Oracle 12c", description: "Oracle 12c password hash", length: 128, category: "Database" },
  { algorithm: "PostgreSQL MD5", description: "PostgreSQL MD5 password hash", length: 35, category: "Database" },
  { algorithm: "Joomla", description: "Joomla password hash", length: 34, category: "CMS" },
  { algorithm: "vBulletin", description: "vBulletin password hash", length: 35, category: "CMS" },
  { algorithm: "WordPress", description: "WordPress password hash", length: 34, category: "CMS" },
  { algorithm: "Drupal", description: "Drupal password hash", length: 128, category: "CMS" },
  { algorithm: "Keccak-256", description: "Keccak-256 (Ethereum)", length: 64, category: "Blockchain" },
  { algorithm: "Keccak-512", description: "Keccak-512 hash", length: 128, category: "Blockchain" },
]

export function identifyHash(hash: string): HashInfo[] {
  const clean = hash.trim().replace(/[^a-fA-F0-9$\s]/g, "");
  const results: HashInfo[] = [];
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    const bcryptVariants = HASH_PATTERNS.filter(p => p.algorithm === "bcrypt" || p.algorithm === "bcrypt $2a$" || p.algorithm === "bcrypt $2b$" || p.algorithm === "Blowfish");
    results.push(...bcryptVariants);
    return results;
  }
  const hexLen = clean.replace(/\s/g, "").length;
  const matches = HASH_PATTERNS.filter(p => p.length === hexLen);
  if (matches.length > 0) results.push(...matches);
  if (hash.startsWith("md5") && hexLen === 35) {
    const pgMatch = HASH_PATTERNS.find(p => p.algorithm === "PostgreSQL MD5");
    if (pgMatch && !results.includes(pgMatch)) results.push(pgMatch);
  }
  if (results.length === 0) {
    results.push({ algorithm: "Unknown", description: "Hash type could not be identified", length: hash.length, category: "Unknown" });
  }
  return results;
}

export function extractJSON(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }
  try { JSON.parse(cleaned); return cleaned } catch {}
  const jsonPatterns = [/\{[\s\S]*\}/, /\[[\s\S]*\]/];
  for (const pattern of jsonPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let jsonStr = match[0];
      try { JSON.parse(jsonStr); return jsonStr } catch {}
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      try { JSON.parse(jsonStr); return jsonStr } catch {}
    }
  }
  cleaned = cleaned.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  try { JSON.parse(cleaned); return cleaned } catch {}
  return cleaned;
}

// Encoding/Decoding utilities
export function base64Encode(input: string): string {
  return btoa(input);
}
export function base64Decode(input: string): string {
  return atob(input);
}
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}
export function hexEncode(input: string): string {
  return Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join('');
}
export function hexDecode(input: string): string {
  const bytes = input.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
  return new TextDecoder().decode(new Uint8Array(bytes));
}
export function htmlEncode(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function htmlDecode(input: string): string {
  return input.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// JWT decode (client-side)
export function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { header, payload };
  } catch {
    return null;
  }
}

// React Components
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    info: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[severity] || colors.info}`}>
      {severity.toUpperCase()}
    </span>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-white/10 transition-colors" title="Copy">
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
    </button>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
      <p className="font-medium">Error</p>
      <p className="mt-1 text-red-400/80">{message}</p>
    </div>
  );
}

export function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {description && <p className="text-zinc-400 mt-1 text-sm">{description}</p>}
    </div>
  );
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}
