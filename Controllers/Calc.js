
const Circel = require("../Model/Circel");
const Action = require("../Model/Action");
const Point = require("../Model/Point");
const mongoose = require('mongoose');

const fileUtilit = require("../Files");
const fs = require("fs");
const Direction = require("../Model/Direction");
const { filter } = require("mongoose/lib/helpers/query/validOps");


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
                    var axisB = getCircelAxisB(circelDoc);
                    var axisC = getCircelAxisC(circelDoc);

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

const RemoveDuplicateDirectionDB = async (req, res, next) => {

    const duplicateArr = [];
    Direction.find({})
        .exec((err, docs) => {
            if (err) console.log(err);
            else {
                for (let i = 0; i < docs.length; i++) {
                    var DirectionObj = docs[i];

                    const duplicateDirections = docs.filter((s) => { return (s._id != DirectionObj._id && s.dirC.x === DirectionObj.dirC.x && s.dirC.y === DirectionObj.dirC.y && s.dirC.z === DirectionObj.dirC.z && s.dirB.x === DirectionObj.dirB.x && s.dirB.y === DirectionObj.dirB.y && s.dirB.z === DirectionObj.dirB.z) });
                    if (duplicateDirections.length > 0) {
                        duplicateDirections.forEach(d => {
                            duplicateArr.push(d._id);
                        });
                    }
                }

            }
        });

    removeArr(duplicateArr, (response) => {
        if (response == "Deleted") {
            res.status(200).send("ok");

        }
    });
}



function getCircelAxisB(circel) {

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

function getCircelAxisC(circel) {

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

//-------------------## Circels

//The function is reading the file and find& create his circels.
const ReadFile = async (req, res, next) => {
    const data = fs.readFileSync('Files/10015120.csv', "utf8").split("\r\n");
    const circelArr = [];
    var fileArr = data;
    for (let i = 0; i < fileArr.length; i++) {
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
        saveList(response);
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

            var circle = Circel({
                index: index,
                indexText: indexText,
                actionName: name.toString().replace(/[^\w\s]/gi, ''),
                radius: parseFloat(radius).toFixed(3),
                points: [],
            });

            //get the direction AXIS2_PLACEMENT_3D
            for (let i = 0; i < rowArr.length; i++) {
                if (rowArr[i].includes("#")) {
                    if (rowArr[i] != indexText) {
                        circle.relatedActionIndex.push(rowArr[i]);
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
                                circle.points.push(pointA);
                                circle.pointsA = pointA;
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

                                        circle.points.push(pointB);
                                        circle.pointsB = pointB;
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
                                                circle.points.push(pointC);
                                                circle.pointsC = pointC;
                                                pointsArr.push(pointC);

                                            }
                                            callback(circle);

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
function IsDirectionExist(DirectionObj, callback) {
    Direction.find({})
        .exec((err, docs) => {
            if (err) console.log(err);
            else {
                if (docs.length != undefined && docs.length > 1) {
                    //const samePoints = docs.filter((s) => { return (s.dirC.x === circelObj.pointsC.x && s.dirC.y === obj.pointsC.y && s.dirC.z === obj.pointsC.z && s.dirB.x === obj.pointsB.x && s.dirB.y === obj.pointsB.y && s.dirB.z === obj.pointsB.z) });
                    const samePoints = docs.filter((s) => {
                        return (s.dirC.x === DirectionObj.dirC.x && s.dirC.y === DirectionObj.dirC.y && s.dirC.z === DirectionObj.dirC.z && s.dirB.x === DirectionObj.dirB.x && s.dirB.y === DirectionObj.dirB.y && s.dirB.z === DirectionObj.dirB.z)
                    });
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
    callback(tempArr)

}
function RemoveDuplicatesDirections(arr, callback) {

    var tempArr = [];
    for (let i = 0; i < arr.length; i++) {

        var obj = arr.pop();
        IsDirectionExist(obj, (response) => {

            if (response === true) {
                console.log("Same Direction")
            }
            else {
                tempArr.push(obj);
            }
        })
    }
    callback(tempArr);
}


function RemoveDuplicatesDirections(arr, callback) {

    var newArr = [];
    var len = arr.length;
    for (let i = 0; i < len; i++) {

        var DirectionObj = arr.pop();
        const filtered = arr.filter((s) => { return !(s.dirC.x === DirectionObj.dirC.x && s.dirC.y === DirectionObj.dirC.y && s.dirC.z === DirectionObj.dirC.z && s.dirB.x === DirectionObj.dirB.x && s.dirB.y === DirectionObj.dirB.y && s.dirB.z === DirectionObj.dirB.z) });
        if (filtered.length > 0) {
            // arr.reduce
        }
        newArr.push(DirectionObj);
    }

}


// if (filtered.length > 0) {

//     tempArr.push(filtered[0]);
// }
// else {

//     tempArr.push(DirectionObj);

// }

// }

// callback(tempArr);
// }



module.exports = {
    ReadFile,
    CreateDirections,
    RemoveDuplicateDirectionDB
};
