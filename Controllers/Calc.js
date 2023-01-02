const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Files");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
const Part = require("../Model/Part");
const e = require("express");
const Bounding = require("../Model/Bounding");
const Machine = require("../Model/Machine");
const values = require("../SavedValues.json");

var passCircelArr = [];
var featIndex=0;


//-------------MAIN FUNCTION--------------

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

//(02)
const GetBounding=(pn,fullTable,w,l,h)=>
    new Promise(async resolve =>{

        let arrayX=[];
        let arrayY=[];
        let arrayZ=[];


        let WAxis='Y';
        let LAxis='X';
        let HAxis='Z';
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
             LAxis='Y';

             tempArray=arrayX;
             arrayX=arrayY;
            

            if(areaX>areaZ){
                 MaxX=MaxYStep;
                 MinX=MinYStep;
                 MaxZ=MaxZStep;
                 MinZ=MinZStep;
                 xTotal=w;
                 zTotal=h;
                 WAxis='X';
                 HAxis='Z';
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
                 WAxis='Z';
                 HAxis='X';
                 arrayY=arrayZ;
                 arrayX=tempArray;
            }
        }
        else{
            if(areaZ>areaX && areaZ>areaY){
                 MaxZ=MaxXStep
                 MinZ=MinXStep;
                 zTotal=l;
                 LAxis='Z';


                 tempArray=arrayX;
                 arrayX=arrayZ;

                if(areaY>areaX){
                     MaxY=MaxYStep;
                     MinY=MinYStep;
                     MaxX=MaxZStep;
                     MinX=MinZStep;
                     yTotal=w;
                     xTotal=h;
                     WAxis='Y';
                     HAxis='X';
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
                     WAxis='X';
                     HAxis='Y';
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
                             WAxis='Z';
                             HAxis='Y';
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
            WAxis:WAxis,
            HAxis:HAxis,
            LAxis:LAxis,
            High:h
        });

    resolve(bounding);
});

//(03)
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

//(04)
const GetDirectionsArr=(faetArr,pn,bounding)=>
new Promise(async resolve =>{
    const Directions=[];
    const DirectionsString=["X","-X","Z","-Z","Y","-Y"];
    const DirectionStringSet=[];    
    let FeatList = faetArr;
    for(s of DirectionsString){

        let templist=FeatList.filter((item) =>{ if(item.AxisB==s) return item;});
        let directionObj=await CreateDirectionObject(s,pn,templist);
        Directions.push(directionObj);
        DirectionStringSet.push(directionObj.DirectionAxis);
        let filltered = FeatList.filter((item) => { if(item.AxisB!=s) return item;});
        FeatList = filltered;
    }

    if(FeatList.length>0){
    
        for(f of FeatList){
            if(!DirectionStringSet.includes(f.AxisB)){
                let templist=FeatList.filter((item) => {if(item.AxisB== f.AxisB) return item;});
                let directionObj=await CreateABnormalDirectionObject(f,pn,templist);
                
                Directions.push(directionObj);
                DirectionStringSet.push(directionObj.DirectionAxis);

                let filltered= FeatList.filter((item) =>{if(item.AxisB!= f.AxisB) return item;});
                FeatList=filltered;
            }
        }
    }
    if(FeatList.length!=0){
        console.log("Ettention! not calculate all features");
    }
   
    const filltered= Directions.filter((item) => item.NumberOfFeat>0);

    // ## Buttom to Machine

    let minus='-';
    let positiveH=bounding.HAxis;

    let negativeH=minus.concat(bounding.HAxis);
    let positiveW=bounding.WAxis;
    let negativeW=minus.concat(bounding.WAxis);
    let positiveL=bounding.LAxis;
    let negativeL=minus.concat(bounding.LAxis);
    let emptyList=[];

    //If Length > 50 - machine 
    //If Length < 50 && -X / X has feats -> no need to machine.
    if(bounding.H>values.MaxHeightTool) {
        console.log("the hight of "+pn+" is Bigger");
        let filltered2=filltered.filter((item) =>{if(item.DirectionAxis==negativeH) return item;});
        if(filltered2.length==0){
            let directionObj=await CreateDirectionObject(negativeH,pn,emptyList);
            filltered.push(directionObj);
            console.log("Need to machine top buttom");
        }

        let filltered3=filltered.filter((item) =>{if(item.DirectionAxis==positiveH) return item;});
        if(filltered3.length==0){
           let directionObj=await CreateDirectionObject(positiveH,pn,emptyList);
            filltered.push(directionObj);
            console.log("Need to machine top buttom");

        }
    }
    // else{
    //     let filltered2=filltered.filter((item) =>{if(item.DirectionAxis==positiveL.toString()) return item;});
    //     if(filltered2.length==0){
    //         let filltered3=filltered.filter((item) =>{if(item.DirectionAxis==negativeL.toString()) return item;});
    //         if(filltered3.length==0){
    //             let directionObjN=await CreateDirectionObject(negativeH,pn,emptyList);
    //             let directionObjP=await CreateDirectionObject(positiveH,pn,emptyList);
    //             console.log("Need to machine top buttom");
    //             filltered.push(directionObjN);
    //             filltered.push(directionObjP);
    //         }
    //         else{
    //             console.log("No need to machine top buttom");
    //         }
    //     }
    //     else{
    //         console.log("No need to machine top buttom");
    //     }
    // }
    
    // ## High Sides to Machine
    if(bounding.High>values.MaxHeightTool){
        console.log("the hight of "+pn+" is Bigger");
        let filltered1=filltered.filter((item) =>{if(item.DirectionAxis==positiveW) return item;});
        if(filltered1.length==0){
            let directionObj=await CreateDirectionObject(positiveW,pn,emptyList);
            filltered.push(directionObj);
        }
        let filltered2=filltered.filter((item) =>{if(item.DirectionAxis==negativeW) return item;});
        if(filltered2.length==0){
            let directionObj=await CreateDirectionObject(negativeW,pn,emptyList);
            filltered.push(directionObj);
        }
        let filltered3=filltered.filter((item) =>{if(item.DirectionAxis==positiveL) return item;});
        if(filltered3.length==0){
            let directionObj=await CreateDirectionObject(positiveL,pn,emptyList);
            filltered.push(directionObj);
        }
        let filltered4=filltered.filter((item) =>{if(item.DirectionAxis==negativeL) return item;});
        if(filltered4.length==0){
            let directionObj=await CreateDirectionObject(negativeL,pn,emptyList);
            filltered.push(directionObj);
        }
    }
    
    resolve(filltered);
});

