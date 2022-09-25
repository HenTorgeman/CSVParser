
const Circel = require("../Model/Circel");
const Action = require("../Model/Action");
const Point = require("../Model/Point");
const mongoose = require('mongoose');

const fileUtilit = require("../Files");
const fs = require("fs");
const Direction = require("../Model/Direction");
const { filter } = require("mongoose/lib/helpers/query/validOps");
const CoCircel = require("../Model/CoCircel");

const cirecelRepresentIdArr = [];
// const filePath = "Files/DEMO.csv";
const filePath = "Files/1001570.csv";
// const filePath = "Files/10015120.csv";



//-------------------## CO-Circels

// const CreateCoCircels = async (req, res, next) => {
//     const coCircelsArr = [];
//     const passCircelArr = [];
//     Circel.find({})
//         .exec((err, docs) => {
//             if (err) console.log(err);
//             else {
//                 for (let i = 0; i < docs.length; i++) {
//                     var circ = docs[i];
//                     FindCompleteCircel(circ, (arr) => {
//                         passCircelArr.concat(arr);

//                         var coCirc = new CoCircel(){

//                             circels = arr,




//                         }



//                     })




//                 }
//             }
//         });
// }

// function FindCompleteCircel(circelObj, callback) {

//     var coCircelArr = [];
//     Circel.find({ AxisC: circelObj.axisC }, function (err, docs) {
//         if (err) callback(err);
//         else {

//             for (let i = 0; i < docs.length; i++) {
//                 var otherCirecel = docs[i];
//                 if (axisC == "X") {
//                     if (otherCirecel.y === circelObj.y && otherCirecel.z === circelObj.z) {
//                         coCircelArr.push(otherCirecel);
//                     }
//                 }
//                 else {
//                     if (axisC == "Y") {
//                         if (otherCirecel.x === circelObj.x && otherCirecel.z === circelObj.z) {
//                             coCircelArr.push(otherCirecel);
//                         }
//                     }
//                     else {
//                         if (axisC == "Z") {
//                             if (otherCirecel.x === circelObj.x && otherCirecel.y === circelObj.y) {
//                                 coCircelArr.push(otherCirecel);
//                             }

//                         }
//                     }
//                 }
//             }

//             console.log("coCircelArr Done");
//             console.log(coCircelArr);
//             callback(coCircelArr);
//         }
//     });


//     //Need to find the related circels and removed them from the tempArr
//     //Need to return list of circels Id? 



// }


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
                })

            }
        });



}
function GetCircelAxisB(circel) {

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
function GetCircelAxisC(circel) {

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

//-------------------## Circels

//The function is reading the file and find& create his circels.
const GetCircels = async (req, res, next) => {
    const data = fs.readFileSync(filePath, "utf8").split("\r\n");
    const circelArr = [];
    var fileArr = data;
    for (let i = 16; i < fileArr.length; i++) {
        var row = fileArr[i].split(" ");
        console.log("R" + row[0]);
        CreateNewCircel(row, fileArr, (response) => {
            if (response != null) {
                circelArr.push(response);
            }
        });
    }

    RemoveDuplicates(circelArr, (response) => {

        console.log("Response from RemoveDuplicates : " + response.length);
        saveArr(response);
        res.status(200).send("ok");
    });

}
function CreateNewCircel(rowArr, fileArr, callback) {
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


//-------------------## Helpers
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
function saveArr(objectArr) {

    if (objectArr.length > 0) {
        var obj = objectArr.pop();
        obj.save(function (err, saved) {
            if (err) throw err;
            else {

                console.log("Saved " + saved._id);
            }

            if (objectArr.length > 0)
                saveArr(objectArr);
            else
                console.log("Done save");
        });
    }
}
function IsCircleExist(obj, callback) {

    Circel.find({ radius: obj.radius })
        .exec((err, docs) => {
            if (err) console.log(err);
            else {
                console.log("docs Same radius" + docs.length);
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
function removeArr(objectArr, callback) {

    if (objectArr.length > 0) {
        for (let i = 0; i < objectArr.length; i++) {
            Direction.deleteOne({ id: objectArr[i] }, function (err) {
                if (err)
                    console.log("err" + err.message);
                else {
                    console.log("Deleted");

                }
                // deleted at most one tank document
            });
        }
        callback("Deleted");
    }
}


module.exports = {
    GetCircels,
    CreateDirections,
};
