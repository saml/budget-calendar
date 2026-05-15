import '@testing-library/jest-dom'

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserver as typeof globalThis.ResizeObserver
}

if (!('getComputedTextLength' in SVGElement.prototype)) {
  ;(SVGElement.prototype as SVGElement & { getComputedTextLength: () => number }).getComputedTextLength =
    () => 0
}

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }) as MediaQueryList
}
