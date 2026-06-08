// Ordinary comments carry no TypeScript suppression directives.
// This is a normal explanatory comment about the next line.
const total = 1 + 2;

/* A block comment describing the function below. */
function add(a: number, b: number): number {
  return a + b;
}

// TODO: revisit this later — not a ts-suppression directive.
const label = 'ts-expect-error is mentioned only in prose here';
