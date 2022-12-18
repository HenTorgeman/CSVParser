const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
const Part = require("../Model/Part");
const e = require("express");
const Bounding = require("../Model/Bounding");
var passCircelArr = [];
var featIndex=0;

//(01)
const GetCirclesArr=(tableFile,pn)=>
    new Promise(async resolve =>{
    var circleArr=[];
    var dictionary =[];

    let filteredArr=tableFile.filter(e=>{
        let r=e.split(" ");
        return r[2]==="CIRCLE";
    });

    for(el of filteredArr){        
        var row = el.split(" ");
        const response= await CreateNewCircelAction(row, tableFile, pn);
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
                    //Not cirecle action.
                }
            }
    }
    resolve(circleArr);
});

//(03)
// const GetBounding=(tableFile,pn)=>
//     new Promise(async resolve =>{
//     let arrayX=[];
//     let arrayY=[];
//     let arrayZ=[];

//     let filteredArr=tableFile.filter(e=>{
//         let r=e.split(" ");
//         return r[2]==="CARTESIAN_POINT";
//     });
//     for(el of filteredArr){       
//             let rowArr = el.split(" ");
//             let x = parseFloat(rowArr[7]);
//             let y = parseFloat(rowArr[8]);
//             let z = parseFloat(rowArr[9]);
//             arrayX.push(x);
//             arrayY.push(y);
//             arrayZ.push(z);
//     }

//     let MaxX= Math.max(...arrayX);
//     let MinX= Math.min(...arrayX);
//     let MaxY= Math.max(...arrayY);
//     let MinY= Math.min(...arrayY);
//     let MaxZ= Math.max(...arrayZ);
//     let MinZ= Math.min(...arrayZ);
//     const point= new Point({
//         x:(MaxX-MinX)/2,
//         y:(MaxY-MinY)/2,
//         z:(MaxZ-MinZ)/2,
//     });

//     const bounding= new Bounding({
//         PN:pn,
//         MaxX: MaxX,
//         MinX: MinX,
//         MaxY: MaxY,
//         MinY: MinY,
//         MaxZ: MaxZ,
//         MinZ: MinZ,
//         MiddlePoint:point
//     });

//     resolve(bounding);
// });

