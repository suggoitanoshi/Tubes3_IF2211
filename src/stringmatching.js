const generateReply = (query) => {
  return query;
};

/**
 * Knuth-Morris-Pratt algorithm untuk pattern matching
 * @param {string} string string yang ingin dicari patternnya
 * @param {string} pattern pattern yang ingin dicari
 * @returns {int} index kemunculan pertama pattern, -1 jika tidak ditemukan
 */
const KMP = (string, pattern) => {
  const b = (x) => {}; // border function
  return true;
};

/**
 * Boyer-Moore algorithm untuk pattern matching
 * @param {string} string string yang ingin dicari patternnya
 * @param {string} pattern pattern yang ingin dicari
 * @returns {int} index kemunculan pertama pattern, -1 jika tidak ditemukan
 */
const BoyerMoore = (string, pattern) => {
  const LMap = pattern.split('').reduce((map, x, i) => {
    map[x] = i;
    return map;
  }, {});
  const L = (x) => LMap[x] ?? -1; // last occurrence function
  let n = string.length, m = pattern.length;
  let i = j = m-1;
  while(i < n){ 
    if(string.charAt(i) == pattern.charAt(j)){
      if(j == 0) return i;
      else{
        i--; j--;
      }
    }
    else{
      let lo = L(string.charAt(i));
      i = i + m - Math.min(j, lo+1);
      j = m - 1;
    }
  }
  return -1;
}

module.exports = { generateReply };