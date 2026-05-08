export function stableMergeSort<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  const n = items.length;
  if (n <= 1) return [...items];

  let source = [...items];
  let target = new Array<T>(n);

  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n; left += 2 * width) {
      const mid = Math.min(left + width, n);
      const right = Math.min(left + 2 * width, n);

      let i = left;
      let j = mid;
      let k = left;

      while (i < mid && j < right) {
        if (compare(source[i], source[j]) <= 0) {
          target[k++] = source[i++];
        } else {
          target[k++] = source[j++];
        }
      }
      while (i < mid) target[k++] = source[i++];
      while (j < right) target[k++] = source[j++];
    }

    const tmp = source;
    source = target;
    target = tmp;
  }

  return source;
}
