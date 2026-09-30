const fs = require("fs");
const path = require("path");

const cardsDir = path.join(process.cwd(), "public/cards");
const outputFile = path.join(process.cwd(), "src/data/tarotCards.ts");

const files = fs
  .readdirSync(cardsDir)
  .filter((file) => /\.webp$/i.test(file))
  .sort((a, b) => {
    const numA = parseInt(a.match(/^\d+/)?.[0] || "999");
    const numB = parseInt(b.match(/^\d+/)?.[0] || "999");

    return numA - numB;
  });

function toId(file) {
  const match = file.match(/^(\d+)-(.+)\.webp$/i);

  if (!match) {
    return null;
  }

  const number = match[1];
  const filename = match[2];

  return `${number}-${filename
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function toName(file) {
  const match = file.match(/^(\d+)-(.+)\.webp$/i);

  if (!match) {
    return null;
  }

  const filename = match[2];

  return filename
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bOf\b/g, "of")
    .trim();
}

const cards = files
  .map((file) => {
    const id = toId(file);
    const name = toName(file);

    if (!id || !name) {
      console.warn(`Skipping invalid filename: ${file}`);
      return null;
    }

    return {
      id,
      name,
      image: `/cards/${file}`,
    };
  })
  .filter(Boolean);

const output = `export interface TarotCardData {
  id: string;
  name: string;
  image: string;
}

export const tarotCards: TarotCardData[] = [
${cards
  .map(
    (card) => `  {
    id: "${card.id}",
    name: "${card.name}",
    image: "${card.image}",
  }`,
  )
  .join(",\n")}
];
`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, "utf8");

console.log(`Found ${files.length} WebP image files.`);
console.log(`Generated ${cards.length} tarot cards.`);
console.log(`Updated: ${outputFile}`);

if (files.length !== 78) {
  console.warn(`⚠️ Expected 78 images, but found ${files.length}.`);
}

if (cards.length !== 78) {
  console.warn(`⚠️ Expected 78 cards, but generated ${cards.length}.`);
}
