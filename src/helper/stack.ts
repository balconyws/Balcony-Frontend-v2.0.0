import { Pages } from '@/types';

export default class Stack {
  private stack: string[];
  private size: number;
  private top: number;
  private firstElement: Pages;

  constructor(size: number, firstElement: Pages) {
    this.stack = [];
    this.size = size;
    this.top = -1;
    this.firstElement = firstElement;
    this.push(firstElement);
  }

  push(val: string): void {
    if (this.top < this.size - 1) {
      this.top = this.top + 1;
      this.stack[this.top] = val;
    }
  }

  pop(): string | null {
    if (this.top < 0) {
      return this.firstElement;
    }
    this.top = this.top - 1;
    return this.stack[this.top];
  }

  getTop(): Pages {
    if (this.top < 0) {
      return this.firstElement;
    }
    return this.stack[this.top] as Pages;
  }

  getSecondTop(): Pages {
    if (this.top < 1) {
      return this.firstElement;
    }
    return this.stack[this.top - 1] as Pages;
  }

  isEmpty(): boolean {
    return this.top === -1;
  }

  empty(): void {
    this.top = -1;
    this.push(this.firstElement);
  }
}
