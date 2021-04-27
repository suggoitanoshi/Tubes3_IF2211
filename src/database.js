const util = require('./util.js');

const getDataAll = () => {
  return util.parseCSV('../data/tasks.csv').then((data) => {
    const byRow = [];
    const keys = Object.keys(data);
    data[keys[0]].forEach((_, i) => {
      byRow.push(keys.reduce((ax, cx) => { ax[cx] = data[cx][i]; return ax; }, {}));
    });
    return byRow;
  });
}

const getDataFilter = (from, to) => {
  return getDataAll().then((byRow) => {
    return byRow.filter((row) => {
      from < row['deadline'] && row['deadline'] < to
    });
  })
}
const addToDatabase = (data) => {
  util.writeCSV('../data/tasks.csv', data);
}

module.exports = { getDataAll,getDataFilter, addToDatabase };