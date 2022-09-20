const http = require('http');
const express = require("express");
const fs = require("fs");
const rl = require("readline");
const Utilis = require("./Parser");
const Action = require("./Model/Action");
const Circel = require("./Model/Circel");
const Point = require("./Model/Point");
const CircelsGroup = require('./Model/CircelsGroup');

const DirectionPoint = require('./Model/DirectionPoint');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/parserDB';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", () => console.log("Connected to mongo"));

/*

Explain:
1) find all circle 
2) create circle entitys 
3) then - create circle groups
*/
// const data = fs.readFileSync('Files/DEMO1.csv', "utf8").split("\r\n");
const data = fs.readFileSync('Files/10015120.csv', "utf8").split("\r\n");

// CreateCircleDB(data).then(GetUniqCircles());

// CreateCircleDB()
//     .then(res1 => {
//         RemoveDuplicateCircels().then(res2 => {
//             CreateDirections();
//             console.log("Done");
//         }).catch(res2 => console.log('Error: ' + res2))
//         // GetUniqCircles();
//     })
//     .catch(res1 => console.log('Error: ' + res1))


CreateCircleDB()
    .then(res1 => {
        CreateDirections();
        console.log("Done");
        // GetUniqCircles();
    })
    .catch(res1 => console.log('Error: ' + res1))


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening at http://${hostname}:${port}/`))

function CreateCircleDB() {
    return new Promise((resolve, reject) => {
        try {
            const fileArr = data;
            for (let i = 0; i < fileArr.length; i++) {
                var rowArr = fileArr[i].split(" ");
                if (rowArr[2] === "CIRCLE") {
                    var indexText = rowArr[0];
                    var index = indexText.toString().replace(/[^\w\s]/gi, '');
                    var radius = rowArr[6];
                    var name = rowArr[2];
                    var axisIndex = 0;
                    const pointsArr = [];

                    const circle = Circel({
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
                    GetRow(fileArr, axisIndex, (dataAxis) => {
                        if (dataAxis != null) {
                            var cp1 = dataAxis[5].toString().replace(/[^\w\s]/gi, '');
                            var cp2 = dataAxis[6].toString().replace(/[^\w\s]/gi, '');
                            var cp3 = dataAxis[7].toString().replace(/[^\w\s]/gi, '');

                            GetRow(fileArr, cp1, (dataA) => {
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
                                }
                            });

                            GetRow(fileArr, cp2, (dataB) => {
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
                                }
                            });

                            GetRow(fileArr, cp3, (dataC) => {
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
                                }
                            });


                            IsCircleExist(circle, (flag) => {
                                if (flag == 0) {
                                    circle.save((error, obj) => {
                                        if (error) {
                                            console.log('error circle.save');
                                            console.log(error);
                                        } else {
                                            console.log('Saved : circle.save');
                                            console.log(obj._id);
                                        }
                                    });
                                }
                                else {
                                    console.log("NotSaved : Circle already exist!")
                                }

                            });


                        }
                    });




                }
            }
            resolve("OK");
        }
        catch (error) {
            reject(error);
        }
    });
}

// function RemoveDuplicateCircels() {
//     return new Promise((resolve, reject) => {
//         try {
//             Circel.find({})
//                 .exec((err, circelsDB) => {
//                     if (!err) {
//                         let length = circelsDB.length;
//                         for (let i = 0; i < length; i++) {
//                             var temp = circelsDB[i];
//                             IsCircleExist(temp, (flag) => {
//                                 console.log("Remove loop index i : " + i);
//                                 if (flag === true) {
//                                     Circel.findByIdAndRemove(temp._id).exec();
//                                     console.log('Circel Removed: ' + temp._id);
//                                 }

//                             });
//                         }
//                     }
//                 });
//             resolve("OK");
//         }
//         catch (error) {
//             reject(error);
//         }
//     });
// }

function CreateDirections() {

    Circel.find({})
        .exec((err, circelsDB) => {
            if (!err) {

                for (let i = 0; i < circelsDB.length; i++) {
                    var temp = circelsDB[i];
                    IsDirectionExist(temp, (flag) => {
                        if (flag === false) {

                            const dir = DirectionPoint({
                                dirB: temp.pointsB,
                                dirC: temp.pointsC,
                            });

                            dir.save((error, obj) => {
                                if (error) {
                                    console.log('error dir.save');
                                    console.log(error);
                                } else {
                                    console.log('dir.save');
                                    console.log(obj._id);
                                }

                            });
                        }
                        else {
                            console.log('Dir Exsit');

                        }
                    });
                }
            }
        });

}

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

// function IsEqualCircleObj(me, other, callback) {

//     if (me.radius == other.radius)
//         if (me.pointsA.x == other.pointsA.x && me.pointsA.y == other.pointsA.y && me.pointsA.z == other.pointsA.z) {
//             if (me.pointsB.x == other.pointsB.x && me.pointsB.y == other.pointsB.y && me.pointsB.z == other.pointsB.z) {
//                 if (me.pointsC.x == other.pointsC.x && me.pointsC.y == other.pointsC.y && me.pointsC.z == other.pointsC.z) {
//                     callback(true);
//                 }
//             }
//         }
//     callback(false);
// }

