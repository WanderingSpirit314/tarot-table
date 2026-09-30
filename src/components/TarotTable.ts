import { Application, Assets } from "pixi.js";
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

export async function createTarotTable(element: HTMLElement) {
  const app = new Application();

  await app.init({
    resizeTo: element,
    background: "#111111",
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  element.appendChild(app.canvas);

  /*
   * Load every card image plus the shared card back.
   */
  await Assets.load([
    ...tarotCards.map((card) => card.image),
    "/cards/back.png",
  ]);

  /*
   * Create the stack.
   *
   * app.stage is the table.
   */
  const stack = new CardStack(app.stage);

  app.stage.addChild(stack);

  function positionStack() {
    stack.x = 40;
    stack.y = app.screen.height - 240;
  }

  positionStack();

  const shuffledCards = shuffle(tarotCards);

  /*
   * Create every card and put it into the stack.
   *
   * This means the last card is the top card.
   */
  for (const cardData of shuffledCards) {
    const card = new Card(cardData, stack);

    stack.push(card);
  }

  window.addEventListener("resize", positionStack);

  return app;
}
