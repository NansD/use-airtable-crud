/**
 * Creates a duplicate-free version of an array,
 * where the determining element to filter the array is a provided key name.
 * @param array An array of objects
 * @param key A key name
 * @returns An array of unique elements filtered on the provided key name
 */
export default function uniqBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T,
): T[] {
  const unique: T[] = [];
  const alreadySeen: any[] = [];
  array.forEach((element) => {
    if (alreadySeen.includes(element[key])) return;
    alreadySeen.push(element[key]);
    unique.push(element);
  });
  return unique;
}
