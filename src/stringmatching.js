const path = require('path');
const util = require('./util.js');

let katapenting;

util.parseCSV(path.join(__dirname, '../data/katapenting.csv')).then((data) => {
  katapenting = data;
});

/**
 * Membuat reply dari query yang diberikan
 * @param {string} query query dari pengguna
 * @returns {string} reply yang dihasilkan dari pencocokan string
 */
const generateReply = (query) => {
  type = extractType(query);
  date = extractDate(query).toString();
  matkul = extractKodeMatkul(query);
  if(date!="Invalid Date" && type[0]!="[" && matkul!=null)
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
  else if(date=="Invalid Date")
  {
    return "Error date";
  }
  else if(matkul==null)
  {
    return "Error matkul";
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
  const match = query.match(/(?<d>\d{1,2})(\ |\/|-)(?<m>[a-zA-Z]{3}|\d{1,2})[a-zA-Z]*(\ |\/|-)(?<y>\d{1,4})/)?.groups;
  return new Date(match?.y, month[match?.m?.toLowerCase()] ?? match?.m-1, match?.d);
}

const extractKodeMatkul = (query) => {
  kode = query.match(/([a-z]{2}\d{4})/i);
  if(kode!=null)
  {
    return kode[0].toUpperCase();
  }
  else
  {
    return "[Matkul not found]";
  }
}

const extractType = (query) => {
  tipe = query.match(/(tubes|tugas besar|tucil|tugas kecil|kuis|quiz|uts|uas|ujian|praktikum|pr)+/ig);
  if(tipe==null)
  {
    return "[Task type not detected]";
  }
  else if(tipe.length>1)
  {
    return "[More than one task detected]";
  }
  else
  {
    if(tipe[0].toUpperCase()=="TUBES" || tipe[0].toUpperCase()=="TUGAS BESAR") {return "Tugas Besar";}
    else if(tipe[0].toUpperCase()=="TUCIL" || tipe[0].toUpperCase()=="TUGAS KECIL") {return "Tugas Kecil";}
    else if(tipe[0].toUpperCase()=="KUIS" || tipe[0].toUpperCase()=="QUIZ") {return "Kuis";}
    else if(tipe[0].toUpperCase()=="UTS" || tipe[0].toUpperCase()=="UAS" || tipe[0].toUpperCase()=="UJIAN") {return "Ujian";}
    else if(tipe[0].toUpperCase()=="PRAKTIKUM") {return "Praktikum";}
    else if(tipe[0].toUpperCase()=="PR") {return "PR";}
    else {return "[Task type not detected]";}
  }
}

module.exports = { generateReply };