const palette = [
  { label: "text.primary on surface", foreground: "#f4f5fa", background: "#0f1624" },
  { label: "text.secondary on surface", foreground: "#c3c8de", background: "#0f1624" },
  { label: "accent.pink on surface", foreground: "#ff7ac3", background: "#0f1624" },
  { label: "accent.teal on surface", foreground: "#59c3c3", background: "#0f1624" },
  { label: "accent.yellow on surface", foreground: "#ffd166", background: "#0f1624" },
];

function luminance(hex) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const linearize = (channel) =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(foreground, background) {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

let hasFailure = false;

for (const entry of palette) {
  const ratio = contrastRatio(entry.foreground, entry.background);
  const rounded = Math.round(ratio * 100) / 100;
  const passes = ratio >= 4.5;
  if (!passes) {
    hasFailure = true;
  }
  console.log(`${entry.label}: ${rounded}:1 ${passes ? "(PASS)" : "(FAIL)"}`);
}

if (hasFailure) {
  process.exitCode = 1;
}