//(05) DIDNT IMPLEMENT : need the middle point of each surface to know which feat is BLINDHOLE or HOLE. 
const ReduceDirections=(DirectionArr,pn,bounding)=>
new Promise(async resolve =>{

    //1. need to understand which DirectionAxis is must and which is not.

    resolve(null);
});

//(06)
const CalculateAroundAxisNumber=(directionArr)=>
new Promise(async resolve =>{

    let aroundAxisList=[];
    let result=0;

    directionArr.map((doc) => {
        if(!aroundAxisList.includes(doc.AbsAxis)){
            aroundAxisList.push(doc.AbsAxis);
        }
    });

    if(aroundAxisList.length<=2) result=1;
    
    if(aroundAxisList.length==3) result=2;
    
    if(aroundAxisList.length>3) result=3;
    
    resolve(result);
});

//(07)
const CalculateKetMachineOptions=(obj)=>
new Promise(async resolve =>{

    let pn=obj.PN;
    let directionArr=obj.directions;
    let complexity=obj.complexityLevel;
    let aroundAxisNumber=obj.aroundAxis;
    let msNumber=directionArr.length;
    let machineOptions=[];
    
    if(msNumber<=2)
    {
        // # MD ==1 || MD== 2
        const machine=new Machine({
            PN:pn,
            KeyMachine:'3 Axis',
            SetUpsNumber:1
        });
        machineOptions.push(machine);
        resolve(machineOptions);

    }
    else{
        // # MD = 2+

        //complexity 3 : Low      
        if(complexity==3)
        {            

            if(aroundAxisNumber==1){
                    let machine3=creatiMachine3(pn,msNumber);
                    let machine4=creatiMachine4(pn,1);
                    machineOptions.push(machine3);
                    machineOptions.push(machine4);

            }
            if(aroundAxisNumber==2){                
                    let machine3=creatiMachine3(pn,msNumber);
                    let machine4=creatiMachine4(pn,2);
                    let machine5=creatiMachine5(pn,1);

                    machineOptions.push(machine3);
                    machineOptions.push(machine4);
                    machineOptions.push(machine5);

            }
            if(aroundAxisNumber==3){    
                
                let machine3=creatiMachine3(pn,msNumber);
                let machine4=creatiMachine4(pn,3);
                let machine5=creatiMachine5(pn,1);

                machineOptions.push(machine3);
                machineOptions.push(machine4);
                machineOptions.push(machine5);
               
            }
        }
        //complexity 2 : Medium
        if(complexity==2)
        {            

            if(aroundAxisNumber==1){
                    let machine3=creatiMachine3(pn,msNumber);
                    let machine4=creatiMachine4(pn,1);

                    machineOptions.push(machine3);
                    machineOptions.push(machine4);

            }
            if(aroundAxisNumber==2){                
                    let machine3=creatiMachine3(pn,msNumber);
                    let machine4=creatiMachine4(pn,2);
                    let machine5=creatiMachine5(pn,1);

                    machineOptions.push(machine3);
                    machineOptions.push(machine4);
                    machineOptions.push(machine5);

            }
            if(aroundAxisNumber==3){    
                let machine4=creatiMachine4(pn,3);
                let machine5=creatiMachine5(pn,1);

                machineOptions.push(machine4);
                machineOptions.push(machine5);
                
            }
        }
        //complexity 1 : High || 0 : Very High
        if(complexity<=1)
        {            
            if(aroundAxisNumber==1){
                    let machine4=creatiMachine4(pn,1);
                    let machine5=creatiMachine5(pn,1);

                    machineOptions.push(machine5);
                    machineOptions.push(machine4);
            }
            if(aroundAxisNumber==2){                
                    let machine4=creatiMachine4(pn,2);
                    let machine5=creatiMachine5(pn,1);

                    machineOptions.push(machine4);
                    machineOptions.push(machine5);
            }
            if(aroundAxisNumber==3){    
                let machine5=creatiMachine5(pn,1);
                machineOptions.push(machine5);
            }
        }
        resolve(machineOptions)
    }
});
//-------------SUB FUNCTION--------------

