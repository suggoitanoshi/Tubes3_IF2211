/**
 * Membuat reply dari query yang diberikan
 * @param {string} query query dari pengguna
 * @returns {string} reply yang dihasilkan dari pencocokan string
 */
const generateReply = (query) => {
  return extractDate(query).toString();
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

/**
 * Menghitung Levenshtein Distance antara dua string
 * @param {string} str1 string pertama
 * @param {string} str2 string kedua
 * @returns {int} Levenshtein Distance str1 dan str2
 */
const LevenshteinDistance = (str1, str2) => {
  if(str1.length == 0) return str2.length;
  if(str2.length == 0) return str1.length;
  if(str1.charAt(0) == str2.charAt(0)) return LevenshteinDistance(str1.substring(1), str2.substring(1));
  return 1+Math.min(
    LevenshteinDistance(str1.substring(1), str2),
    LevenshteinDistance(str1, str2.substring(1)),
    LevenshteinDistance(str1.substring(1), str2.substring(1))
  );
}

module.exports = { generateReply };