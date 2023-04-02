//ORIGINAL FILE
function GetRow(fileArr, index, callback) {

    let trimIndex=String(index).trim();
    let indexstr=String(trimIndex).concat(' = ');
    let indexstrTrim=String(trimIndex).concat('=');
    let row=fileArr.filter(e=>e.includes(indexstr) || e.includes(indexstrTrim))[0];
    let trimRow=String(row).replace(/\s+/g, '');
    callback(trimRow);
}

// #89=AXIS2_PLACEMENT_3D('',#86,#87,#88);
function GetPointActions(fileArr, row, callback) {
    let arr=[];
    var trimRow=row.trim();
    var rowArray = trimRow.split(',');
    var action1=rowArray[1];
    var action2=rowArray[2];
    var action3=String(rowArray[3]).split(')')[0];
    arr.push(action1);
    arr.push(action2);
    arr.push(action3);

    callback(arr);
}

//#45=CARTESIAN_POINT('',(3.E0,1.E0,0.E0));
function GetPointValues(fileArr, index, callback) {
    
    GetRow(fileArr,index,(row)=>{
        var rowArray = row.split('=');
        var rightSide= String(rowArray[1]).split('(');
        var pointSide= String(rightSide[2]).split(')')[0].split(',');

            const obj=({
                x: Math.round(pointSide[0]),
                y: Math.round(pointSide[1]),
                z: Math.round(pointSide[2])
            });

    callback(obj);
    });
}

module.exports = {
    GetRow,
    GetPointActions,
    GetPointValues
};