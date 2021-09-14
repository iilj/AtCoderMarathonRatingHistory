const pad = (n: number): string => {
  return `0${n}`.slice(-2);
};

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
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  return `${year}/${month}/${date}`;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// 2021-08-14(Sat) 22:40
export const formatDatetime = (d: Date): string => {
  const year = String(d.getFullYear());
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const day = DAYS[d.getDay()];
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${date}(${day}) ${hours}:${minutes}`;
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

/**
 * 増減値を文字列に変換する
 * @param x 増減値
 * @returns 増減値を表す文字列
 */
export const getDiff = (x: number): string => {
  const sign = x === 0 ? '±' : x < 0 ? '-' : '+';
  return `${sign}${Math.abs(x)}`;
};

export const getHashtagSet = (slug: string): string[] => {
  const hashtags = ['#AtCoder'];
  if (slug.startsWith('ahc')) {
    hashtags.push(`#${slug.toUpperCase()}`);
  } else if (slug === 'rcl-contest-2021-long') {
    hashtags.push('#R_procon');
  }
  return hashtags;
};
