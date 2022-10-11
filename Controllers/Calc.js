
const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const CoCircel = require("../Model/CoCircel");
var passCircelArr = [];


//(01)
async function GetCirclesArr(tableFile,pn){
    var circleArr=[];
    var dictionary =[];
    for (let i = 16; i < tableFile.length; i++) {
        var row = tableFile[i].split(" ");
        CreateNewCircel(row, tableFile, pn, (response) => {
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
                    console.log("## 01: Found key exsit in dictionary");
                }
            }
        });
    }
    console.log("## 01: Dictionary. len : "+ dictionary.length);
    return circleArr;
}

//(02)
async function GetCoCirclesArr(circleArr,pn){
    const completeCirclesArr=[];
    circleArr.map(async (circle)=>{
       const coCirc= await CreateCompleteCircel_AxisValues(circle);
       if(coCirc != null){
            coCirc.PN = pn;
            completeCirclesArr.push(coCirc);
        }
        // CreateCompleteCircel_AxisValues(circle, (coCirc) => {
        //     if(coCirc != null){
        //         coCirc.PN = pn;
        //         completeCirclesArr.push(coCirc);
        //     }
        // });
    })    
    console.log("## 02: completeCirclesArr len: " + completeCirclesArr.length);
    return completeCirclesArr;
}

//(01-1)
function CreateNewCircel(rowArr, fileArr,pn, callback) {
    try {
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
                                            callback(circel);

                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        }
        callback(null);
    } catch (err) {
        console.log(err);
    }
}

//(02-1)
async function CreateCompleteCircel_AxisValues(circelObj) {

    const docs = await Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }).exec();
    // Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }, function (err, docs) {
    //     if (err) {
    //         console.log("##------");
    //         console.log(err);
    //         callback(err);
    //     }
        // else {
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
                        radius: circelObj.radius,
                        RepreCount: newArr.length
                    });

                    newArr.forEach(element => {
                        passCircelArr.push(element._id.toString());
                    });

                    // console.log("coCircelArr Done");
                    // callback(coCirc);
                    return coCirc;
                }
                else {
                    // console.log("Empty");
                    //callback(null);
                    return null;
                }
            }
            else {
                //callback(null);
                // console.log("Already Exist");
                return null;
            }
        }
//     });
// }


//(Heplers)
function GetUniqKeyForCircle(circleObj){
    var str='r'+circleObj.radius+'x'+circleObj.pointsA.x+'y'+circleObj.pointsA.y+'z'+circleObj.pointsA.z+'x'+circleObj.pointsB.x+'y'+circleObj.pointsB.y+'z'+circleObj.pointsB.z+'x'+circleObj.pointsC.x+'y'+circleObj.pointsC.y+'z'+circleObj.pointsC.z;
    return str;

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
    ClearDB,
};








