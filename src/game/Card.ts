import {
  Container,
  Sprite,
  Texture,
  Point,
  type FederatedPointerEvent,
} from "pixi.js";

import type { TarotCardData } from "../data/tarotCards";
import type { CardStack } from "./CardStack";

export class Card extends Container {
  public readonly data: TarotCardData;

  // null means the card is currently free on the table.
  public stack: CardStack | null = null;

  private stackTarget: CardStack;

  private frontSprite: Sprite;
  private backSprite: Sprite;

  private dragging = false;
  private faceUp = true;

  private dragOffset = new Point();

  constructor(data: TarotCardData, stackTarget: CardStack) {
    super();

    this.data = data;
    this.stackTarget = stackTarget;

    this.frontSprite = new Sprite(Texture.from(data.image));
    this.backSprite = new Sprite(Texture.from("/cards/back.png"));

    const CARD_WIDTH = 80;

    this.frontSprite.width = CARD_WIDTH;
    this.frontSprite.height =
      CARD_WIDTH *
      (this.frontSprite.texture.height / this.frontSprite.texture.width);

    this.backSprite.width = CARD_WIDTH;
    this.backSprite.height =
      CARD_WIDTH *
      (this.backSprite.texture.height / this.backSprite.texture.width);

    this.addChild(this.frontSprite);
    this.addChild(this.backSprite);

    this.backSprite.visible = false;

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", this.startDragging);
    this.on("pointerup", this.stopDragging);
    this.on("pointerupoutside", this.stopDragging);
    this.on("globalpointermove", this.drag);
    this.on("pointercancel", this.stopDragging);
    this.on("pointertap", this.onTap);
  }

  private startDragging = (event: FederatedPointerEvent) => {
    if (!this.parent) return;

    /*
     * If this card belongs to a stack,
     * only the top card can be removed.
     */
    if (this.stack && this.stack.peek() !== this) {
      return;
    }

    /*
     * If we're inside a stack, pop ourselves out.
     *
     * pop() also moves us from the stack
     * to the table.
     */
    if (this.stack) {
      this.stack.pop();
    }

    this.dragging = true;

    const pointerPosition = event.getLocalPosition(this.parent);

    this.dragOffset.set(pointerPosition.x - this.x, pointerPosition.y - this.y);

    // Bring the card to the front of the table.
    this.parent.addChild(this);
  };

  private stopDragging = () => {
    if (!this.dragging) return;

    this.dragging = false;

    if (this.stackTarget.isNear(this)) {
      this.stackTarget.push(this);
    }

    /*
     * If the card was released close enough to a stack,
     * push it back into the stack.
     *
     * This will be added when you connect the stack
     * to your table's snapping logic.
     */
  };

  private drag = (event: FederatedPointerEvent) => {
    if (!this.dragging || !this.parent) return;

    const pointerPosition = event.getLocalPosition(this.parent);

    this.position.set(
      pointerPosition.x - this.dragOffset.x,
      pointerPosition.y - this.dragOffset.y,
    );
  };

  private onTap = (event: FederatedPointerEvent) => {
    // Cards inside the stack shouldn't be flipped.
    if (this.stack) return;

    if (event.detail === 2) {
      this.flip();
    }
  };

  flip() {
    if (this.faceUp) {
      this.flipToBack();
    } else {
      this.flipToFront();
    }
  }

  flipToBack() {
    this.faceUp = false;

    this.frontSprite.visible = false;
    this.backSprite.visible = true;
  }

  flipToFront() {
    this.faceUp = true;

    this.frontSprite.visible = true;
    this.backSprite.visible = false;
  }
}
