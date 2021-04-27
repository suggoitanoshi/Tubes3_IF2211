const path = require('path');
const util = require('./util.js');

let katapenting;
let katatanya;

util.parseCSV(path.join(__dirname, '../data/katapenting.csv')).then((data) => {
  katapenting = data;
});
util.parseCSV(path.join(__dirname, '../data/querywords.csv')).then((data) => {
  katatanya = data;
});

/**
 * Membuat reply dari query yang diberikan
 * @param {string} query query dari pengguna
 * @returns {string} reply yang dihasilkan dari pencocokan string
 */
const generateReply = (query) => {
  const adaKatapenting = katapenting['alias'].filter((kata) => BoyerMoore(query, kata) !== -1).length !== 0;
  if(!adaKatapenting) return 'Pesan tidak dikenali';
  const tanya = katatanya['kata'].filter((kata) => BoyerMoore(query, kata) !== -1).length !== 0;
  const date = extractDate(query);
  if(tanya){
    const period = getTimePeriod(query, date);
    return 'Anda bertanya, bot menjawab';
  }
  const type = extractType(query);
  const matkul = extractKodeMatkul(query);
  let topic = extractTopic(query);
  if(date.length == 0)
  {
    return 'Error date';
  }
  else if(typeof matkul === 'undefined')
  {
    return 'Error matkul';
  }
  else if(type[0]!="[")
  {
    hasil = date + " | " + type + " | " + matkul[0].toUpperCase(); 
    /*fs = require('fs');
    fs.appendFile("tasks.txt", hasil + "\n", function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("Saved");});*/
    return "[task] " + hasil;
  }
  else
  {
    return "Error type";
  }

};

/**
 * Knuth-Morris-Pratt algorithm untuk pattern matching
 * @param {string} string string yang ingin dicari patternnya
 * @param {string} pattern pattern yang ingin dicari
 * @returns {int} index kemunculan pertama pattern, -1 jika tidak ditemukan
 */
const KMP = (string, pattern) => {
  let n = string.length, m = pattern.length;
  let border = [];
  border = b(pattern);
  let i = 0, j = 0;

  const b = (x) => {  // border function
    let fail = []
    fail[0] = 0;
    let i = 1, j = 0;
    let m = pattern.length();
    while (i < m) {
        if (pattern.charAt(j) == pattern.charAt(i)) {
          fail[i] = j + 1;
        i++;
        j++;
        }
        else if (j > 0)
          j = fail[j-1];
        else {
          fail[i] = 0;
        i++;
        }
      }
      return fail;
  };

  while (i < n) {
      if (pattern.charAt(j) == text.charAt(i)) {
        if (j == m - 1) return i - m + 1; // Match Found
        i++;
        j++;
      }
      else if (j > 0) j = fail[j-1];
      else i++;
  } 
  return -1; // No Match Found
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

/**
 * Mengambil tanggal tanggal yang valid dari query
 * @param {string} query query dari pengguna
 * @returns {[Date]} Array berisi date-date yang valid dari query
 */
const extractDate = (query) => {
  const month = {'jan': 0,
                 'feb': 1,
                 'mar': 2,
                 'apr': 3,
                 'mei': 4,
                 'jun': 5,
                 'jul': 6,
                 'agu': 7,
                 'sep': 8,
                 'okt': 9,
                 'nov': 10,
                 'des': 11
                }
  const match = query.matchAll(/(?<d>\d{1,2})(\ |\/|-)(?<m>[a-zA-Z]{3}|\d{1,2})[a-zA-Z]*(\ |\/|-)(?<y>\d{1,4})/g);
  const dates = [...match].map((m) =>{
    m = m.groups;
    return new Date(m.y, month[m?.m?.toLowerCase()] ?? m.m-1, m.d);
  });
  return dates;
}

/**
 * Mengambil kode mata kuliah dari query
 * @param {string} query 
 * @returns {string} kode matkul, mungkin undefined
 */
const extractKodeMatkul = (query) => {
  kode = query.match(/([a-z]{2}\d{4})/i);
  return kode?.[0]?.toUpperCase();
}

/**
 * Mengambil tipe kata penting dari query
 * @param {string} query query dari pengguna
 * @returns {string} kata penting, atau error yang dibatasi []
 */
const extractType = (query) => {
  tipe = query.match(new RegExp(`\\s+${katapenting['alias'].join('|')}\\s+`, 'ig'));
  if(tipe === null)
  {
    return "[Task type not detected]";
  }
  else if(tipe.length>1)
  {
    return "[More than one task detected]";
  }
  else
  {
    return katapenting['tipe'][katapenting['alias'].indexOf(tipe[0].toLowerCase())] ?? '[Task type not detected]';
  }
}

/**
 * Mengambil topik dari task tertentu berdasarkan query
 * @param {string} query query yang diberikan pengguna
 * @returns {string} topik, mungkin undefined.
 */
const extractTopic = (query) => {
  const topic = query.match(/".*"/)?.[0];
  return topic?.substring(1, topic?.length-1);
}

/**
 * Mengambil tahun, bulan, dan tanggal hari ini
 * @returns {{y, m, d}} objek berisi `y`: tahun, `m`: bulan, dan `d`: hari.
 */
const getToday = () => {
  const now = new Date(Date.now());
  return {'y': now.getFullYear(), 'm': now.getMonth(), 'd': now.getDate()};
}

/**
 * Mengambil "range" dua tanggal dari query
 * @param {string} query query dari pengguna
 * @param {string} dates tanggal yang di-extract dari query
 * @returns {[Date]} Array berisi 2 date, awal dan akhir. mungkin kosong.
 */
const getTimePeriod = (query, dates) => {
  if(query.match(/antara/i) !== null){
    if(dates?.length < 2) return undefined;
    return dates.slice(0,2);
  }
  if(query.match(/hari ini/i) !== null){
    const datetoday = getToday();
    return [
      new Date(datetoday.y, datetoday.m, datetoday.d),
      new Date(datetoday.y, datetoday.m, datetoday.d, 23, 59, 59)
    ];
  }
  if(query.match(/ke depan/i) !== null){
    const range = query.match(/(\d)\s+(.*)?\s+ke depan/)?.groups;
    let mult = 1, n = 0;
    if(typeof range?.[0] === 'undefined') return undefined;
    else n = range?.[0]-0;
    if(typeof range?.[1] === 'undefined') return undefined;
    else mult = range?.[1].match(/minggu/i) === null ? 1 : 7;
    const datetoday = getToday();
    return [
      new Date(datetoday.y, datetoday.m, datetoday.d),
      new Date(datetoday.y, datetoday.m, datetoday.d+(mult*n))
    ];
  }
  else return [];
}

module.exports = { generateReply };
