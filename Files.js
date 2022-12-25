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

function GetPoint(fileArr, index, callback) {

    let currentLable="";
    let row;

    let filteredArr=fileArr.filter(e=>{
        let r=e.split(" ");
        return r[0].toString().replace(/[^\w\s]/gi, '')===index;
    });

    if(filteredArr.length==1){
        do {
            row=filteredArr[0].split();

        } while (condition);

    }
    callback(null);
}



module.exports = {
    GetRow,
    GetPoint
};