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

const GetBounding=(pn,fullTable,w,l,h)=>

    new Promise(async resolve =>{

        let arrayX=[];
        let arrayY=[];
        let arrayZ=[];

        // # Reading all x y z from step file ----------
        let filteredArr=fullTable.filter(e=>{
            let r=e.split(" ");
            return r[2]==="CARTESIAN_POINT";
        });

        for(el of filteredArr){        
            var row = el.split(" ");
            let x = parseFloat(row[7]).toFixed(2);
            let y = parseFloat(row[8]).toFixed(2);
            let z = parseFloat(row[9]).toFixed(2);
            arrayX.push(x);
            arrayY.push(y);
            arrayZ.push(z);
        }
        
        let MaxXStep= parseFloat(Math.max(...arrayX));
        let MinXStep= parseFloat(Math.min(...arrayX));
        let MaxYStep= parseFloat(Math.max(...arrayY));
        let MinYStep= parseFloat(Math.min(...arrayY));
        let MaxZStep= parseFloat(Math.max(...arrayZ));
        let MinZStep= parseFloat(Math.min(...arrayZ));

        let areaX=MaxXStep-MinXStep;
        let areaY=MaxYStep-MinYStep;
        let areaZ=MaxZStep-MinZStep;

        // # Reading all x y z from step file ----------

        let MaxY,MinY,MaxX,MinX,MaxZ,MinZ,xTotal,yTotal,zTotal;
        let tempArray=[];

        // # Changing the w h l to the real step x y z ----------

        if(areaY>areaX && areaY>areaZ){
             MaxY=MaxXStep
             MinY=MinXStep;
             yTotal=l;

             tempArray=arrayX;
             arrayX=arrayY;
            

            if(areaX>areaZ){
                 MaxX=MaxYStep;
                 MinX=MinYStep;
                 MaxZ=MaxZStep;
                 MinZ=MinZStep;
                 xTotal=w;
                 zTotal=h;

                 arrayY=tempArray;
                 arrayZ=arrayZ;
            }
            else{
                 MaxZ=MaxYStep;
                 MinZ=MinYStep;
                 MaxX=MaxZStep;
                 MinX=MinZStep;
                 zTotal=w;
                 xTotal=h;

                 arrayY=arrayZ;
                 arrayX=tempArray;
            }
        }
        else{
            if(areaZ>areaX && areaZ>areaY){
                 MaxZ=MaxXStep
                 MinZ=MinXStep;
                 zTotal=l;


                 tempArray=arrayX;
                 arrayX=arrayZ;

                if(areaY>areaX){
                     MaxY=MaxYStep;
                     MinY=MinYStep;
                     MaxX=MaxZStep;
                     MinX=MinZStep;
                     yTotal=w;
                     xTotal=h;

                     arrayY=arrayY;
                     arrayZ=tempArray;
                }
                else{
                     MaxX=MaxYStep;
                     MinX=MinYStep;
                     MaxY=MaxZStep;
                     MinY=MinZStep;
                     xTotal=w;
                     yTotal=h;

                     arrayY=tempArray;
                     arrayZ=arrayY;

                }

            

            }
            else{
                if(areaX>areaZ && areaX>areaY)
                    {
                         MaxX=MaxXStep
                         MinX=MinXStep;
                         xTotal=l;

                        if(areaY>areaZ){
                             MaxY=MaxYStep;
                             MinY=MinYStep;
                             MaxZ=MaxZStep;
                             MinZ=MinZStep;
                             yTotal=w;
                             zTotal=h;
                             
                        }
                        else{
                             MaxZ=MaxYStep;
                             MinZ=MinYStep;
                             MaxY=MaxZStep;
                             MinY=MinZStep;
                             zTotal=w;
                             yTotal=h;

                             tempArray=arrayY;
                             arrayY=arrayZ;
                             arrayZ=tempArray;
                        }
                }
            }
        }

        // # Changing the w h l to the real step x y z ------


        // # Calculating real middlePoint --------
        
        let MiddleX=MaxX<0 ? xTotal/2*(-1): xTotal/2;
        let MiddleY=MaxY<0 ? yTotal/2*(-1): yTotal/2;
        let MiddleZ=MaxZ<0 ? zTotal/2*(-1): zTotal/2;

        MiddleX = MaxX+MinX== 0 ||  MaxX+MinX==1 || MaxX+MinX==-1? 0: MiddleX;
        MiddleY = MaxY+MinY== 0 || MaxY+MinY==1 || MaxY+MinY==-1? 0: MiddleY;    
        MiddleZ = MaxZ+MinZ== 0 || MaxZ+MinZ==1 || MaxZ+MinZ==-1? 0: MiddleZ;

        let positiveArrayX=arrayX.filter(e=>{return e>0});
        MiddleX=positiveArrayX.length>arrayX.length/2? MiddleX:MiddleX*(-1);
        let positiveArrayY=arrayY.filter(e=>{return e>0});
        MiddleY=positiveArrayY.length>arrayY.length/2? MiddleY:MiddleY*(-1);
        let positiveArrayZ=arrayZ.filter(e=>{return e>0});
        MiddleZ=positiveArrayZ.length>arrayZ.length/2? MiddleZ:MiddleZ*(-1);

        const point= new Point({
            x:MiddleX,
            y:MiddleY,
            z:MiddleZ,
        });

        // # Calculating real middlePoint --------

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
            High:h
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
        console.log('directionObj.DirectionAxis');
        console.log(directionObj.DirectionAxis);
        let filltered = FeatList.filter((item) => item.AxisB != s);
        FeatList = filltered;
    }

    if(FeatList.length>0){
    
        for(f of FeatList){
            if(!DirectionStringSet.includes(f.AxisB)){
                let templist=FeatList.filter((item) => item.AxisB== f.AxisB);
                let directionObj=await CreateABnormalDirectionObject(f,pn,templist);
                
                Directions.push(directionObj);
                DirectionStringSet.push(directionObj.DirectionAxis);
                console.log('directionObj.DirectionAxis');
                console.log(directionObj.DirectionAxis);
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

    let positiveH='Z';
    let negativeH='-Z';
    let emptyList=[];

    if(filltered.filter((item) => item.DirectionAxis==negativeH.toString()).length==0){
        let directionObj=await CreateDirectionObject(negativeH,pn,emptyList);
        filltered.push(directionObj);
    }
    if(filltered.filter((item) => item.DirectionAxis==positiveH.toString()).length==0){
        let directionObj=await CreateDirectionObject(positiveH,pn,emptyList);
        filltered.push(directionObj);
    }
    
    // ## High Sides to Machine
    if(bounding.High>50){
        let positiveW='Y';
        let negativeW='-Y';
        let positiveL='X';
        let negativeL='-X';

        if(filltered.filter((item) => item.DirectionAxis==positiveW.toString()).length==0){
            let directionObj=await CreateDirectionObject(positiveW,pn,emptyList);
            filltered.push(directionObj);}

        if(filltered.filter((item) => item.DirectionAxis==negativeW.toString()).length==0){
            let directionObj=await CreateDirectionObject(negativeW,pn,emptyList);
            filltered.push(directionObj);
        }
        if(filltered.filter((item) => item.DirectionAxis==positiveL.toString()).length==0){
            let directionObj=await CreateDirectionObject(positiveL,pn,emptyList);
            filltered.push(directionObj);
        }
        if(filltered.filter((item) => item.DirectionAxis==negativeL.toString()).length==0){
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

//(02-3)
const CreateABnormalDirectionObject=(feat,pn,tempList)=>
new Promise(async resolve=>{
    const direction=new Direction({
        PN:pn,
        DirectionAxis:feat.AxisB,
        Features:tempList,
        AbsAxis:feat.AbsulteAxisB,
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
        axis = '| X '+Math.abs(circel.B.x)+' | Y '+Math.abs(circel.B.y)+' | Z '+Math.abs(circel.B.z);

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

//-------------------## DB
const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    res.status(200).send("ok");
}

module.exports = {
    GetCirclesArr,
    GetFeatArr,
    GetDirectionsArr,
    GetMSPart,
    GetBounding,
    ClearDB,
};
