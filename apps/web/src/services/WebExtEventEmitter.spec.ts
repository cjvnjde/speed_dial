import { WebExtEventEmitter } from "./WebExtEventEmitter";

describe("WebExtEventEmitter", () => {
  test("Should be possible to add listenens", () => {
    const emitter = new WebExtEventEmitter();
    const lisnener = vi.fn();

    emitter.addListener(lisnener);

    expect(emitter.hasListener(lisnener)).toBeTruthy();
  });

  test("Should be possible to remove listenens", () => {
    const emitter = new WebExtEventEmitter();
    const lisnener = vi.fn();

    emitter.addListener(lisnener);
    expect(emitter.hasListener(lisnener)).toBeTruthy();
    emitter.removeListener(lisnener);
    expect(emitter.hasListener(lisnener)).toBeFalsy();
  });

  test("Should emmit listeners", () => {
    const emitter = new WebExtEventEmitter();
    const lisnener = vi.fn();

    emitter.addListener(lisnener);
    emitter.emit("hello");
    expect(lisnener).toHaveBeenCalledWith("hello");
  });

  test("Should emmit multiple listeners", () => {
    const emitter = new WebExtEventEmitter();
    const lisnener1 = vi.fn();
    const lisnener2 = vi.fn();

    emitter.addListener(lisnener1);
    emitter.addListener(lisnener2);
    emitter.emit("hello");
    expect(lisnener1).toHaveBeenCalledWith("hello");
    expect(lisnener2).toHaveBeenCalledWith("hello");
  });
});