const GetBounding=(circleArr,pn,fullTable)=>

    new Promise(async resolve =>{

        //-----------------------Data collection

        let arrayX=[];
        let arrayY=[];
        let arrayZ=[];

        //Option1 :By General area
        let filteredArr=fullTable.filter(e=>{
            let r=e.split(" ");
            return r[2]==="CARTESIAN_POINT";
        });
        //Option2 :By Feats area
        // for(el of circleArr){   
        //     arrayX.push(el.A.x);
        //     arrayY.push(el.A.y);
        //     arrayZ.push(el.A.z);
        // }

        for(el of filteredArr){        
            var row = el.split(" ");
            let x = parseFloat(row[7]).toFixed(2);
            let y = parseFloat(row[8]).toFixed(2);
            let z = parseFloat(row[9]).toFixed(2);
            arrayX.push(x);
            arrayY.push(y);
            arrayZ.push(z);
        }
        
        let MaxX= parseFloat(Math.max(...arrayX));
        let MinX= parseFloat(Math.min(...arrayX));
        let MaxY= parseFloat(Math.max(...arrayY));
        let MinY= parseFloat(Math.min(...arrayY));
        let MaxZ= parseFloat(Math.max(...arrayZ));
        let MinZ= parseFloat(Math.min(...arrayZ));
        

        //-----------------------Data Calculation
        let xRange=0;
        let yRange=0;
        let zRange=0;


        if(MaxX+MinX==0)
        {   xRange=Math.abs(MaxX)+Math.abs(MinX);
        }
        else
        {
            //  xRange=Math.abs(MaxX)>Math.abs(MinX)? MaxX-MinX:MinX-MaxX;
            xRange= MaxX-MinX;
        }

        if(MaxY+MinY==0)
        {    yRange=Math.abs(MaxY)+Math.abs(MinY);}
        else{
            //  yRange=Math.abs(MaxY)>Math.abs(MinY)? MaxY-MinY:MinY-MaxY;
            yRange= MaxY-MinY;
        }

        if(MaxZ+MinZ==0)
        {    zRange=Math.abs(MaxZ)+Math.abs(MinZ);}
        else{
            //  zRange=Math.abs(MaxZ)>Math.abs(MinZ)? MaxZ-MinZ:MinZ-MaxZ;
            zRange= MaxZ-MinZ;

        }

        let areaX=Math.abs(xRange);
        let areaY=Math.abs(yRange);
        let areaZ=Math.abs(zRange);

        let w="";
        let h="";
        let l="";
        let wVal=0;
        let hVal=0;
        let lVal=0;
        
        //Calculating whos is W H L.
        if(areaX>=areaY&&areaX>=areaZ){
            l='X';
            lVal=areaX;

            if(areaY>=areaZ)
            {   w='Y';
                wVal=areaY;
                h='Z';
                hVal=areaZ;
            }
            else{
                w='Z';
                wVal=areaZ;
                h='Y';
                hVal=areaY;

            }
        }
        else{
            if(areaY>=areaX&&areaY>=areaZ){
                l='Y';
                lVal=areaY;

                if(areaX>=areaZ)
                {   w='X';
                    wVal=areaX;
                    h='Z';
                    hVal=areaZ;
                }
                else{
                    w='Z';
                    wVal=areaZ;
                    h='X';
                    hVal=areaX;

                }
            }
            else{
                    l='Z';
                    lVal=areaZ;

                    if(areaX>=areaY)
                    {   w='X';
                        wVal=areaX;

                        h='Y';
                        hVal=areaY;

                    }
                    else{
                        w='Y';
                        wVal=areaY;
                        h='X';
                        hVal=areaX;
                    }
                }
        }

        let MiddleX=MaxX<0 ? xRange/2*(-1): xRange/2;
        let MiddleY=MaxY<0 ? yRange/2*(-1): yRange/2;
        let MiddleZ=MaxZ<0 ? zRange/2*(-1): zRange/2;

        MiddleX = MaxX+MinX==0? 0: MiddleX;
        MiddleY = MaxY+MinY== 0 ? 0: MiddleY;    
        MiddleZ = MaxZ+MinZ== 0 ? 0: MiddleZ;

        const point= new Point({
            x:MiddleX,
            y:MiddleY,
            z:MiddleZ,
        });

        const bounding= new Bounding({
            PN:pn,
            MaxX: MaxX,
            MinX: MinX,
            MaxY: MaxY,
            MinY: MinY,
            MaxZ: MaxZ,
            MinZ: MinZ,
            MiddlePoint:point,
            W:w,
            L:l,
            H:h,
            Hval:hVal,
            Wval:wVal,
            Lval:lVal
        });

    resolve(bounding);
});

//(02)
const GetFeatArr=(circleArr,pn,bounding)=>
new Promise(async resolve =>{
    featIndex=0;
    const completeCirclesArr=[];
    for(c of circleArr){
       const coCirc=await CreateFeat(c,pn,featIndex,bounding);

       if(coCirc != null){
            coCirc.PN = pn;
            completeCirclesArr.push(coCirc);
            featIndex++;
        }
    }
    resolve(completeCirclesArr);
});

