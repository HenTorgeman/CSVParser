const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
const Part = require("../Model/Part");
const { off } = require("../Model/Part");
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
const GetFeatArr=(circleArr,pn)=>
new Promise(async resolve =>{
    const completeCirclesArr=[];
    for(c of circleArr){
       const coCirc=await CreateFeat(c,pn);

       if(coCirc != null){
            coCirc.PN = pn;
            completeCirclesArr.push(coCirc);
        }
    }
    resolve(completeCirclesArr);
});

//(03)
const GetDirectionsArr=(faetArr,pn)=>
new Promise(async resolve =>{
    const Directions=[];
    const DirectionsString=["X","-X","Z","-Z","Y","-Y"];
    let FeatList= faetArr;
    for(s of DirectionsString){
        let directionObj=await CreateDirectionObject(s,pn);
        Directions.push(directionObj);
        let filltered = FeatList.filter((item) => item.AxisB != s);
        FeatList = filltered;
    }

    if(FeatList.length>0){
    
        for(f of FeatList){
            let directionObj=await CreateDirectionObject(f.AxisB,pn);
            Directions.push(directionObj);
            let filltered= FeatList.filter((item) => item.AxisB != f.AxisB);
            FeatList=filltered;
        }
    }
    if(FeatList.length!=0){
        console.log("Ettention! not calculate all features");
    }
   
    const filltered= Directions.filter((item) => item.NumberOfFeat>0);
    resolve(filltered);
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
            const Arr = [];

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
                                circel.A = pointA;
                                Arr.push(pointA);
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
                                            x: parseFloat(x).toFixed(3),
                                            y: parseFloat(y).toFixed(3),
                                            z: parseFloat(z).toFixed(3),
                                        });

                                        circel.B = pointB;
                                        Arr.push(pointB);


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
                                                    x: parseFloat(x).toFixed(3),
                                                    y: parseFloat(y).toFixed(3),
                                                    z: parseFloat(z).toFixed(3),
                                                });
                                                circel.C = pointC;
                                                Arr.push(pointC);
                                                
                                                circel.PN=pn;
                                                circel.AxisB = GetCircelAxisB(circel);
                                                // circel.AxisC = GetCircelAxisC(circel);
                                                circel.AbsulteAxisB = GetGenCircelAxisB(circel);
                                                // circel.AbsulteAxisC = GetGenCircelAxisC(circel);
                                                if(circel.AbsulteAxisB.length>3){
                                                    circel.IsComplex=true;
                                                }

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
const CreateFeat=(circelObj,pn)=>
    new Promise(async resolve=>{

    // const docs =await Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }).exec();
    const docs =await Circel.find({ PN:pn,AbsulteAxisB: circelObj.AbsulteAxisB}).exec();
    //Docs : Group of circles that is not used already, same pn, and same AbsDirection (Y,X,Z,Complex)
    
    if(docs.length==0) {
        // console.log("## (docs.length==0)s");
        resolve(null);}
    else{
            var axis = circelObj.AxisB;
            var y = circelObj.A.y;
            var x = circelObj.A.x;
            var z = circelObj.A.z;
            var id = circelObj._id.toString();

            var newArr = [];
            if (!passCircelArr.includes(id)) {

                if(circelObj.IsComplex==true){
     
                    var newArr = docs;
                }
                else{
                    if (circelObj.AbsulteAxisB=='X') {
                        newArr = docs.filter(function (e) {
                            return e.A.y === y && e.A.z === z;
                        });
                    
                    }
                    else{
                        if (circelObj.AbsulteAxisB=='Y') {
                            newArr = docs.filter(function (e) {
                                return e.A.x === x && e.A.z === z;
                            });
                        
                        }
                        else{
                            if (circelObj.AbsulteAxisB=='Z') {
                                newArr = docs.filter(function (e) {
                                    return e.A.y === y && e.A.x === x;
                                });
                            
                            }
                        
                        }
                    }
                }
                //Complex Feats
                if(newArr.length>0){
                    let type=CalcCoCircleType(newArr);
                    let DirectionsAxis = CalcFeatsDirection(newArr);
                    var coCirc = new Feat({
                        circels: newArr,
                        AxisB: DirectionsAxis,
                        AbsulteAxisB:circelObj.AbsulteAxisB,
                        AbsulteAxisC:circelObj.AbsulteAxisC,
                        radius: circelObj.radius,
                        RepreCount: newArr.length,
                        type:type,
                        IsComplex:circelObj.IsComplex
                    });

                    newArr.forEach(element => {
                        passCircelArr.push(element._id.toString());
                    });
                    // console.log("## Feat Completed!");
                    // console.log(coCirc);
                    resolve(coCirc);
                }
            }
            else{
                // console.log("## Circ already include");
                resolve(null);
        
            }
        }
   
});

