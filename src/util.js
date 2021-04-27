const fs = require('fs/promises')

/**
 * Membaca file csv, lalu mengembalikan object hasil parsing
 * @param {string} filename nama file csv yang akan dibaca
 * @param {Object} opts options yang diberikan
 * @returns {Promise} Promise yang akan mengembalikan hasil parse
 */
const parseCSV = (filename, opts) => {
  const useHeader = opts?.useHeader ?? true;
  const sep = opts?.separator ?? ',';
  const regexp = RegExp(`${sep}\\ *`);
  return new Promise((resolve, reject) => {
    fs.readFile(filename).then((content)=>{
      const headers = [];
      const csvcontent = {};
      content.toString()
             .replaceAll('\r', '')
             .split('\n')
             .forEach((line, i) => {
               if(line == '') return;
               const entry = line.split(regexp);
               if(useHeader){
                 if(i == 0) entry.forEach((e) => {
                   headers.push(e);
                   csvcontent[e] = [];
                 });
                 else entry.forEach((e, i) => {
                   csvcontent[headers[i]].push(e);
                 });
               }
               else{
                 entry.forEach((e, i) => {
                   if(typeof csvcontent[i] === 'undefined'){
                     csvcontent[i] = [];
                   }
                   csvcontent[i].push(e);
                 })
               }
             });
      resolve(csvcontent);
    }).catch((err) => reject(err));
  });
}

/**
 * Menuliskan data baris tambahan ke csv
 * @param {string} filename nama file csv yang akan dituliskan
 * @param {Object} cols Kolom-kolom bernama yang akan ditulis, seperti `{'namakolom': 'isikolom'}`
 * @param {Object} opts options yang diberikan
 */
const writeCSV = (filename, cols, opts) => {
  const useHeader = opts?.useHeader ?? true;
  let header = [];
  const writeRow = () => {
    fs.appendFile(filename, header.reduce((ax, cx, ci) => { ax[ci] = cols[cx]; return ax; }, []).join(',')+"\n");
  }
  if(useHeader){
    parseCSV(filename, opts).then((data) => {
      Object.keys(data).forEach((k) => header.push(k));
      writeRow();
    }).catch((err) => {
      Object.keys(cols).forEach((k) => header.push(k));
      fs.writeFile(filename, header.join(',')+"\n");
      writeRow();
    });
  }
  else{
    for(let i = 0; i < cols.length; i++){
      header[i] = i;
    }
    writeRow();
  }
}

module.exports = { parseCSV, writeCSV };