//(03)
const GetDirectionsArr=(faetArr,pn,bounding)=>
new Promise(async resolve =>{
    const Directions=[];
    const DirectionsString=["X","-X","Z","-Z","Y","-Y"];
    const DirectionStringSet=[];
    let FeatList = faetArr;
    for(s of DirectionsString){

        let templist=FeatList.filter((item) => item.AxisB== s);
        let directionObj=await CreateDirectionObject(s,pn,templist);
        Directions.push(directionObj);
        DirectionStringSet.push(directionObj.DirectionAxis);
        let filltered = FeatList.filter((item) => item.AxisB != s);
        FeatList = filltered;
    }

    if(FeatList.length>0){
    
        for(f of FeatList){
            if(!DirectionStringSet.includes(f.AxisB)){
                let templist=FeatList.filter((item) => item.AxisB== f.AxisB);
                let directionObj=await CreateDirectionObject(f.AxisB,pn,templist);
                Directions.push(directionObj);
                DirectionStringSet.push(directionObj.DirectionAxis);
                let filltered= FeatList.filter((item) => item.AxisB != f.AxisB);
                FeatList=filltered;
            }
        }
    }
    if(FeatList.length!=0){
        console.log("Ettention! not calculate all features");
    }
   
    const filltered= Directions.filter((item) => item.NumberOfFeat>0);

    // ## Buttom to Machine
    let positiveH=bounding.H;
    let negativeH='-'+bounding.H;
    let emptyList=[];

    if(filltered.filter((item) => item.DirectionAxis==negativeH.toString()).length==0){
    // if(filltered.includes(positiveH.toString())==false){
        let directionObj=await CreateDirectionObject(negativeH,pn,emptyList);
        filltered.push(directionObj);
    }
    if(filltered.filter((item) => item.DirectionAxis==positiveH.toString()).length==0){
    // if(filltered.includes(negativeH.toString())==false){
        let directionObj=await CreateDirectionObject(positiveH,pn,emptyList);
        filltered.push(directionObj);
    }
    // ## High Sides to Machine
    if(bounding.Hval>50){
        let positiveW=bounding.W;
        let negativeW='-'+bounding.W;
        let positiveL=bounding.L;
        let negativeL='-'+bounding.L;

        if(filltered.filter((item) => item.DirectionAxis==positiveW.toString()).length==0){
        // if(filltered.includes(positiveW.toString())==false) {
            let directionObj=await CreateDirectionObject(positiveW,pn,emptyList);
            filltered.push(directionObj);}

        if(filltered.filter((item) => item.DirectionAxis==negativeW.toString()).length==0){
        // if(filltered.includes(negativeW.toString())==false) {
            let directionObj=await CreateDirectionObject(negativeW,pn,emptyList);
            filltered.push(directionObj);
        }
        if(filltered.filter((item) => item.DirectionAxis==positiveL.toString()).length==0){
        // if(filltered.includes(positiveL.toString())==false) {
            let directionObj=await CreateDirectionObject(positiveL,pn,emptyList);
            filltered.push(directionObj);
        }
        if(filltered.filter((item) => item.DirectionAxis==negativeL.toString()).length==0){
        // if(filltered.includes(negativeL.toString())==false) {
            let directionObj=await CreateDirectionObject(negativeL,pn,emptyList);
            filltered.push(directionObj);
        }
    }
    
    resolve(filltered);
});

//(04)

const ReduceDirections=(DirectionArr,pn,bounding)=>
new Promise(async resolve =>{

    //1. need to understand which DirectionAxis is must and which is not.

    resolve(null);
});

//(01-1)
const CreateNewCircelAction=(rowArr, fileArr,pn)=>
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
                Radius: parseFloat(radius).toFixed(2),
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
                                                circel.AbsulteAxisB = GetGenCircelAxisB(circel);
                                                // circel.AxisC = GetCircelAxisC(circel);
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

/*
                            AbsAxis

                                option1: circlesArr.length==1  -> Radius | Possible
                                option1: isOneDirection=true && circlesArr.length>1   -> BHOLE | Not Possible
                                option2: isOneDirection=false && MaxRadiusesCircle.isOneDirection=true ->CBOR | Not possible 
                                option2: isOneDirection=false && MaxRadiusesCircle.isOneDirection=false ->HOLE | Possible
*/
/*
                            Process

                            1. check AbsAxis
                                1.1 check length
                                    1.1.1 =1 -> Radius, Possible, Array[0].x +-
                                    1.1.2 >1 ->
                                        1.1.2.1 isOneDirection=true -> BHOLE, NotPossible, Array[0].x +-
                                        1.1.2.1 isOneDirection=false ->
                                            1.1.2.2 if MaxRadiusesCircle.isOneDirection=true ->CBOR | Not possible | MaxRadiusesCircle.x+-
                                            1.1.2.2 if MaxRadiusesCircle.isOneDirection=false ->HOLE | Possible | MaxRadiusesCircle.x+-

*/

