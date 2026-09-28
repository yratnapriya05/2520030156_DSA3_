/**
 * FIFO queue for booking / waitlist requests.
 * enqueue is O(1). dequeue is amortized O(1) using a head index
 * (avoids O(n) Array.shift on every removal).
 */
export class BookingQueue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(item) {
    this.items.push(item);
    return this.size();
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const value = this.items[this.head];
    this.items[this.head] = undefined;
    this.head += 1;
    if (this.head > 16 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return value;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.head];
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.items.length - this.head;
  }

  toArray() {
    return this.items.slice(this.head);
  }

  fromArray(items) {
    this.items = Array.isArray(items) ? items.slice() : [];
    this.head = 0;
    return this;
  }
}
