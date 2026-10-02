import { Assets, Application } from "pixi.js";
import { Card } from "../game/Card";
import { CardStack } from "../game/CardStack";
import { tarotCards } from "../data/tarotCards";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export async function createTarotTable(app: Application) {
  await Assets.load([
    ...tarotCards.map((card) => card.image),
    "/cards/back.png",
  ]);

  const stack = new CardStack(app.stage);

  app.stage.addChild(stack);

  function positionStack() {
    stack.x = 40;
    stack.y = app.screen.height - 240;
  }

  positionStack();

  const shuffledCards = shuffle(tarotCards);

  for (const cardData of shuffledCards) {
    const card = new Card(cardData, stack);

    stack.push(card);
  }

  window.addEventListener("resize", positionStack);
}
