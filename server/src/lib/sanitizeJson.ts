/**
 * Robustly extracts and sanitizes a JSON object from raw LLM output.
 * Handles: control characters, unescaped newlines inside strings,
 * markdown fences, trailing commas, and other LLM JSON quirks.
 */
export function sanitizeJson(raw: string): string {
  // 1. Strip markdown code fences
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 2. Extract the outermost JSON object
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM response");
  }
  cleaned = cleaned.slice(start, end + 1);

  // 3. Remove ASCII control characters (keep \t \n \r for now)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");

  // 4. Fix unescaped newlines INSIDE string values
  //    Walk char by char — inside a string, replace bare \n \r \t with spaces
  cleaned = fixUnescapedInStrings(cleaned);

  // 5. Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}

function fixUnescapedInStrings(input: string): string {
  let result    = "";
  let inString  = false;
  let escaped   = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escaped) {
      result  += ch;
      escaped  = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      result += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      // Replace bare control chars inside strings with a space
      if (ch === "\n" || ch === "\r") {
        result += " ";
        continue;
      }
      if (ch === "\t") {
        result += " ";
        continue;
      }
    }

    result += ch;
  }

  return result;
}
