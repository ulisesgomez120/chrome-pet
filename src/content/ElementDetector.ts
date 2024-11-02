// src/content/ElementDetector.ts
interface InteractiveElement {
  element: HTMLElement;
  rect: DOMRect;
  type: string;
  priority: number;
}

export class ElementDetector {
  private interactiveElements: Set<InteractiveElement>;
  private lastScan: number = 0;
  private readonly SCAN_INTERVAL = 1000; // Scan every second
  private readonly VIEWPORT_MARGIN = 100; // px outside viewport to check

  constructor() {
    this.interactiveElements = new Set();
  }

  public scanVisible(): void {
    const now = performance.now();
    if (now - this.lastScan < this.SCAN_INTERVAL) return;

    // Clear previous elements
    this.interactiveElements.clear();

    // Get viewport bounds with margin
    const bounds = this.getViewportBounds();

    // Scan for various types of interactive elements
    this.scanForType("div", 0.1, bounds);
    this.scanForType("h1, h2, h3", 0.3, bounds);
    this.scanForType("p", 0.2, bounds);
    this.scanForType("img, video", 0.4, bounds);
    this.scanForType("button, a", 0.5, bounds);
    this.scanForType("input, textarea", 0.6, bounds);

    this.lastScan = now;
  }

  private scanForType(selector: string, priority: number, bounds: DOMRect): void {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const rect = element.getBoundingClientRect();

      // Skip if element is not in viewport
      if (!this.isInBounds(rect, bounds)) return;

      // Skip tiny elements
      if (rect.width < 20 || rect.height < 20) return;

      // Skip hidden elements
      if (!this.isVisible(element)) return;

      this.interactiveElements.add({
        element,
        rect,
        type: element.tagName.toLowerCase(),
        priority,
      });
    });
  }

  private getViewportBounds(): DOMRect {
    return {
      top: -this.VIEWPORT_MARGIN,
      left: -this.VIEWPORT_MARGIN,
      right: window.innerWidth + this.VIEWPORT_MARGIN,
      bottom: window.innerHeight + this.VIEWPORT_MARGIN,
      width: window.innerWidth + 2 * this.VIEWPORT_MARGIN,
      height: window.innerHeight + 2 * this.VIEWPORT_MARGIN,
      x: -this.VIEWPORT_MARGIN,
      y: -this.VIEWPORT_MARGIN,
    } as DOMRect;
  }

  private isInBounds(rect: DOMRect, bounds: DOMRect): boolean {
    return !(
      rect.right < bounds.left ||
      rect.left > bounds.right ||
      rect.bottom < bounds.top ||
      rect.top > bounds.bottom
    );
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  public getNearestElement(position: { x: number; y: number }): InteractiveElement | null {
    let nearest: InteractiveElement | null = null;
    let minDistance = Infinity;

    this.interactiveElements.forEach((element) => {
      const centerX = element.rect.left + element.rect.width / 2;
      const centerY = element.rect.top + element.rect.height / 2;

      const distance = Math.hypot(centerX - position.x, centerY - position.y);

      // Weight distance by priority (higher priority elements seem closer)
      const weightedDistance = distance * (1 - element.priority);

      if (weightedDistance < minDistance) {
        minDistance = weightedDistance;
        nearest = element;
      }
    });

    return nearest;
  }

  public getInteractivePoints(element: HTMLElement): Array<{ x: number; y: number }> {
    const rect = element.getBoundingClientRect();
    const points: Array<{ x: number; y: number }> = [];

    // Add corners
    points.push(
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.left, y: rect.bottom },
      { x: rect.right, y: rect.bottom }
    );

    // Add center points
    points.push(
      { x: rect.left + rect.width / 2, y: rect.top },
      { x: rect.left + rect.width / 2, y: rect.bottom },
      { x: rect.left, y: rect.top + rect.height / 2 },
      { x: rect.right, y: rect.top + rect.height / 2 }
    );

    return points;
  }

  public getInteractiveElements(): Set<InteractiveElement> {
    return this.interactiveElements;
  }
}
