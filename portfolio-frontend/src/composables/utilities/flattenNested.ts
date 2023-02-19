function checkDeepEquality(
  a: any,
  b: any,
  maxRecursion: number,
  counter: number = 0
): boolean {
  if (!(a instanceof Object)) {
    return a == b;
  } else {
    if (counter >= maxRecursion) {
      return true;
    }
    if (Object.keys(a).length != Object.keys(b).length) {
      return false;
    }
    let out = true;
    for (const key in a) {
      out = out && checkDeepEquality(a[key], b[key], maxRecursion, counter++);
    }
    return out;
  }
}

export function flattenNested<T, U>(
  objectList: T[],
  fn: (item: T) => U,
  maxRecursion: number
) {
  return objectList.reduce((acc: U[], obj: T) => {
    const key = fn(obj);
    if (!acc.some((k) => checkDeepEquality(k, key, maxRecursion))) {
      return [...acc, key];
    }
    return acc;
  }, []);
}
