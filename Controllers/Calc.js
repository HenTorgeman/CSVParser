const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const CoCircel = require("../Model/CoCircel");
var passCircelArr = [];

//(01)
const GetCirclesArr=(tableFile,pn)=>
    new Promise(async resolve =>{
    var circleArr=[];
    var dictionary =[];

    for(el of tableFile){        
        var row = el.split(" ");

        const response= await CreateNewCircel(row, tableFile, pn);
            if (response != null) {
                   var key=GetUniqKeyForCircle(response);
                   let valExist = dictionary.some(obj => obj.key === key);
                if (valExist==false){
                    var dict={
                        key:key,
                        value:response
                    };
                    dictionary.push(dict);
                    response.key=key;
                    circleArr.push(response);
                }
                else{
                }
            }
    }
    resolve(circleArr);
});

//(02)
const GetCoCirclesArr=(circleArr,pn)=>
new Promise(async resolve =>{
    const completeCirclesArr=[];
    for(c of circleArr){
       const coCirc=await CreateCompleteCircel_AxisValues(c);
       if(coCirc != null){
            coCirc.PN = pn;
            completeCirclesArr.push(coCirc);
        }
    }
    resolve(completeCirclesArr);
});

//(01-1)
const CreateNewCircel=(rowArr, fileArr,pn)=>
    new Promise(resolve=>{
    
        if (rowArr[2] === "CIRCLE") {
            var indexText = rowArr[0];
            var index = indexText.toString().replace(/[^\w\s]/gi, '');
            var radius = rowArr[6];
            var name = rowArr[2];
            var axisIndex = 0;
            const pointsArr = [];

            var circel = Circel({
                index: index,
                indexText: indexText,
                actionName: name.toString().replace(/[^\w\s]/gi, ''),
                radius: parseFloat(radius).toFixed(2),
            });

            //get the direction AXIS2_PLACEMENT_3D
            for (let i = 0; i < rowArr.length; i++) {
                if (rowArr[i].includes("#")) {
                    if (rowArr[i] != indexText) {
                        circel.relatedActionIndex.push(rowArr[i]);
                        axisIndex = rowArr[i].toString().replace(/[^\w\s]/gi, '');
                    }
                }
            }

            //get 1 CARTESIAN_POINT and 2 DIRECTIONS
            fileUtilit.GetRow(fileArr, axisIndex, (dataAxis) => {
                if (dataAxis != null) {
                    var cp1 = dataAxis[5].toString().replace(/[^\w\s]/gi, '');
                    var cp2 = dataAxis[6].toString().replace(/[^\w\s]/gi, '');
                    var cp3 = dataAxis[7].toString().replace(/[^\w\s]/gi, '');

                    fileUtilit.GetRow(fileArr, cp1, (dataA) => {
                        if (dataA != null) {
                            let pointRowArr = dataA;
                            let indexText = pointRowArr[0];
                            let index = pointRowArr[0].toString().replace(/[^\w\s]/gi, '');
                            let name = pointRowArr[2];

                            if (name == "CARTESIAN_POINT" || name == "DIRECTION") {
                                let x = parseFloat(pointRowArr[7]);
                                let y = parseFloat(pointRowArr[8]);
                                let z = parseFloat(pointRowArr[9]);
                                const pointA = Point({
                                    index: index,
                                    indexText: indexText,
                                    actionName: name,
                                    x: parseFloat(x).toFixed(3),
                                    y: parseFloat(y).toFixed(3),
                                    z: parseFloat(z).toFixed(3),
                                });
                                circel.pointsA = pointA;
                                pointsArr.push(pointA);
                            }
                            fileUtilit.GetRow(fileArr, cp2, (dataB) => {
                                if (dataB != null) {
                                    let pointRowArr = dataB;
                                    let indexText = pointRowArr[0];
                                    let index = pointRowArr[0].toString().replace(/[^\w\s]/gi, '');
                                    let name = pointRowArr[2];

                                    if (name == "CARTESIAN_POINT" || name == "DIRECTION") {
                                        let x = parseFloat(pointRowArr[7]);
                                        let y = parseFloat(pointRowArr[8]);
                                        let z = parseFloat(pointRowArr[9]);
                                        const pointB = Point({
                                            index: index,
                                            indexText: indexText,
                                            actionName: name,
                                            x: x,
                                            y: y,
                                            z: z
                                        });

                                        circel.pointsB = pointB;
                                        pointsArr.push(pointB);


                                    }

                                    fileUtilit.GetRow(fileArr, cp3, (dataC) => {
                                        if (dataC != null) {
                                            let pointRowArr = dataC;
                                            let indexText = pointRowArr[0];
                                            let index = pointRowArr[0].toString().replace(/[^\w\s]/gi, '');
                                            let name = pointRowArr[2];

                                            if (name == "CARTESIAN_POINT" || name == "DIRECTION") {
                                                let x = parseFloat(pointRowArr[7]);
                                                let y = parseFloat(pointRowArr[8]);
                                                let z = parseFloat(pointRowArr[9]);
                                                const pointC = Point({
                                                    index: index,
                                                    indexText: indexText,
                                                    actionName: name,
                                                    x: x,
                                                    y: y,
                                                    z: z
                                                });
                                                circel.pointsC = pointC;
                                                pointsArr.push(pointC);

                                                circel.AxisB = GetCircelAxisB(circel);
                                                circel.AxisC = GetCircelAxisC(circel);
                                                circel.GenAxisB = GetGenCircelAxisB(circel);
                                                circel.GenAxisC = GetGenCircelAxisC(circel);
                                                circel.PN=pn;
                                                

                                            }
                                            resolve(circel);

                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        }
        resolve(null)
});

//(02-1)
const CreateCompleteCircel_AxisValues=(circelObj)=>
    new Promise(async resolve=>{

    const docs =await Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }).exec();
    
    if(docs.length==0) resolve(null);
    else{    
            var asix = circelObj.AxisB;
            var y = circelObj.pointsA.y;
            var x = circelObj.pointsA.x;

            var z = circelObj.pointsA.z;
            var id = circelObj._id.toString();
            var radius = circelObj.radius;
            var newArr = [];

            if (!passCircelArr.includes(id)) {

                if (asix === "X" || asix === "-X") {
                    newArr = docs.filter(function (e) {
                        return e.pointsA.y === y && e.pointsA.z === z;
                    });
                    if (newArr.length > 3) {
                        var newArrRadius = newArr.filter(function (e) {
                            return e.radius == radius;
                        });
                        if (newArrRadius.length > 1) {
                            newArr = newArrRadius;
                        }
                    }
                }
                if (asix === "Y" || asix === "-Y") {
                    newArr = docs.filter(function (e) {
                        return e.pointsA.x === x && e.pointsA.z === z;
                    });
                    if (newArr.length > 3) {
                        var newArrRadius = newArr.filter(function (e) {
                            return e.radius == radius;
                        });
                        if (newArrRadius.length > 1) {
                            newArr = newArrRadius;
                        }
                    }
                }
                if (asix === "Z" || asix === "-Z") {
                    newArr = docs.filter(function (e) {
                        return e.pointsA.y === y && e.pointsA.x === x;
                    });
                    if (newArr.length > 3) {
                        var newArrRadius = newArr.filter(function (e) {
                            return e.radius == radius;
                        });
                        if (newArrRadius.length > 1) {
                            newArr = newArrRadius;
                        }
                    }
                }

                if (newArr.length > 0) {

                    var coCirc = new CoCircel({
                        circels: newArr,
                        AxisB: circelObj.AxisB,
                        AxisC: circelObj.AxisC,
                        GenAxisB:circelObj.GenAxisB,
                        GenAxisC:circelObj.GenAxisC,
                        radius: circelObj.radius,
                        RepreCount: newArr.length
                    });

                    newArr.forEach(element => {
                        passCircelArr.push(element._id.toString());
                    });

                    resolve(coCirc);
                }
                else {
                 
                     resolve(null);
                }
            }
            else {
                resolve(null);
            }
        }
});


//(03-1)
const GetMSPart=(coCirclesArr,pn)=>
new Promise(async resolve =>{
    let direction=[];
    for(c of coCirclesArr){
        var key=GetUniqKeyForDirection(c);
        let valExist = direction.some(obj => obj==key);
     if (valExist==false){
        direction.push(key);       
    }
}
resolve(direction);

});

//(Heplers)
function GetUniqKeyForCircle(circleObj){
    var str='r'+circleObj.radius+'x'+circleObj.pointsA.x+'y'+circleObj.pointsA.y+'z'+circleObj.pointsA.z+'x'+circleObj.pointsB.x+'y'+circleObj.pointsB.y+'z'+circleObj.pointsB.z+'x'+circleObj.pointsC.x+'y'+circleObj.pointsC.y+'z'+circleObj.pointsC.z;
    return str;

}

function GetUniqKeyForDirection(coCirclesObj){
     return coCirclesObj.GenAxisB +"-"+coCirclesObj.GenAxisC;



}
function GetCircelAxisB(circel) {
    var axis = "";
    if (circel.pointsB.x == 1) {
        axis = "X";
    }
    else {
        if (circel.pointsB.x == -1) {
            axis = "-X";
        }
        else {
            if (circel.pointsB.y == 1) {
                axis = "Y";
            }
            else {
                if (circel.pointsB.y == -1) {
                    axis = "-Y";

                }
                else {
                    if (circel.pointsB.z == 1) {
                        axis = "Z";
                    }
                    else {
                        if (circel.pointsB.z == -1) {
                            axis = "-Z";

                        }

                    }
                }
            }
        }
    }
    return axis;

}
function GetCircelAxisC(circel) {


    var axis = "";
    if (circel.pointsC.x == 1) {
        axis = "X";
    }
    else {
        if (circel.pointsC.x == -1) {
            axis = "-X";
        }
        else {
            if (circel.pointsC.y == 1) {
                axis = "Y";
            }
            else {
                if (circel.pointsC.y == -1) {
                    axis = "-Y";

                }
                else {
                    if (circel.pointsC.z == 1) {
                        axis = "Z";
                    }
                    else {
                        if (circel.pointsC.z == -1) {
                            axis = "-Z";

                        }

                    }
                }
            }
        }
    }
    return axis;

}
function GetGenCircelAxisB(circel) {
    var axis = "";
    if (circel.pointsB.x == 1 || circel.pointsB.x == -1) {
        axis = "X";
    }
    else {
        if (circel.pointsB.y == 1 || circel.pointsB.y == -1) {
            axis = "Y";
        }
        else {
            if (circel.pointsB.z == 1 || circel.pointsB.z == -1) {
                axis = "Z";
            }
        }
    }
    return axis;

}
function GetGenCircelAxisC(circel) {
    var axis = "";
    if (circel.pointsC.x == 1 || circel.pointsC.x == -1) {
        axis = "X";
    }
    else {
        if (circel.pointsC.y == 1 || circel.pointsC.y == -1) {
            axis = "Y";
        }
        else {
            if (circel.pointsC.z == 1 || circel.pointsC.z == -1) {
                axis = "Z";
            }
        }
    }
    return axis;

}

//-------------------## DB
const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    res.status(200).send("ok");
}
module.exports = {
    GetCirclesArr,
    GetCoCirclesArr,
    GetMSPart,
    ClearDB,
};