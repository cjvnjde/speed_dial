export class WebExtEventEmitter<T extends (...args: unknown[]) => void> {
  private listeners: T[] = [];

  addListener(callback: T) {
    this.listeners.push(callback);
  }

  removeListener(callback: T) {
    const index = this.listeners.indexOf(callback);

    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  hasListener(callback: T) {
    return this.listeners.includes(callback);
  }

  emit(...args: Parameters<T>) {
    this.listeners.forEach((listener) => listener(...args));
  }
}
