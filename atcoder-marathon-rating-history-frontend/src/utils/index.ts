/**
 * 順位の数値から順位文字列に変換する
 * @param x 順位
 * @returns 順位文字列
 */
export const getOrdinal = (x: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = x % 100;
  return `${x}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const formatDate = (d: Date): string => {
  const year = String(d.getFullYear());
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const date = `0${d.getDate()}`.slice(-2);
  return `${year}/${month}/${date}`;
};

export const getPer = (x: number, l: number, r: number): number => {
  return (x - l) / (r - l);
};

/**
 * returns array [start, start+1, ..., end].
 *
 * @param {number} start start number
 * @param {number} end end number
 * @returns {number[]} array
 */
export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (v, k) => k + start);