//(02-2)
function CalcFeatsDirection(circlesArr){

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

//(02-3)
const CreateDirectionObject=(s,pn)=>
new Promise(async resolve=>{

let absAxis='';
if(s == 'X' || s == '-X') absAxis='X';
if(s == 'Y' || s == '-Y') absAxis='Y';
if(s == 'Z' || s == '-Z') absAxis='Z';
if(absAxis == '') {
    // console.log("Complex Direction "+pn);
    absAxis='Complex';
}

// const docs =await Circel.find({ GenAxisB: circelObj.GenAxisB, GenAxisC: circelObj.GenAxisC }).exec();
const featList =await Feat.find({ PN:pn,AxisB:s }).exec();
const direction=new Direction({
    PN:pn,
    DirectionAxis:s,
    Features:featList,
    AbsAxis:absAxis,
    NumberOfFeat:featList.length,
});

    resolve(direction);

});

//(03-2)
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
    var str='r'+circleObj.radius+'x'+circleObj.A.x+'y'+circleObj.A.y+'z'+circleObj.A.z+'x'+circleObj.B.x+'y'+circleObj.B.y+'z'+circleObj.B.z+'x'+circleObj.C.x+'y'+circleObj.C.y+'z'+circleObj.C.z;
    return str;

}

function GetUniqKeyForDirection(coCirclesObj){
    return coCirclesObj.AxisB;
}

function GetCircelAxisB(circel) {
    var axis = "";
    if (circel.B.x == 1) {
        axis = "X";
    }
    else {
        if (circel.B.x == -1) {
            axis = "-X";
        }
        else {
            if (circel.B.y == 1) {
                axis = "Y";
            }
            else {
                if (circel.B.y == -1) {
                    axis = "-Y";
                }
                else {
                    if (circel.B.z == 1) {
                        axis = "Z";
                    }
                    else {
                        if (circel.B.z == -1) {
                            axis = "-Z";
                        }    
                    }
                }
            }
        }
    }
  
    if(axis == ""){
        axis='| X '+circel.B.x+' | Y '+circel.B.y+' | Z '+circel.B.z;
    }
    return axis;

}
function GetCircelAxisC(circel) {


    var axis = "";
    if (circel.C.x == 1) {
        axis = "X";
    }
    else {
        if (circel.C.x == -1) {
            axis = "-X";
        }
        else {
            if (circel.C.y == 1) {
                axis = "Y";
            }
            else {
                if (circel.C.y == -1) {
                    axis = "-Y";

                }
                else {
                    if (circel.C.z == 1) {
                        axis = "Z";
                    }
                    else {
                        if (circel.C.z == -1) {
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
    if (circel.B.x == 1 || circel.B.x == -1) {
        axis = "X";
    }
    else {
        if (circel.B.y == 1 || circel.B.y == -1) {
            axis = "Y";
        }
        else {
            if (circel.B.z == 1 || circel.B.z == -1) {
                axis = "Z";
            }
            
        }
    }
    if(axis == "") {
        axis = "Complex"+ '| X '+Math.abs(circel.B.x)+' | Y '+Math.abs(circel.B.y)+' | Z '+Math.abs(circel.B.z);

    }
    return axis;

}
function GetGenCircelAxisC(circel) {
    var axis = "";
    if (circel.C.x == 1 || circel.C.x == -1) {
        axis = "X";
    }
    else {
        if (circel.C.y == 1 || circel.C.y == -1) {
            axis = "Y";
        }
        else {
            if (circel.C.z == 1 || circel.C.z == -1) {
                axis = "Z";
            }
        }
    }
    if(axis=="") {
        axis =  "Complex";}
     
    return axis;

}

function CalcCoCircleType(circlesArr){
    let type="";
    if(circlesArr.length==2){ 
                    
        if(circlesArr[0].AbsulteAxisC!=circlesArr[1].AbsulteAxisC){
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


//-------------------## DB
const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    res.status(200).send("ok");
}

async function saveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

module.exports = {
    GetCirclesArr,
    GetFeatArr,
    GetDirectionsArr,
    GetMSPart,
    ClearDB,
};
