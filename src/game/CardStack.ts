import { Container, Graphics } from "pixi.js";
import { Card } from "./Card";

export class CardStack extends Container {
  public cards: Card[] = [];

  private stackVisual: Graphics;

  private readonly SNAP_DISTANCE = 100;

  constructor(private table: Container) {
    super();

    this.stackVisual = new Graphics();

    this.stackVisual.roundRect(0, 0, 80, 130, 5).fill(0x222222).stroke({
      width: 2,
      color: 0xffffff,
    });

    this.addChild(this.stackVisual);
  }

  /**
   * Add a card to the TOP of the stack.
   */
  push(card: Card) {
    /*
     * Remember where the card is in world space
     * before changing its parent.
     */
    const globalPosition = card.getGlobalPosition();

    // Remove card from the table.
    this.table.removeChild(card);

    // Make the stack its new parent.
    this.addChild(card);

    // Mark the card as belonging to this stack.
    card.stack = this;

    // Cards inside the stack are always face-down.
    card.flipToBack();

    // Last element in the array is the top.
    this.cards.push(card);

    /*
     * Convert the old world position to this stack's
     * local coordinate system.
     */
    const localPosition = this.toLocal(globalPosition);

    card.position.copyFrom(localPosition);

    this.updateVisualOrder();
  }

  /**
   * Remove and return the TOP card.
   */
  pop(): Card | undefined {
    const card = this.cards.pop();

    if (!card) {
      return undefined;
    }

    /*
     * Remember the card's world position before
     * changing its parent.
     */
    const globalPosition = card.getGlobalPosition();

    // Card is no longer part of a stack.
    card.stack = null;

    // Remove from stack.
    this.removeChild(card);

    // Put it back onto the table.
    this.table.addChild(card);

    /*
     * Convert its old world position to the
     * table's coordinate system.
     */
    const localPosition = this.table.toLocal(globalPosition);

    card.position.copyFrom(localPosition);

    return card;
  }

  /**
   * Look at the TOP card without removing it.
   */
  peek(): Card | undefined {
    return this.cards[this.cards.length - 1];
  }

  isNear(card: Card): boolean {
    const stackPosition = this.getGlobalPosition();
    const cardPosition = card.getGlobalPosition();

    const dx = cardPosition.x - stackPosition.x;
    const dy = cardPosition.y - stackPosition.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= this.SNAP_DISTANCE;
  }

  /**
   * Update the visual ordering of the cards.
   *
   * The last card in cards[] is rendered last,
   * therefore it appears on top.
   */
  private updateVisualOrder() {
    this.cards.forEach((card, index) => {
      card.x = 0;
      card.y = 0;
    });

    for (const card of this.cards) {
      this.addChild(card);
    }
  }
}