//(02-1)
const CreateFeat=(circelObj,pn,index,bounding)=>
    new Promise(async resolve=>{
    const docs =await Circel.find({ PN:pn,AbsulteAxisB: circelObj.AbsulteAxisB}).exec();
    
    if(docs.length==0) resolve(null);
    else{
            var y = circelObj.A.y;
            var x = circelObj.A.x;
            var z = circelObj.A.z;
            var id = circelObj._id.toString();
            let AbsAxis=circelObj.AbsulteAxisB;
            let isOneDirection;
            let isPossibleBoth;
            let maxRadius;
            let type;
            let direction;
            let MiddlePointPart=bounding.MiddlePoint;

            var newArr = [];
            if (passCircelArr.includes(id)) resolve(null);
            
            else {
                if(circelObj.IsComplex==true){
                    //NEED TO IMPLEMENT BETTER
                    newArr = docs.filter(function (e) {
                        return e.A.y === y && e.A.z === z || e.A.x === x && e.A.z === z || e.A.y === y && e.A.x === x;
                    });

                    if(newArr.length>0){

                        let circleArr=newArr;
                        maxRadius=Math.max(...circleArr.map(o => o.Radius));
                        let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});      
                        isOneDirection=false; 
                        isPossibleBoth=false;
                        type='COMPLEX';
                        direction=MaxRadiusArr[0].AxisB;
                    }
                }
                else{
                    if (circelObj.AbsulteAxisB=='X') {
                        newArr = docs.filter(function (e) {
                            return e.A.y === y && e.A.z === z;
                        });
                        if(newArr.length>0){
                            let circleArr=newArr;
                   
                            if(circleArr.length==1){
                                isOneDirection=true;
                                isPossibleBoth=true;
                                type='RADIUS';
                                direction=circleArr[0].A.x>MiddlePointPart.x?'X':'-X';
                            }
                            else{
                                //Blind Holes : All actions in the same direction
                                let tempArr=circleArr.filter(e=>{return e.A.x>MiddlePointPart.x});
                                if(tempArr.length==circleArr.length || tempArr.length==0){
                                    isOneDirection=true;
                                    isPossibleBoth=false;
                                    type='BHOLE';
                                    direction=circleArr[0].A.x>MiddlePointPart.x?'X':'-X';
                                }
                                //Pass Holes  : Actions with diffrent directions
                                else{
                                 maxRadius=Math.max(...circleArr.map(o => o.Radius));
                                    let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
                                    if(MaxRadiusArr.length>1){
                                        let testArr=MaxRadiusArr.filter(e=>{return e.A.x>MiddlePointPart.x});
                                        if(testArr.length==circleArr.length || testArr.length==0){
                                            isOneDirection=false;
                                            isPossibleBoth=false;
                                            type='OTHER';
                                            direction=MaxRadiusArr[0].A.x>MiddlePointPart.x?'X':'-X';
                                            // OTHER not possible : All Max Radiuses in same direction
                                        }
                                        else{
                                            isOneDirection=false;
                                            isPossibleBoth=true;
                                            type='HOLE';
                                            direction=MaxRadiusArr[0].A.x>MiddlePointPart.x?'X':'-X';
                                             //Hole - possible : Max Radiuses in diffrent direction
                                        }
                                    }
                                    else{
                                        isOneDirection=false; 
                                        isPossibleBoth=false;
                                        type='CBOR';
                                        direction=MaxRadiusArr[0].A.x>MiddlePointPart.x?'X':'-X';
                                            //CBOR not possible : One Max Radiuse so direction will be by it.
                                    } }
                                }
                            }
                        }
                    else{
                        if (circelObj.AbsulteAxisB=='Y') {
                            newArr = docs.filter(function (e) {
                                return e.A.x === x && e.A.z === z;
                            });

                            if(newArr.length>0){
                                let circleArr=newArr;
                                      
                            if(circleArr.length==1){
                            isOneDirection=true;
                            isPossibleBoth=true;
                            type='RADIUS';
                            direction=circleArr[0].A.y>MiddlePointPart.y?'Y':'-Y';
                        }
                        else{
                            //Blind Holes : All actions in the same direction
                            let tempArr=circleArr.filter(e=>{return e.A.y>MiddlePointPart.y});
                            if(tempArr.length==circleArr.length || tempArr.length==0){
                                isOneDirection=true;
                                isPossibleBoth=false;
                                type='BHOLE';
                                direction=circleArr[0].A.y>MiddlePointPart.y?'Y':'-Y';
                            }
                            //Pass Holes  : Actions with diffrent directions
                            else{
                                 maxRadius=Math.max(...circleArr.map(o => o.Radius));
                                let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
                                if(MaxRadiusArr.length>1){
                                    let testArr=MaxRadiusArr.filter(e=>{return e.A.y>MiddlePointPart.y});
                                    if(testArr.length==circleArr.length || testArr.length==0){
                                        isOneDirection=false;
                                        isPossibleBoth=false;
                                        type='OTHER';
                                        direction=MaxRadiusArr[0].A.y>MiddlePointPart.y?'Y':'-Y';
                                        // OTHER not possible : All Max Radiuses in same direction
                                    }
                                    else{
                                        isOneDirection=false;
                                        isPossibleBoth=true;
                                        type='HOLE';
                                        direction=MaxRadiusArr[0].A.y>MiddlePointPart.y?'Y':'-Y';
                                         //Hole - possible : Max Radiuses in diffrent direction
                                    }
                                }
                                else{
                                    isOneDirection=false; 
                                    isPossibleBoth=false;
                                    type='CBOR';
                                    direction=MaxRadiusArr[0].A.y>MiddlePointPart.y?'Y':'-Y';
                                    //CBOR not possible : One Max Radiuse so direction will be by it.
                                } }
                            }
                        }
                        
                        }
                        else{
                            if (circelObj.AbsulteAxisB=='Z') {
                                newArr = docs.filter(function (e) {
                                    return e.A.y === y && e.A.x === x;
                                });
                                if(newArr.length>0){
                                    let circleArr=newArr;
                                
                                if(circleArr.length==1){
                                    isOneDirection=true;
                                    isPossibleBoth=true;
                                    type='RADIUS';
                                    direction=circleArr[0].A.z>MiddlePointPart.z?'Z':'-Z';
                                }
                                else{
                                    //Blind Holes : All actions in the same direction
                                    let tempArr=circleArr.filter(e=>{return e.A.z>MiddlePointPart.z});
                                    if(tempArr.length==circleArr.length || tempArr.length==0){
                                        isOneDirection=true;
                                        isPossibleBoth=false;
                                        type='BHOLE';
                                        direction=circleArr[0].A.z>MiddlePointPart.z?'Z':'-Z';
                                    }
                                    //Pass Holes  : Actions with diffrent directions
                                    else{
                                        maxRadius=Math.max(...circleArr.map(o => o.Radius));
                                        let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
                                        if(MaxRadiusArr.length>1){
                                            let testArr=MaxRadiusArr.filter(e=>{return e.A.z>MiddlePointPart.z});
                                            if(testArr.length==circleArr.length || testArr.length==0){
                                                isOneDirection=false;
                                                isPossibleBoth=false;
                                                type='OTHER';
                                                direction=MaxRadiusArr[0].A.z>MiddlePointPart.z?'Z':'-Z';
                                                // OTHER not possible : All Max Radiuses in same direction
                                            }
                                            else{
                                                isOneDirection=false;
                                                isPossibleBoth=true;
                                                type='HOLE';
                                                direction=MaxRadiusArr[0].A.z>MiddlePointPart.z?'Z':'-Z';
                                                //Hole - possible : Max Radiuses in diffrent direction
                                            }
                                        }
                                        else{
                                            isOneDirection=false; 
                                            isPossibleBoth=false;
                                            type='CBOR';
                                            direction=MaxRadiusArr[0].A.z>MiddlePointPart.z?'Z':'-Z';
                                            //CBOR not possible : One Max Radiuse so direction will be by it.
                                            } 
                                        }
                                    }
                                }                            
                            }
                        
                         }
                    }
                }
                        var feat = new Feat({
                            PN:pn,
                            Index:index,
                            circels: newArr,
                            type:type,
                            AxisB: direction,
                            AbsulteAxisB:circelObj.AbsulteAxisB,
                            AbsulteAxisC:circelObj.AbsulteAxisC,
                            RepreCount: newArr.length,
                            IsComplex:circelObj.IsComplex,
                            MaxRadius:maxRadius,
                            IsPossibleAbsDirection:isPossibleBoth,

                        });
                        newArr.map((doc) => passCircelArr.push(doc._id.toString()));
                        resolve(feat);
            }
    
        }
   
});


