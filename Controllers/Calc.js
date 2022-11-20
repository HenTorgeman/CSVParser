const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const CoCircel = require("../Model/CoCircel");
const Direction = require("../Model/Direction");
const Part = require("../Model/Part");
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
       const coCirc=await CreateCompleteCircel_AxisValues(c,pn);
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
                                                
                                                circel.PN=pn;
                                                circel.AxisB = GetCircelAxisB(circel);
                                                circel.AxisC = GetCircelAxisC(circel);
                                                circel.GenAxisB = GetGenCircelAxisB(circel);
                                                circel.GenAxisC = GetGenCircelAxisC(circel);

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
const CreateCompleteCircel_AxisValues=(circelObj,pn)=>
    new Promise(async resolve=>{

    // const docs =await Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }).exec();
    const docs =await Circel.find({ PN:pn,GenAxisB: circelObj.GenAxisB }).exec();
    
    if(docs.length==0) resolve(null);
    else{    
            var asix = circelObj.AxisB;
            var GenAxisB = circelObj.GenAxisB;
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
                   
                }
                else{
                    if (asix === "Y" || asix === "-Y") {
                        newArr = docs.filter(function (e) {
                            return e.pointsA.x === x && e.pointsA.z === z;
                        });
                    
                    }
                    else{
                        if (asix === "Z" || asix === "-Z") {
                            newArr = docs.filter(function (e) {
                                return e.pointsA.y === y && e.pointsA.x === x;
                            });
                           
                        }
                        else{
                            newArr = docs.filter(function (e) {
                                return e.radius==radius;
                            });
                        }
                    }
                }

                if (newArr.length > 0) {
                    let type=CalcCoCircleType(newArr);
                    let DirectionsAxis=CalcCoCircleDirection(newArr);
                    
                    var coCirc = new CoCircel({
                        circels: newArr,
                        AxisB: DirectionsAxis,
                        AxisC: circelObj.AxisC,
                        GenAxisB:circelObj.GenAxisB,
                        GenAxisC:circelObj.GenAxisC,
                        radius: circelObj.radius,
                        RepreCount: newArr.length,
                        type:type
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


//(03-1)

// const DeleteUnuseDirections=(partId)=>
// new Promise(async resolve =>{

//     //Create Directions/Feat map and check the alternative circel of coCircle.

//     const DicrectionFeat = new Map();
//     const part = await Part.find({id:partId}).exec();
//     const X=0;
//     const Y=0;
//     const Z=0;

//     const XpartFeats = await CoCircel.find({ PN:pn,GenAxisB:'X'}).exec();
//     const YpartFeats = await CoCircel.find({ PN:pn,GenAxisB:'Y'}).exec();
//     const ZpartFeats = await CoCircel.find({ PN:pn,GenAxisB:'Z'}).exec();

//     for(feat of XpartFeats){

//         let negative=0; let positive=0;


//     }

//     for(c of coCirclesArr){
//         var key=GetUniqKeyForDirection(c);
//         let valExist = direction.some(obj => obj==key);
//      if (valExist==false){
//         direction.push(key);       
//     }
// }
// resolve(direction);

// });


//(Heplers)
function GetUniqKeyForCircle(circleObj){
    var str='r'+circleObj.radius+'x'+circleObj.pointsA.x+'y'+circleObj.pointsA.y+'z'+circleObj.pointsA.z+'x'+circleObj.pointsB.x+'y'+circleObj.pointsB.y+'z'+circleObj.pointsB.z+'x'+circleObj.pointsC.x+'y'+circleObj.pointsC.y+'z'+circleObj.pointsC.z;
    return str;

}

function GetUniqKeyForDirection(coCirclesObj){
    return coCirclesObj.AxisB;
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
  
    if(axis==""){
        var x=circel.pointsB.x.toFixed(3);
        var y=circel.pointsB.y.toFixed(3);
        var z=circel.pointsB.z.toFixed(3);

        axis='| X '+x+' | Y '+y+' | Z '+z;
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
    if(axis==""){
        axis='D';
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
    if(axis == "") {
        axis = "D";
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
    if(axis=="") {
        axis =  "D";}
     
    return axis;

}

function CalcCoCircleType(circlesArr){
    let type="";
    if(circlesArr.length==2){ 
                    
        if(circlesArr[0].GenAxisC!=circlesArr[1].GenAxisC){
            type='RADIUS';
        }
        else{
            type='HOLE';
        }
    }
    if(circlesArr.length==3) type='PIN';
    if(circlesArr.length==4) type='CBOR';
    if(type=='') type='OTHER';

    return type;
}

function CalcCoCircleDirection(circlesArr){

    const allMap = new Map();
    let maxVal=0;
    let maxKey='';

    for(el of circlesArr){
        if(!allMap.has(el.AxisB)){
            allMap.set(el.AxisB,1);
        }
        else{
            let val=allMap.get(el.AxisB);
            allMap.delete(el.AxisB);
            allMap.set(el.AxisB,val+1);
        }
    }
    if(allMap.size>1){        
        for(el of allMap){
            if(el[1]>maxVal){
                maxVal=el[1];
                maxKey=el[0];
            }
        }    
    }
    const mapIter = allMap.entries();

    if(maxKey == '') maxKey=mapIter.next().value[0];
        
    if(maxKey==null) console.log("Null");
    return maxKey;

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