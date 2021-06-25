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