// //(02-1)
// const CreateFeat=(circelObj,pn,index,bounding)=>
//     new Promise(async resolve=>{
//     const docs =await Circel.find({ PN:pn,AbsulteAxisB: circelObj.AbsulteAxisB}).exec();
    
//     if(docs.length==0) resolve(null);
//     else{
//             var y = circelObj.A.y;
//             var x = circelObj.A.x;
//             var z = circelObj.A.z;
//             var id = circelObj._id.toString();
//             let AbsAxis=circelObj.AbsulteAxisB;
//             let isOneDirection;
//             let isPossibleBoth;
//             let maxRadius;
//             let type;
//             let direction;
//             let MiddlePointPart=bounding.MiddlePoint;

//             var newArr = [];
//             if (passCircelArr.includes(id)) resolve(null);
            
//             else {
//                 if(circelObj.IsComplex==true){
//                     //NEED TO IMPLEMENT BETTER
//                     newArr = docs.filter(function (e) {
//                         return e.A.y === y && e.A.z === z || e.A.x === x && e.A.z === z || e.A.y === y && e.A.x === x;
//                     });

//                     if(newArr.length>0){

//                         let circleArr=newArr;
//                         maxRadius=Math.max(...circleArr.map(o => o.Radius));
//                         let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});      
//                         isOneDirection=false; 
//                         isPossibleBoth=false;
//                         type='COMPLEX';
//                         direction=MaxRadiusArr[0].AxisB;
//                     }
//                 }
//                 else{
//                     if (circelObj.AbsulteAxisB=='X') {
//                         newArr = docs.filter(function (e) {
//                             return e.A.y === y && e.A.z === z;
//                         });
//                         if(newArr.length>0){
//                             let circleArr=newArr;
                   
