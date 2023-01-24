

function GetRow(fileArr, index, callback) {
    for (let i = 0; i < fileArr.length; i++) {
        let rowArr = fileArr[i].split(" ");
        let rowIndex = rowArr[0].toString().replace(/[^\w\s]/gi, '');
        if (index == rowIndex) {
            callback(rowArr);
        }
    }
    callback(null);
}


exports = {
    GetRow,
}; 