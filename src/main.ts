import "./style.css";

import { Application } from "pixi.js";
import { createTarotTable } from "./components/TarotTable";

const app = new Application();

await app.init({
  resizeTo: window,
  background: "#111111",
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.canvas);

createTarotTable(app);
