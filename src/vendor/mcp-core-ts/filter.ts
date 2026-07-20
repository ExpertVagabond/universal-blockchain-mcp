/**
 * Output filtering — mirrors psm-mcp-core/src/filter.rs 1:1.
 * Same 9 secret patterns, same 4 PII patterns.
 */

/** Record of a single redaction applied to output. */
export interface Redaction {
  category: string;
  originalLength: number;
}

/** Result of filtering output text. */
export interface FilterResult {
  modified: boolean;
  text: string;
  redactions: Redaction[];
}

interface PatternDef {
  name: string;
  regex: RegExp;
}

// 9 secret patterns — identical to Rust SECRET_PATTERNS.
const SECRET_PATTERNS: PatternDef[] = [
  { name: "aws_key", regex: /AKIA[0-9A-Z]{16}/g },
  {
    name: "aws_secret",
    regex: /aws[_\-]?secret[_\-]?access[_\-]?key\s*[=:]\s*\S{20,}/gi,
  },
  { name: "github_token", regex: /gh[ps]_[A-Za-z0-9_]{36,}/g },
  {
    name: "generic_api_key",
    regex: /(api[_\-]?key|api[_\-]?secret)\s*[=:]\s*\S{16,}/gi,
  },
  { name: "jwt", regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}/g },
  {
    name: "private_key",
    regex: /-----BEGIN\s+(?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  },
  { name: "slack_token", regex: /xox[bpras]-[A-Za-z0-9\-]{10,}/g },
  { name: "anthropic_key", regex: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: "openai_key", regex: /sk-[A-Za-z0-9]{20,}/g },
];

// 4 PII patterns — identical to Rust PII_PATTERNS.
const PII_PATTERNS: PatternDef[] = [
  { name: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  {
    name: "credit_card",
    regex:
      /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6011)[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  },
  {
    name: "email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    name: "phone",
    regex: /\b(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  },
];

/** Output filter that redacts secrets and PII from text. */
export class OutputFilter {
  private readonly filterSecrets: boolean;
  private readonly filterPii: boolean;

  constructor(filterSecrets = true, filterPii = true) {
    this.filterSecrets = filterSecrets;
    this.filterPii = filterPii;
  }

  /** Filter text, redacting secrets and/or PII. */
  filter(text: string): FilterResult {
    let result = text;
    const redactions: Redaction[] = [];

    const apply = (patterns: PatternDef[]) => {
      for (const pat of patterns) {
        // Reset regex lastIndex for global patterns.
        pat.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pat.regex.exec(result)) !== null) {
          redactions.push({
            category: pat.name,
            originalLength: match[0].length,
          });
        }
        pat.regex.lastIndex = 0;
        result = result.replace(
          pat.regex,
          `[REDACTED_${pat.name.toUpperCase()}]`
        );
      }
    };

    if (this.filterSecrets) apply(SECRET_PATTERNS);
    if (this.filterPii) apply(PII_PATTERNS);

    return {
      modified: redactions.length > 0,
      text: result,
      redactions,
    };
  }
}

/** Default filter instance (secrets + PII). */
export const defaultFilter = new OutputFilter();
