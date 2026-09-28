/** Singly linked list node holding one booking record. */
export class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Singly linked list for dynamic booking records.
 * insert() at the tail is O(1) using a tail pointer.
 * search() and delete() are O(n).
 */
export class BookingLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  insert(data) {
    const node = new Node(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length += 1;
    return node;
  }

  search(bookingId) {
    let current = this.head;
    while (current) {
      if (current.data.id === bookingId) return current.data;
      current = current.next;
    }
    return null;
  }

  delete(bookingId) {
    if (!this.head) return false;

    if (this.head.data.id === bookingId) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.length -= 1;
      return true;
    }

    let previous = this.head;
    let current = this.head.next;
    while (current) {
      if (current.data.id === bookingId) {
        previous.next = current.next;
        if (current === this.tail) this.tail = previous;
        this.length -= 1;
        return true;
      }
      previous = current;
      current = current.next;
    }
    return false;
  }

  update(bookingId, updater) {
    let current = this.head;
    while (current) {
      if (current.data.id === bookingId) {
        current.data = updater(current.data);
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  traverse(callback) {
    const items = [];
    let current = this.head;
    while (current) {
      if (callback) callback(current.data);
      items.push(current.data);
      current = current.next;
    }
    return items;
  }

  toArray() {
    return this.traverse();
  }

  fromArray(items) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (!Array.isArray(items)) return this;
    for (let i = 0; i < items.length; i += 1) {
      this.insert(items[i]);
    }
    return this;
  }
}
