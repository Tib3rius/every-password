export const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32));
export const ASCII_COUNT = 95n;

export function indexToPassword(index, length) {
  let result = '';
  let n = BigInt(index);
  const base = ASCII_COUNT;
  for (let i = 0; i < length; i++) {
    const digit = n % base;
    result = PRINTABLE_ASCII[Number(digit)] + result;
    n = n / base;
  }
  return result;
}
