const util = require('./util.js');
const path = require('path')

const getDataAll = () => {
  return util.parseCSV(path.join(__dirname, '../data/tasks.csv')).then((data) => {
    const byRow = [];
    const keys = Object.keys(data);
    data[keys[0]].forEach((_, i) => {
      byRow.push(keys.reduce((ax, cx) => { ax[cx] = cx !== 'deadline' ? data[cx][i] : new Date(data[cx][i]); return ax; }, {}));
    });
    return byRow;
  });
}

const getDataFilter = (from, to) => {
  return getDataAll().then((byRow) => {
    return byRow.filter((row) => {
      return from <= row['deadline'] && row['deadline'] <= to
    });
  })
}
const addToDatabase = (data) => {
  data['deadline'] = `${data['deadline'].getMonth()}/${data['deadline'].getDate()}/${data['deadline'].getFullYear()}`
  data['sudah'] = 0;
  const target = path.join(__dirname, '../data/tasks.csv');
  return getDataAll().then((dbdata) => {
    data['id'] = dbdata[dbdata.length-1]['id']-0+1;
    return util.writeCSV(target, data);
  })
  .catch((err) => {
    data['id'] = 1;
    return util.writeCSV(target, data);
  });
}

module.exports = { getDataAll,getDataFilter, addToDatabase };