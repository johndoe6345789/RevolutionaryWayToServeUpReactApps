import { JSDOM } from "jsdom";

declare function require(name: string): any;

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost"
});

const { window } = dom;

globalThis.window = window as unknown as typeof globalThis.window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
if (typeof window.requestAnimationFrame === "function") {
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
}
if (typeof window.cancelAnimationFrame === "function") {
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
}

const fetchImpl = window.fetch || globalThis.fetch;
if (fetchImpl) {
  globalThis.fetch = fetchImpl.bind(window);
}

// Reuse the shared Jest-style setup (matchers + bootstrap guard)
require("./setupTests");