//                             if(circleArr.length==1){
//                                 isOneDirection=true;
//                                 isPossibleBoth=true;
//                                 type='RADIUS';
//                                 direction=circleArr[0].A.x>0?'X':'-X';
//                             }
//                             else{
//                                 //Blind Holes : All actions in the same direction
//                                 let tempArr=circleArr.filter(e=>{return e.A.x>0});
//                                 if(tempArr.length==circleArr.length || tempArr.length==0){
//                                     isOneDirection=true;
//                                     isPossibleBoth=false;
//                                     type='BHOLE';
//                                     direction=circleArr[0].A.x>0?'X':'-X';
//                                 }
//                                 //Pass Holes  : Actions with diffrent directions
//                                 else{
//                                  maxRadius=Math.max(...circleArr.map(o => o.Radius));
//                                     let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
//                                     if(MaxRadiusArr.length>1){
//                                         let testArr=MaxRadiusArr.filter(e=>{return e.A.x>0});
//                                         if(testArr.length==circleArr.length || testArr.length==0){
//                                             isOneDirection=false;
//                                             isPossibleBoth=false;
//                                             type='OTHER';
//                                             direction=MaxRadiusArr[0].A.x>0?'X':'-X';
//                                             // OTHER not possible : All Max Radiuses in same direction
//                                         }
//                                         else{
//                                             isOneDirection=false;
//                                             isPossibleBoth=true;
//                                             type='HOLE';
//                                             direction=MaxRadiusArr[0].A.x>0?'X':'-X';
//                                              //Hole - possible : Max Radiuses in diffrent direction
//                                         }
//                                     }
//                                     else{
//                                         isOneDirection=false; 
//                                         isPossibleBoth=false;
//                                         type='CBOR';
//                                         direction=MaxRadiusArr[0].A.x>0?'X':'-X';
//                                             //CBOR not possible : One Max Radiuse so direction will be by it.
//                                     } }
//                                 }
//                             }
//                         }
//                     else{
//                         if (circelObj.AbsulteAxisB=='Y') {
//                             newArr = docs.filter(function (e) {
//                                 return e.A.x === x && e.A.z === z;
//                             });

//                             if(newArr.length>0){
//                                 let circleArr=newArr;
                                      
//                         if(AbsAxis=='Y'){
//                             if(circleArr.length==1){
//                             isOneDirection=true;
//                             isPossibleBoth=true;
//                             type='RADIUS';
//                             direction=circleArr[0].A.y>0?'Y':'-Y';
//                         }
//                         else{
//                             //Blind Holes : All actions in the same direction
//                             let tempArr=circleArr.filter(e=>{return e.A.y>0});
//                             if(tempArr.length==circleArr.length || tempArr.length==0){
//                                 isOneDirection=true;
//                                 isPossibleBoth=false;
//                                 type='BHOLE';
//                                 direction=circleArr[0].A.y>0?'Y':'-Y';
//                             }
//                             //Pass Holes  : Actions with diffrent directions
//                             else{
//                                  maxRadius=Math.max(...circleArr.map(o => o.Radius));
//                                 let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
//                                 if(MaxRadiusArr.length>1){
//                                     let testArr=MaxRadiusArr.filter(e=>{return e.A.y>0});
//                                     if(testArr.length==circleArr.length || testArr.length==0){
//                                         isOneDirection=false;
//                                         isPossibleBoth=false;
//                                         type='OTHER';
//                                         direction=MaxRadiusArr[0].A.y>0?'Y':'-Y';
//                                         // OTHER not possible : All Max Radiuses in same direction
//                                     }
//                                     else{
//                                         isOneDirection=false;
//                                         isPossibleBoth=true;
//                                         type='HOLE';
//                                         direction=MaxRadiusArr[0].A.y>0?'Y':'-Y';
//                                          //Hole - possible : Max Radiuses in diffrent direction
//                                     }
//                                 }
//                                 else{
//                                     isOneDirection=false; 
//                                     isPossibleBoth=false;
//                                     type='CBOR';
//                                     direction=MaxRadiusArr[0].A.y>0?'Y':'-Y';
//                                     //CBOR not possible : One Max Radiuse so direction will be by it.
//                                 } }
//                             }
//                     }
//                 }
                        
