export function groupBy<T>(objectArray: T[], fn: (item: T) => string) {
  return objectArray.reduce<Record<string, T[]>>((acc, obj) => {
    const key = fn(obj);
    const curGroup = acc[key] || [];

    return { ...acc, [key]: [...curGroup, obj] };
  }, {});
}
