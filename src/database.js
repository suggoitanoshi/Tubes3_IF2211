const util = require('./util.js');
const path = require('path')

/**
 * Membaca database dan memberikan list task dalam database
 * @returns {[Object]} list task yang berhasil dibaca
 */
const getDataAll = () => {
  return util.parseCSV(path.join(__dirname, '../test/tasks.csv')).then((data) => {
    const byRow = [];
    const keys = Object.keys(data);
    data[keys[0]].forEach((_, i) => {
      byRow.push(keys.reduce((ax, cx) => { ax[cx] = cx !== 'deadline' ? data[cx][i] : new Date(data[cx][i]); return ax; }, {}));
    });
    return byRow;
  }).catch((err) => []);
}

/**
 * Membaca database, lalu mencari task yang berada dalam jangka waktu tertentu
 * @param {Date} from 
 * @param {Date} to 
 * @returns {[Object]} list task yang deadlinenya berada dalam range from..to
 */
const getDataFilter = (from, to) => {
  return getDataAll().then((byRow) => {
    return byRow.filter((row) => {
      return from <= row['deadline'] && row['deadline'] <= to
    });
  })
}

/**
 * Menambahkan data ke database
 * @param {[Object]} data task yang akan ditambahkan. Harus memiliki atribut `tipe`, `topik`, `matkul`, dan `deadline`.
 * @returns {Promise} promise dari menulis database
 */
const addToDatabase = (data) => {
  data['deadline'] = `${data['deadline'].getMonth()}/${data['deadline'].getDate()}/${data['deadline'].getFullYear()}`
  data['sudah'] = 0;
  const target = path.join(__dirname, '../test/tasks.csv');
  return getDataAll().then((dbdata) => {
    data['id'] = dbdata[dbdata.length-1]['id']-0+1;
    return util.writeCSV(target, data);
  })
  .catch((err) => {
    data['id'] = 1;
    return util.writeCSV(target, data);
  });
}

/**
 * Operasi untuk mengedit satu row pada database
 * @param {Object} row task yang akan diubah
 * @returns {Promise} promise dari menulis database
 */
const editRow = (row) => {
  return getDataAll().then((data) => {
    return util.rewriteCSV(path.join(__dirname, '../test/tasks.csv'),
      data.map((dbrow) => {
        if(dbrow.id === row.id){
          return row;
        }
        return dbrow;
      }).reduce((ax, cx) => {
        Object.keys(cx).forEach((key) => {
          if(typeof ax[key] === 'undefined') ax[key] = [];
          ax[key].push(cx[key]);
        });
        return ax;
      }, {})
    );
  });
}

module.exports = { getDataAll, getDataFilter, addToDatabase, editRow };