function creatiMachine3(pn,setupsNumber){
    const machine=new Machine({
        PN:pn,
        KeyMachine:'3 Axis',
        SetUpsNumber:setupsNumber
    });
    return machine;
}
function creatiMachine4(pn,setupsNumber){
    const machine=new Machine({
        PN:pn,
        KeyMachine:'4 Axis',
        SetUpsNumber:setupsNumber
    });
    return machine;

}
function creatiMachine5(pn,setupsNumber){
    const machine=new Machine({
        PN:pn,
        KeyMachine:'5 Axis',
        SetUpsNumber:setupsNumber
    });
    return machine;
}

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
                    }
                    
                   if (circelObj.AbsulteAxisB=='Y') {
                            newArr = docs.filter(function (e) {
                                return e.A.x === x && e.A.z === z;
                            });
                    }

                    if (circelObj.AbsulteAxisB=='Z') 
                    {   
                        newArr = docs.filter(function (e) {
                            return e.A.y === y && e.A.x === x;
                        });
                    }

                    if(newArr.length>0){
                        let circleArr=newArr;
                        //# 1 action in the actionarray. meanning: type is RADIUS its possible both ways.
                        if(circleArr.length==1){
                            isPossibleBoth=true;
                            type='RADIUS';
                            direction=circleArr[0].AxisB;
                            maxRadius=circleArr[0].Radius;
                        }
                     else{
                             //# more then one action. checking if all in the same side of the model with the middle point. if yes : BLINDHOLE.                            
                            maxRadius=Math.max(...circleArr.map(o => o.Radius));
                            let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});      
                            isPossibleBoth=MaxRadiusArr.length==circleArr.length?true:false;
                            if(isPossibleBoth==false){
                               let group1=MaxRadiusArr.filter(e=>{if(e.AxisB==MaxRadiusArr[0].AxisB) return e;});
                               let group2=MaxRadiusArr.filter(e=>{if(group1.includes(e)==false) return e;});
                               direction=group1.length>group2.length?group1[0].AxisB:group2[0].AxisB;
                            }
                            else{                                   
                               direction=MaxRadiusArr[0].AxisB;
                            }
                            type=isPossibleBoth==true?'HOLE':'CBOR';
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
    CalculateAroundAxisNumber,
    CalculateKetMachineOptions,
    ClearDB,
};
