const fs = require("node:fs");
const path = require("node:path");

const messagesDir = path.join(process.cwd(), "src", "messages");
const locales = fs.readdirSync(messagesDir).filter((file) => file.endsWith(".json"));

if (locales.length === 0) {
  console.error("No translation files found in src/messages");
  process.exit(1);
}

const baseLocale = "zh.json";
if (!locales.includes(baseLocale)) {
  console.error(`Base locale ${baseLocale} not found.`);
  process.exit(1);
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, nextKey));
    } else {
      keys.push(nextKey);
    }
  }
  return keys;
}

function readJson(file) {
  const filePath = path.join(messagesDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

const baseKeys = new Set(flattenKeys(readJson(baseLocale)));
let hasMismatch = false;

locales
  .filter((file) => file !== baseLocale)
  .forEach((file) => {
    const keys = new Set(flattenKeys(readJson(file)));
    const missing = [...baseKeys].filter((key) => !keys.has(key));
    const extra = [...keys].filter((key) => !baseKeys.has(key));

    if (missing.length || extra.length) {
      hasMismatch = true;
      if (missing.length) {
        console.error(`\n[${file}] Missing keys compared to ${baseLocale}:`);
        missing.forEach((key) => console.error(`  - ${key}`));
      }
      if (extra.length) {
        console.error(`\n[${file}] Extra keys not in ${baseLocale}:`);
        extra.forEach((key) => console.error(`  + ${key}`));
      }
    } else {
      console.log(`[${file}] ✓ matches ${baseLocale}`);
    }
  });

if (hasMismatch) {
  process.exit(1);
}

console.log("\nAll translation files contain the same key set.");