/*


//-------------------## CO-Circels Testing
const GetCoCircelsDataTest = async (req, res, next) => {
    var obj={
        number:0,
        countOf1:0,
        countOf2:0,
        countOf3:0,
        countOf4:0,
        countMore:0,
        sumCircRep:0,
    }

    CoCircel.find({})
        .exec((err, docs) => {
            if (err) {
                console.log(err);
                res.status(200).send('not ok');
            }
            else {
                obj.number=docs.length;
                for (let i = 0; i < docs.length; i++) {
                    var coCirc = docs[i];
                    if(coCirc.circels.length==1){
                        obj.countOf1++;
                    }
                    if(coCirc.circels.length==2){
                        obj.countOf2++;
                    }
                    if(coCirc.circels.length==3){
                        obj.countOf3++;
                    }
                    if(coCirc.circels.length==4){
                        obj.countOf4++;
                    }   
                    if(coCirc.circels.length>4){
                        obj.countMore++;
                    }
                    obj.sumCircRep+=coCirc.circels.length
                }
                res.status(200).send(obj);
            }
        });

}
//-------------------## CO-Circels

const CreateCoCircels = async (req, res, next) => {
    var indexCounter = 0;
    var circlesOfPart=[];
    // var coCircelsArr = [];
    var pn=req.pn;
   // var pn="DEMO";
    console.log("## Search for Co-cercles for part...."+ pn);
    circlesOfPart=await Circel.find({PN:pn});

    if(circlesOfPart.length<0){
        console.log("## No Circles for part"+pn);
        res('not ok');                
    }
    else{
    console.log("## Creating co-circle. serching for related circles rep..."+pn);
        for (let i = 0; i < circlesOfPart.length; i++) {
            var circ = circlesOfPart[i];
            await GetCoCircle(circ,indexCounter,pn,(coCircle)=>{
                console.log("## coCircle Back");
            });
            indexCounter++;  
    }
    res('ok');                
}
}
         
async function GetCoCircle(circle,indexCounter,pn,cb){
    CreateCompleteCircel_AxisValues(circle, (coCirc) => {
        console.log("## coCirc back!");
        if(coCirc!=null){
            console.log("##Co-circle not null");
        coCirc.index = indexCounter;
        coCirc.PN = pn;

        coCirc.save(function (err) {
            if (err) throw err;
            else {
                console.log("##Co-circle saved in DB ");
                cb(coCirc);
            }
            });
        coCircelsArr.push(coCirc);
        }
        else{
            console.log("##Co-circle Is Null");
            cb(null);
        }
    });
}

function CreateCompleteCircel_Radius(coCircel, callback) {


    var radius=coCircel.circels[0].radius;

    var originalArray=coCircel.circels;
    if(originalArray.length>1){
        var newArray = coCircel.circels.filter(function (el){
            return el.radius==radius
        });

        if(originalArray.length>newArray.length){


            var removalArray = originalArray.filter(function (el){
                return !newArray.includes(el);
            });
        }
        else{
            // console.log("No diffrent radius ?");
        }
    }   
    else{
        // console.log("1 item ?");
}
    callback('ok');

}

//-------------------## Directions

const CreateDirections = async (req, res, next) => {
    var counter = 0;
    var directionArr = [];
    Circel.find({})
        .exec((err, docs) => {
            if (err) console.log(err);
            else {
                for (let i = 0; i < docs.length; i++) {
                    var circelDoc = docs[i];
                    var axisB = GetCircelAxisB(circelDoc);
                    var axisC = GetCircelAxisC(circelDoc);

                    var direction = new Direction({
                        index: counter,
                        dirB: circelDoc.pointsB,
                        dirC: circelDoc.pointsC,
                        AxisB: axisB,
                        AxisC: axisC,
                        Circels: []
                    })
                    directionArr.push(direction);
                    counter++;
                }

                RemoveDuplicatesDirections(directionArr, (arr) => {
                    saveArr(arr);
                    res.status(200).send("ok");
                });
            }
        });



}

function RemoveDuplicatesDirections(arr, callback) {
    var newArr = arr;
    var len = arr.length;
    for (let i = 0; i < len; i++) {
        var directionObj = newArr[i];
        for (let j = 0; j < len; j++) {
            var tempDirectionObj = newArr[j];
            if (directionObj.index != tempDirectionObj.index && IsSamePoint(directionObj.dirB, tempDirectionObj.dirB) === true && IsSamePoint(directionObj.dirC, tempDirectionObj.dirC) === true) {
                newArr = newArr.slice(0, j).concat(newArr.slice(j + 1, newArr.length))
                len = newArr.length;
            }
        }
    }

    for (let i = 0; i < newArr.length; i++) {
        newArr[i].index = i;
    }

    callback(newArr);
}




function RemoveDuplicates(arr, callback) {

    var tempArr = [];
    for (let i = 0; i < arr.length; i++) {

        var obj = arr.pop();
        IsCircleExist(obj, (response) => {

            if (response === true) {
            }
            else {
                tempArr.push(obj);
            }
        })
    }

    for (let i = 0; i < tempArr.length; i++) {
        tempArr[i].index = i;
    }

    callback(tempArr)

}
function saveArr(objectArr) {

    if (objectArr.length > 0) {
        var obj = objectArr.pop();
        obj.save(function (err, saved) {
            if (err) throw err;
            if (objectArr.length > 0)
                saveArr(objectArr);
            else{
                console.log("## Arr is Saved in DB Sucssesfully");
            }
        });
    }
}

function IsSamePoint(obj1, obj2) {
    if (obj1.x === obj2.x) {
        if (obj1.y === obj2.y) {
            if (obj1.z === obj2.z) {
                return true;
            }
            else return false;
        }
        else return false;
    }
    else return false;
}
function IsCircleExist(obj, callback) {

    Circel.find({ radius: obj.radius })
        .exec((err, docs) => {
            if (err) console.log(err);
            else {
                if (docs.length != undefined && docs.length > 1) {
                    const samePoints = docs.filter((s) => { return (s.pointsA.x === obj.pointsA.x && s.pointsA.y === obj.pointsA.y && s.pointsA.z === obj.pointsA.z) });
                    if (samePoints.length > 0) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }
            }
        });
    callback(false);
}
//-------------------## Helpers

*/


/*

Run Script Order:

1) http://127.0.0.1:3000/Calc/GetCircels

for reading 1 step file and create cirecelsDB without duplicate lines 

2) http://127.0.0.1:3000/Calc/CreateCoCircels

for creating complete cirecle. grouping by same asix values ( PointsA) 

3) http://127.0.0.1:3000/Calc/CreateCoCircelsDB

create the complete circels arry to db

4) http://127.0.0.1:3000/Calc/GetCoCircelsDataTest

for testing the complete circels 

*/