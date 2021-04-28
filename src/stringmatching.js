const path = require('path');
const util = require('./util.js');
const db = require('./database.js');

let katapenting, katatanya, kataubah, kataselesai;

util.parseCSV(path.join(__dirname, '../test/katapenting.csv')).then((data) => {
  katapenting = data;
});
util.parseCSV(path.join(__dirname, '../test/querywords.csv')).then((data) => {
  katatanya = data;
});
util.parseCSV(path.join(__dirname, "../test/changekeyword.csv")).then((data) => {
  kataubah = data;
});
util.parseCSV(path.join(__dirname, '../test/finishkeyword.csv')).then((data) => {
  kataselesai = data;
});

/**
 * Membuat reply dari query yang diberikan
 * @param {string} query query dari pengguna
 * @returns {string} reply yang dihasilkan dari pencocokan string
 */
const generateReply = async (query) => {
  /* Fungsi formatting */
  const formatDate = (date) => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
  const format = (row) => `(ID: ${row['id']}) ${row['tipe']} - ${row['matkul']} - ${row['topik']} - ${formatDate(row['deadline'])}`
  if(BoyerMoore(query, 'help') !== -1){
    return {
      'body': '[Fitur]\n\
1. Menambahkan task baru\n\
2. Melihat daftar task\n\
3. Membarui task\n\
4. Menandai task selesai\n\
\n\
[Daftar Kata Penting]\n'+
      katapenting['alias'].reduce((acc, curr, i) => { acc[i] = `${i+1}. ${curr}`; return acc }, []).join('\n'),
      'reaction': 'talk'
    }
  }
  let topic = extractTopic(query);
  /* kata-kata penting */
  const tanya = katatanya['kata'].filter((kata) => BoyerMoore(query, kata) !== -1).length !== 0;
  const ubah = kataubah['kata'].filter((kata) => BoyerMoore(query, kata) !== -1).length !== 0;
  const selesai = kataselesai['kata'].filter((kata) => BoyerMoore(query, kata) !== -1).length !== 0;
  const adaKatapenting = katapenting['alias'].filter((kata) => BoyerMoore(query.toLowerCase(), kata) !== -1).length !== 0 ||
    query.match(/deadline/i) !== null || tanya || ubah || selesai;
  const matkul = extractKodeMatkul(query);
  if(!adaKatapenting) return {'body': 'Pesan tidak dikenali', 'reaction': 'confuse'};
  const date = extractDate(query);
  let type = extractType(query);

  if(tanya){
    const period = getTimePeriod(query, date);
    if(typeof period !== 'undefined'){
      if(type[0] === '[') type = 'DEADLINE';
      if(period?.length !== 2 && period?.length !== 0) return {'body': 'Tanggal kurang jelas', 'reaction': 'confuse'};
      let data;
      if(period?.length === 2){
        const low = period[0] < period[1] ? 0 : 1;
        data = await db.getDataFilter(period[low], period[1-low]);
      }
      else data = await db.getDataAll();

      data = data.filter((row) => row['sudah'] == 0 && row['deadline'] >= new Date(Date.now()).setHours(0,0,0,0));

      if(type !== 'DEADLINE') data = data.filter((row) => row['tipe'] === type);
      if(typeof matkul !== 'undefined') data = data.filter((row) => row['matkul'] === matkul);
      if(data.length === 0) return {'body': 'Tidak ada deadline~', 'reaction': 'talk'};

      if(type === 'DEADLINE'){
        return {
          'body': data.map((row) => format(row)).join('\n'),
          'reaction': 'talk'
        };
      }
      return {'body': data.map((row) => format(row)).join('\n'), 'reaction': 'talk'};
    }
    else if(typeof topic === 'undefined')
    {
      data = await db.getDataAll();
      data = data.filter((row) => row['sudah'] == 0 && row['deadline']>= new Date(Date.now()).setHours(0,0,0,0));
      if(type[0] === '[') type = 'DEADLINE';
      if(type !== 'DEADLINE') data = data.filter((row) => row['tipe'] === type);
      if(typeof matkul !== 'undefined') data = data.filter((row) => row['matkul'] === matkul);
      if(data.length === 0) return {'body': 'Tidak ada deadline~', 'reaction': 'talk'};
      return {'body': data.map((row) => format(row)).join('\n'), 'reaction': 'talk'};
    }
  }
  if(ubah || selesai){
    const id = query.match(/(id|task)\s+(\d+)/i)?.[2];
    if(typeof id === 'undefined') return {'body': 'ID tidak ketemu', 'reaction': 'confuse'};
    const dataall = await db.getDataAll();
    const row = dataall.filter((row) => row['id'] === id)[0]
    if(typeof row === 'undefined') return {'body': 'ID tidak ketemu', 'reaction': 'confuse'};
    if(ubah){
      if(isNaN(date[0])) return {'body': 'Tanggal tidak jelas', 'reaction': 'confuse'};
      row['deadline'] = date[0];
      await db.editRow(row);
      return {'body': `Berhasil mengubah deadline ${row['topik']} (ID: ${row['id']}) menjadi ${formatDate(date[0])}.`, 'reaction': 'talk'};
    }
    if(selesai){
      row['sudah'] = 1;
      await db.editRow(row);
      return {'body': `Hore, kamu menyelesaikan ${row['topik']} (ID: ${row['id']})!`, 'reaction': 'talk'};
    }
  }
  
  
  if(type[0]!="[")
  {
    if(date.length == 0)
    {
      return {'body': 'Tanggal tidak dikenali', 'reaction': 'confuse'};
    }
    else if(typeof matkul === 'undefined')
    {
      return {'body': 'Matkul tidak dikenali', 'reaction': 'confuse'};
    }
    const task = {
      'tipe': type,
      'topik': topic,
      'matkul': matkul,
      'deadline': date[0]
    };
    await db.addToDatabase(task);
    task['deadline'] = date[0];
    return {'body': "Berhasil mencatat task: \n" + format(task), 'reaction': 'talk'};
  }
  else
  {
    const sim = {word: '', percent: 1};
    query.split(' ').forEach((q) => {
      katapenting['alias'].forEach((word) => {
        const dist = LevenshteinDistance(q, word)/Math.max(q.length, word.length);
        if(sim.percent > dist){
          sim.word = word;
          sim.percent = dist;
        }
      });
    });
    if(sim.percent < 0.3) return {'body': `Mungkin anda bermaksud mengetik: ${sim.word}?`, 'reaction': 'confuse'};
    return {'body': "Perintah tidak dikenali", 'reaction': 'confuse'};
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

  const b = (x) => {  // border function
    let fail = []
    fail[0] = 0;
    let i = 1, j = 0;
    let m = pattern.length;
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

  let border = [];
  border = b(pattern);
  let i = 0, j = 0;

  while (i < n) {
      if (pattern.charAt(j) == string.charAt(i)) {
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
  const match = query.matchAll(/(?<d>\d{1,2})(\ |\/|-)(?<m>((jan(uari)?)|(feb(ruari)?)|(mar|maret)|(apr|april)|(mei)|(juni?)|(juli?)|(agu(stus)?)|(sep(tember)?)|(okt(ober)?)|(nov(ember)?)|(des(ember)?))|\d{1,2})(\ |\/|-)(?<y>\d{2,4})/gi);
  const dates = [...match].map((m) =>{
    m = m.groups;
    return new Date(m.y, month[m?.m?.toLowerCase().substring(0,3)] ?? m.m-1, m.d);
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
  re = `\\s*(${katapenting['alias'].join('|')})\\s*`
  tipe = new RegExp(re, 'ig').exec(query);
  if(tipe === null)
  {
    return "[Task type not detected]";
  }
  else if(typeof tipe?.[2] !== 'undefined'){
    return "[Detected tasks count is not one]";
  }
  else
  {
    return katapenting['tipe'][katapenting['alias'].indexOf(tipe[1]?.toLowerCase())] ?? '[Task type not detected]';
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
    const range = query.match(/(\d)+\s+(hari|minggu)\s+ke depan/i);
    let mult = 1, n = 0;
    const angka = range[0].match(/\d+/);
    const satuan = range[0].match(/minggu/i);
    if(typeof angka===null) return undefined;
    else n = angka[0]-0;
    if(typeof satuan===null) return undefined;
    else mult = satuan === null ? 1 : 7;
    const datetoday = getToday();
    return [
      new Date(datetoday.y, datetoday.m, datetoday.d),
      new Date(datetoday.y, datetoday.m, datetoday.d+(mult*n))
    ];
  }
  if(query.match(/semua/i) !== null) return [];
  return undefined;
}

module.exports = { generateReply, LevenshteinDistance };