function IsCircleExist(temp, callback) {

    // // var flag = false;
    // const sameRadius = Circel.find({ radius: temp.radius });
    // if (sameRadius.length != undefined) {
    //     console.log("sameRadius.length");
    //     console.log(sameRadius.length);

    //     const sameX = sameRadius.filter((s) => { return s.pointsA.x === temp.pointsA.x });
    //     console.log("sameX.length");
    //     console.log(sameX.length);
    //     const sameY = sameX.filter((s) => { return s.pointsA.y === temp.pointsA.y });
    //     console.log("sameY.length");
    //     console.log(sameY.length);

    //     callback(sameY.length);

    // }
    // else {
    //     callback(0);

    // }


    Circel.find({ radius: temp.radius })
        .exec((err, sameRadius) => {
            if (!err) {

                if (sameRadius.length != undefined) {
                    sameRadius.filterAsync(async (s) => {
                        return new Promise(res => {
                            setTimeout(() => {
                                res(s.pointsA.x === temp.pointsA.x && s.pointsA.y === temp.pointsA.y && s.pointsA.z === temp.pointsA.z && s._id != temp._id);
                            }, 1);
                        });
                    }).then(result => {
                        console.log("sameXYZ.length");
                        console.log(result.length);
                        callback(result.length);
                    });
                }
                else {
                    callback(0);
                }
            }
        });


    // if (sameRadius) {
    //     for (let i = 0; i < sameRadius.length; i++) {
    //         // IsEqualCircleObj(temp, sameRadius[i], (res) => {
    //         //     if (res === true && temp._id !== sameRadius[i]._id) {
    //         //         flag = true;
    //         //     }
    //         // });
    //         var me = temp;
    //         var other = sameRadius[i];
    //         if (me.pointsA.x == other.pointsA.x && me.pointsA.y == other.pointsA.y && me.pointsA.z == other.pointsA.z) {
    //             if (me.pointsB.x == other.pointsB.x && me.pointsB.y == other.pointsB.y && me.pointsB.z == other.pointsB.z) {
    //                 if (me.pointsC.x == other.pointsC.x && me.pointsC.y == other.pointsC.y && me.pointsC.z == other.pointsC.z) {
    //                     flag = true;
    //                 }
    //             }
    //         }


    //     }
}





// var flag = false;
// Circel.find({ radius: temp.radius })
//     .exec((err, sameRadius) => {
//         if (!err) {
//             for (let i = 0; i < sameRadius.length; i++) {
//                 // IsEqualCircleObj(temp, sameRadius[i], (res) => {
//                 //     if (res === true && temp._id !== sameRadius[i]._id) {
//                 //         flag = true;
//                 //     }
//                 // });
//                 var me = temp;
//                 var other = sameRadius[i];
//                 if (me.pointsA.x == other.pointsA.x && me.pointsA.y == other.pointsA.y && me.pointsA.z == other.pointsA.z) {
//                     if (me.pointsB.x == other.pointsB.x && me.pointsB.y == other.pointsB.y && me.pointsB.z == other.pointsB.z) {
//                         if (me.pointsC.x == other.pointsC.x && me.pointsC.y == other.pointsC.y && me.pointsC.z == other.pointsC.z) {
//                             flag = true;
//                         }
//                     }
//                 }


//             }
//         }
//     });
// callback(flag);

function IsEqualPoint(pointA, pointB, callback) {
    if (pointA.x === pointB.x && pointA.y === pointB.y && pointA.z === pointB.z)
        return callback(true);
    else callback(false);
}

function GetUniqCircles() {

    // in all cir4cles in db serch for :
    //same radius as current
    //same X \ same Y \ Same Z
    var groupIndex = 0;
    var radiusLists = [];

    Circel.find()
        .exec((err, circlesDB) => {
            if (!err) {
                var tempCircleDB = circlesDB;
                console.log("------------First tempCircleDB------------");
                console.log(tempCircleDB.length);

                for (let i = 0; i < tempCircleDB.length; i++) {
                    let circle_ = tempCircleDB.at(i);
                    let radius_ = circle_.radius;
                    if (!radiusLists.includes(radius_)) {
                        radiusLists.push(radius_);
                        let x_ = circle_.pointsA.x;
                        let y_ = circle_.pointsA.y;
                        let z_ = circle_.pointsA.z;

                        Circel.find({ radius: radius_ }).exec((err, cireclesSameRadius) => {
                            if (!err) {

                                if (cireclesSameRadius != undefined) {
                                    var group = CircelsGroup({
                                        index: groupIndex,
                                        radius: radius_,
                                        circles: cireclesSameRadius,
                                    });

                                    tempCircleDB = tempCircleDB.filter(item => cireclesSameRadius.includes(item));
                                    console.log("------------tempCircleDB------------");
                                    console.log(tempCircleDB.length);
                                    group.save((error, obj) => {
                                        if (!error) {
                                            console.log("1 GROUP CREATED :" + obj._id);
                                        }
                                    });
                                    //if circles.length>4 - special
                                    //if circles.length==2 - radius
                                    //if circles.length==4 - hole
                                }
                            }
                        });
                        groupIndex++;

                    }
                }
            }
        });
}

function IsDirectionExist(circle, callbackMain) {
    DirectionPoint.find({})
        .exec((err, dirctionsDB) => {
            if (!err) {
                for (let i = 0; i < dirctionsDB.length; i++) {
                    IsEqualPoint(circle.pointsB, dirctionsDB[i].dirB, (flagB) => {
                        if (flagB === true) {
                            IsEqualPoint(circle.pointsC, dirctionsDB[i].dirC, (flagC) => {
                                if (flagC === true) {
                                    callbackMain(true);
                                }
                            });
                        }
                    });
                }
            }
        });
    callbackMain(false);

}


