const fs = require('fs/promises')

const parseCSV = (filename, opts, resolve, reject) => {
  const useHeader = opts?.useHeader ?? true;
  const sep = opts?.separator ?? ',';
  const regexp = RegExp(`${sep}\\ +`);
  return new Promise((resolve, reject) => {
    fs.readFile(filename).then((content)=>{
      const headers = [];
      const csvcontent = {};
      content.toString()
             .replaceAll('\r', '')
             .split('\n')
             .forEach((line, i) => {
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

module.exports = { parseCSV };