//                         }
//                         else{
//                             if (circelObj.AbsulteAxisB=='Z') {
//                                 newArr = docs.filter(function (e) {
//                                     return e.A.y === y && e.A.x === x;
//                                 });
//                                 if(newArr.length>0){
//                                     let circleArr=newArr;
                                
                                          
//                         if(AbsAxis=='Z'){
//                             if(circleArr.length==1){
//                                 isOneDirection=true;
//                                 isPossibleBoth=true;
//                                 type='RADIUS';
//                                 direction=circleArr[0].A.z>0?'Z':'-Z';
//                             }
//                             else{
//                                 //Blind Holes : All actions in the same direction
//                                 let tempArr=circleArr.filter(e=>{return e.A.z>0});
//                                 if(tempArr.length==circleArr.length || tempArr.length==0){
//                                     isOneDirection=true;
//                                     isPossibleBoth=false;
//                                     type='BHOLE';
//                                     direction=circleArr[0].A.z>0?'Z':'-Z';
//                                 }
//                                 //Pass Holes  : Actions with diffrent directions
//                                 else{
//                                      maxRadius=Math.max(...circleArr.map(o => o.Radius));
//                                     let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});                                   
//                                     if(MaxRadiusArr.length>1){
//                                         let testArr=MaxRadiusArr.filter(e=>{return e.A.z>0});
//                                         if(testArr.length==circleArr.length || testArr.length==0){
//                                             isOneDirection=false;
//                                             isPossibleBoth=false;
//                                             type='OTHER';
//                                             direction=MaxRadiusArr[0].A.z>0?'Z':'-Z';
//                                             // OTHER not possible : All Max Radiuses in same direction
//                                         }
//                                         else{
//                                             isOneDirection=false;
//                                             isPossibleBoth=true;
//                                             type='HOLE';
//                                             direction=MaxRadiusArr[0].A.z>0?'Z':'-Z';
//                                              //Hole - possible : Max Radiuses in diffrent direction
//                                         }
//                                     }
//                                     else{
//                                         isOneDirection=false; 
//                                         isPossibleBoth=false;
//                                         type='CBOR';
//                                         direction=MaxRadiusArr[0].A.z>0?'Z':'-Z';
//                                         //CBOR not possible : One Max Radiuse so direction will be by it.
//                                         } 
//                                     }
//                                 }
//                             }
                            
//                         }
                            
//                     }
                        
//                         }
//                     }
//                 }
//                         var feat = new Feat({
//                             PN:pn,
//                             Index:index,
//                             circels: newArr,
//                             type:type,
//                             AxisB: direction,
//                             AbsulteAxisB:circelObj.AbsulteAxisB,
//                             AbsulteAxisC:circelObj.AbsulteAxisC,
//                             RepreCount: newArr.length,
//                             IsComplex:circelObj.IsComplex,
//                             MaxRadius:maxRadius,
//                             IsPossibleAbsDirection:isPossibleBoth,

//                         });
//                         newArr.map((doc) => passCircelArr.push(doc._id.toString()));
//                         resolve(feat);
//             }
    
//         }
   
// });


//(02-3)
const CreateDirectionObject=(s,pn,tempList)=>
new Promise(async resolve=>{


    let absAxis='';
    if(s == 'X' || s == '-X') absAxis='X';
    if(s == 'Y' || s == '-Y') absAxis='Y';
    if(s == 'Z' || s == '-Z') absAxis='Z';
    if(absAxis == '') {
        absAxis='Complex';
    }

    const direction=new Direction({
        PN:pn,
        DirectionAxis:s,
        Features:tempList,
        AbsAxis:absAxis,
        NumberOfFeat:tempList.length,
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


//Need To Change
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
    GetBounding,
    ClearDB,
};
