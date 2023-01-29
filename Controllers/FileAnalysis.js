const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Utilities");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
const Part = require("../Model/Part");
const e = require("express");
const Bounding = require("../Model/BoundingInfo");
const Machine = require("../Model/SetUp");
const values = require("../SavedValues.json");
const PartCalculation = require("../Model/PartCalculation");
const CalcController = require("../Controllers/FileAnalysis");

const AroundAxis = require("../Model/AroundAxis");

var passCircelArr = [];
var featIndex=0;



const CalculatePart=(part)=>
    new Promise(async resolve =>{
        let partData = fs.readFileSync(part.FilePath, "utf8").split("\r\n");                   
        
        const circlesArr = await CalcController.GetCirclesArr(partData, pn,part.BoundingBox.MiddlePoint);
        saveAll(circlesArr);
        const featsArr = await CalcController.GetFeatArr(circlesArr,pn,part.BoundingBox);
        saveAll(featsArr);
        const directionArr = await CalcController.GetDirectionsArr(featsArr,pn,part.BoundingBox);
        saveAll(directionArr);
        // const FiltteredDirectionArr = await CalcController.ReduceDirections(directionArr,pn,bounding);
        //const aroundAxisNumber = await CalcController.CalculateAroundAxisNumber(directionArr,pn,part.BoundingBox);
        const AroundAxisArr = await CalcController.GetAroundAxis(directionArr,pn);
        saveAll(AroundAxisArr);

        const obj={
            PN:pn,
            directions:directionArr,
            complexityLevel:complexity,
            aroundAxis:AroundAxisArr
        };

        const machineArr = await CalcController.CalculateKeyMachineOptions(obj);
        saveAll(machineArr);

        //## Calc how many feats in part.
        let totalFeats=0;
        directionArr.map((d) =>totalFeats+=d.NumberOfFeat);

        //## Print the direction string
        let directionString=GetAsString(directionArr);
        let ms=directionArr.length;

        //## Print the correct sate
        if(ms!=originMs) {mistakeRange++;
            mistakeList.push(pn);
        }

        const Calculation= new PartCalculation({
            PN:pn,
            Index:index,
            MD:directionArr.length,
            FeatursNumber:totalFeats,
            AroundAxisNumber:aroundAxisNumber,
            AroundAxises:aroundAxisNumber
        });


        var part = Part({
            PN: pn,
            index: index,
            FilePath: path,
            Directions:directionArr,
            DirectionStr:directionString,
            MS:ms,
            OriginalMS:originMs,
            FeatursNumber:totalFeats,
            BoundingBox:bounding,
            AroundAxisNumber:aroundAxisNumber,
            ComplexityLevel:complexity,
            MachineOptions:machineArr,
        });
        resolve(circleArr);
});

const CalculateKeyProductionProcesses=(obj)=>
new Promise(async resolve =>{

    let pn=obj.PN;
    let directionArr=obj.directions;
    let complexity=obj.complexityLevel;
    let aroundAxisNumber=obj.aroundAxis;
    let msNumber=directionArr.length;
    // let machineOptions=[];
    let Options=[];

    // const option = new KeyProcessesOption({
    //     PN:pn,

    // });
    //KeyProcessesOptionSchema
    
    if(msNumber<=2)
    {       
        let Processes=[];
        const productionProcess=new ProductionProcesses ({
                ProcessName:'Finishing',
                Type:'Key',
                Machine:'3 Axis',
        });
        Processes.push(productionProcess);

        const option = new KeyProcessesOption({
            PN:pn,
            Processes:Processes,
            KeyMachine:'3 Axis'
        });
        Options.push(option);
    // resolve(machineOptions);
    }
    else{
        // # MD = 2+
        //complexity 3 : Low      
        if(complexity==3)
        {            

            if(aroundAxisNumber==1){

                //let machine3=creatiMachine3(pn,msNumber);

                let Processes=[];
                for(let i=0;i<msNumber;i++){
                    const productionProcess=new ProductionProcesses ({
                        ProcessName:'Finishing',
                        Type:'Key',
                        Machine:'3 Axis',
                    });
                    Processes.push(productionProcess);

                }
                const option = new KeyProcessesOption({
                    PN:pn,
                    Processes:Processes,
                    KeyMachine:'3 Axis'
                });
                Options.push(option);

                // let machine4=creatiMachine4(pn,1);




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

//-------------MAIN FUNCTION----------------------------------------------

const GetAroundAxis=(directionArr,pn)=>
    new Promise(async resolve =>{
        
        let absDirctionList=[];
        let result=0;
        let aroundAxisObjects=[];
        
        directionArr.map((doc) => {
            if(!absDirctionList.includes(doc.AbsAxis)){
                absDirctionList.push(doc.AbsAxis);
            }
        });

        if(absDirctionList.length<=2) {
            const axisObj=new AroundAxis({
                PN:pn,
                Directions:directionArr,
                NumberOfMD:directionArr.length
            });
            aroundAxisObjects.push(axisObj);
        }

        if(absDirctionList.length==3) {

            let abs1=absDirctionList[0];
            let direction1=directionArr.filter((e)=>{
                if(e.AbsulteAxisB==abs1) return e;
            });
            let direction2=directionArr.filter((e)=>{
                if(e.AbsulteAxisB!=abs1) return e;
            });

            const axisObj1=new AroundAxis({
                PN:pn,
                Directions:direction1,
                NumberOfMD:direction1.length
            });
            const axisObj2=new AroundAxis({
                PN:pn,
                Directions:direction2,
                NumberOfMD:direction2.length
            });
            aroundAxisObjects.push(axisObj1);
            aroundAxisObjects.push(axisObj2);

        
        }
        
        if(absDirctionList.length>3){ 

            let abs1=absDirctionList[0];
            let abs2=absDirctionList[1];

            let direction1=directionArr.filter((e)=>{
                if(e.AbsulteAxisB==abs1) return e;
            });
            let direction2=directionArr.filter((e)=>{
                if(e.AbsulteAxisB==abs2) return e;
            });
            let direction3=directionArr.filter((e)=>{
                if(e.AbsulteAxisB!=abs2 &&e.AbsulteAxisB!=abs1 ) return e;
            });

            const axisObj1=new AroundAxis({
                PN:pn,
                Directions:direction1,
                NumberOfMD:direction1.length
            });
            const axisObj2=new AroundAxis({
                PN:pn,
                Directions:direction2,
                NumberOfMD:direction2.length
            });
            const axisObj3=new AroundAxis({
                PN:pn,
                Directions:direction3,
                NumberOfMD:direction3.length
            });
            aroundAxisObjects.push(axisObj1);
            aroundAxisObjects.push(axisObj2);
            aroundAxisObjects.push(axisObj3);
        }
        
    resolve(aroundAxisObjects);
});

//(01)
const GetCirclesArr=(tableFile,pn,middlePoint)=>
    new Promise(async resolve =>{
    var circleArr=[];
    var dictionary =[];

    let filteredArr=tableFile.filter(e=>{
        let r=e.split(" ");
        return r[2]==="CIRCLE";
    });

    for(el of filteredArr){        
        var row = el.split(" ");
        const response= await CreateCircel(row, tableFile, pn,middlePoint);
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
const GetBounding=(pn,fullTable,W,L,H)=>
    new Promise(async resolve =>{


        let w=parseFloat(W);
        let l=parseFloat(L);
        let h=parseFloat(H);

        let arrayX=[];
        let arrayY=[];
        let arrayZ=[];
        let isInc=false;

        let WAxis='Y';
        let LAxis='X';
        let HAxis='Z';

        let extraW=w;
        let extraL=l;
        let extraH=h;

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

            if(Math.abs(x)>extraW && Math.abs(x)>extraL && Math.abs(x)>extraH || Math.abs(y)>extraW && Math.abs(y)>extraL && Math.abs(y)>extraH || Math.abs(z)>extraW && Math.abs(z)>extraL && Math.abs(z)>extraH){

                //console.log("Passed point not in the limitetion");
            }
            else{

                arrayX.push(x);
                arrayY.push(y);
                arrayZ.push(z);
            }
        }
        
        let MaxXStep = parseFloat(Math.max(...arrayX));
        let MinXStep = parseFloat(Math.min(...arrayX));
        let MaxYStep = parseFloat(Math.max(...arrayY));
        let MinYStep = parseFloat(Math.min(...arrayY));
        let MaxZStep = parseFloat(Math.max(...arrayZ));
        let MinZStep = parseFloat(Math.min(...arrayZ));

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
    
        let MiddleX=(MinX+MaxX)/2;
        let MiddleY=(MinY+MaxY)/2;
        let MiddleZ=(MinZ+MaxZ)/2;


        if(LAxis=='X'){
            if((MaxX-MinX)*25.4<l+10){
                isInc=true;
            }
        }
        else{
            if(LAxis=='Y'){
                if((MaxY-MinY)*25.4<l+10){
                    isInc=true;
                }
            }
            else{
                if(LAxis=='Z'){
                    if((MaxZ-MinZ)*25.4<l+10){
                        isInc=true;
                    }
                }
            }
        }

        //Max and Min are the same with diffrent sign (pos/neg)

        const mmBuffer= 3;
        const incBuffer= mmBuffer*25.4;

        //Middle is Close to the Min/Max
        if(isInc==false){        
            MiddleX = Math.abs(MaxX-xTotal/2)<=5 ||  Math.abs(MinX-xTotal/2)<=5 ? 0: MiddleX;
            MiddleY = Math.abs(MaxY-yTotal/2)<=5 ||  Math.abs(MinY-yTotal/2)<=5 ? 0: MiddleY;
            MiddleZ = Math.abs(MaxZ-zTotal/2)<=5 ||  Math.abs(MinZ-zTotal/2)<=5 ? 0: MiddleZ;
        }
        else{
            MiddleX = Math.abs(MaxX-xTotal/2)<=incBuffer ||  Math.abs(MinX-xTotal/2)<=incBuffer ? 0: MiddleX;
            MiddleY = Math.abs(MaxY-yTotal/2)<=incBuffer ||  Math.abs(MinY-yTotal/2)<=incBuffer ? 0: MiddleY;
            MiddleZ = Math.abs(MaxZ-zTotal/2)<=incBuffer ||  Math.abs(MinZ-zTotal/2)<=incBuffer ? 0: MiddleZ;
        }

        const point= new Point({
            x:MiddleX,
            y:MiddleY,
            z:MiddleZ,
        });

        // # Calculating real middlePoint --------
        const bounding = new Bounding({
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

    if(bounding.L>values.MaxHeightTool) {
     
        let filltered2=filltered.filter((item) =>{if(item.DirectionAxis==negativeH) return item;});
        if(filltered2.length==0){
            let directionObj=await CreateDirectionObject(negativeH,pn,emptyList);
            filltered.push(directionObj);
        }

        let filltered3=filltered.filter((item) =>{if(item.DirectionAxis==positiveH) return item;});
        if(filltered3.length==0){
           let directionObj=await CreateDirectionObject(positiveH,pn,emptyList);
            filltered.push(directionObj);
        }
    }
    
    // ## High Sides to Machine
    if(bounding.High>values.MaxHeightTool){
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

    if(filltered.length==1){
        if(filltered[0].DirectionAxis!=negativeH){
            let directionObj=await CreateDirectionObject(negativeH,pn,emptyList);
            filltered.push(directionObj);

        }
        else{
            if(filltered[0].DirectionAxis!=positiveH){
                let directionObj=await CreateDirectionObject(positiveH,pn,emptyList);
                filltered.push(directionObj);

            }
        }
    }

    //----------Reduce    
    resolve(filltered);
});


const ReduceDirections=(DirectionArr,pn,bounding)=>
new Promise(async resolve =>{
       
    const AxisX=DirectionArr.filter((e)=>{if(e.AbsAxis=='X') return e;});
    const AxisY=DirectionArr.filter((e)=>{if(e.AbsAxis=='Y') return e;});
    const AxisZ=DirectionArr.filter((e)=>{if(e.AbsAxis=='Z') return e;});

        if(AxisX.length>1){
          
          
            const AxisXBlockedFeatsGroup1 =await Feat.find({ PN:pn,AxisB: 'X',IsPossibleAbsDirection:false}).exec();
            const AxisXBlockedFeatsGroup2 =await Feat.find({ PN:pn,AxisB: '-X',IsPossibleAbsDirection:false}).exec();

           if(AxisXBlockedFeatsGroup1.length>1 && AxisXBlockedFeatsGroup2.length>1){
            // console.log("Axis X is blocked");
           }
           else{

            // console.log("Can Remove X direction")

            }
        }
        if(AxisY.length>1){
              const AxisXBlockedFeatsGroup1 =await Feat.find({ PN:pn,AxisB: 'Y',IsPossibleAbsDirection:false}).exec();
            const AxisXBlockedFeatsGroup2 =await Feat.find({ PN:pn,AxisB: '-Y',IsPossibleAbsDirection:false}).exec();

            if(AxisXBlockedFeatsGroup1.length>1 && AxisXBlockedFeatsGroup2.length>1){
            //  console.log("Axis Y is blocked");
            }
            else{
 
             console.log("Can Remove Y direction")
         }
        }

         if(AxisZ.length>1){
            const AxisXBlockedFeatsGroup1 =await Feat.find({ PN:pn,AxisB: 'Z',IsPossibleAbsDirection:false}).exec();
            const AxisXBlockedFeatsGroup2 =await Feat.find({ PN:pn,AxisB: '-Z',IsPossibleAbsDirection:false}).exec();
            if(AxisXBlockedFeatsGroup1.length>1 && AxisXBlockedFeatsGroup2.length>1){
            //  console.log("Axis Z is blocked");
            }
            else{
             console.log("Can Remove Z direction")
         }
        }
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
const CalculateKeyMachineOptions=(obj)=>
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
const CreateCircel=(rowArr,fileArr,pn,middlePoint)=>
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
                                                circel.AxisB = GetCircelAxisB(circel,middlePoint);
                                                circel.AbsulteAxisB = GetGenCircelAxisB(circel);
                                                // circel.AxisC = GetCircelAxisC(circel);
                                                // circel.AbsulteAxisC = GetGenCircelAxisC(circel);
                                                circel.IsComplex=IsComolexCircle(circel);

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
            var middlePoint=bounding.MiddlePoint;
            let HasOneDirection;
            let HasOneRadisSize;
            let isPossibleBoth;
            let maxRadius;
            let type;
            let direction;
        
            var newArr = [];
            var sortedArray=[];
            if (passCircelArr.includes(id)) resolve(null);
            
            else {
                
                if(circelObj.IsComplex==true){
                    newArr = docs.filter(function (e) {
                        return e.A.y === y && e.A.z === z || e.A.x === x && e.A.z === z || e.A.y === y && e.A.x === x;
                    });
                    
                    if(circelObj.AbsulteAxisB=='X'){
                        sortedArray=newArr.sort((item)=>item.A.x);
                    }
                    if(circelObj.AbsulteAxisB=='Y'){
                        sortedArray=newArr.sort((item)=>item.A.y);
                    }
                    if(circelObj.AbsulteAxisB=='Z'){
                        sortedArray=newArr.sort((item)=>item.A.z);
                    }
                }

                else{
                    if (circelObj.AbsulteAxisB=='X') {
                        newArr = docs.filter(function (e) {
                            return e.A.y === y && e.A.z === z;
                        });
                        sortedArray=newArr.sort((item1,item2)=>item1.A.x-item2.A.x);

                    }
                    
                   if (circelObj.AbsulteAxisB=='Y') {
                            newArr = docs.filter(function (e) {
                                return e.A.x === x && e.A.z === z;
                            });
                    sortedArray=newArr.sort((item1,item2)=>item1.A.y-item2.A.y);

                    }

                    if (circelObj.AbsulteAxisB=='Z') 
                    {   
                        newArr = docs.filter(function (e) {
                            return e.A.y === y && e.A.x === x;
                        });
                    sortedArray=newArr.sort((item1,item2)=>item1.A.z-item2.A.z);
                    }
                }

                if(newArr.length>0){
                    let circleArr=newArr;

                    // Does MaxRadiusGroup.Count >1 ?
                    if(circleArr.length==1){
                        isPossibleBoth=true;
                        type='RADIUS';
                        // direction=circleArr[0].AxisB;
                        direction=getFeatDirect(circleArr[0],circleArr[0].AxisB,middlePoint);
                        maxRadius=circleArr[0].Radius;
                    }
                    
                    else{
                        maxRadius=Math.max(...circleArr.map(o => o.Radius));
                        let MaxRadiusArr=circleArr.filter(e=>{return e.Radius==maxRadius});
                        
                        let group1=MaxRadiusArr.filter(e=>{if(e.AxisB==MaxRadiusArr[0].AxisB) return e;});
                        let group2=MaxRadiusArr.filter(e=>{if(group1.includes(e)==false) return e;});

                        // Does all MaxRadiusGroup has same direction?
                        if(group2.length==0){
                            // Does all FeatureGroup has same radius size?
                            if(MaxRadiusArr.length==circleArr.length)
                            {
                                HasOneDirection=true;
                                HasOneRadisSize=true;
                                isPossibleBoth=false;
                                maxRadius=circleArr[0].Radius;
                                type='BHOLE';
                                //  direction=MaxRadiusArr[0].AxisB;
                                direction=getFeatDirect(MaxRadiusArr[0],MaxRadiusArr[0].AxisB,middlePoint);

                            }
                            else{

                                HasOneDirection=true;
                                HasOneRadisSize=false;
                                isPossibleBoth=false;
                                maxRadius=MaxRadiusArr[0].Radius;
                                type='CBOR';
                                // direction=MaxRadiusArr[0].AxisB;
                                direction=getFeatDirect(MaxRadiusArr[0],MaxRadiusArr[0].AxisB,middlePoint);

                            }
                        }
                        else{
                            // MaxRadiusGroupPositive.count = MaxRadiusGroup.Negative.count  ?
                            if(group1.length==group2.length){
                                
                                // Does all FeatureGroup has same radius size?
                                if(MaxRadiusArr.length==circleArr.length)
                                {

                                    HasOneDirection=false;
                                    HasOneRadisSize=true;
                                    isPossibleBoth=false;
                                    maxRadius=MaxRadiusArr[0].Radius;
                                    type='HOLE';
                                    // direction=MaxRadiusArr[0].AxisB;
                                    direction=getFeatDirect(sortedArray[0],sortedArray[0].AxisB,middlePoint);

                                }
                                else{
                                    let featGroup1=sortedArray.filter(e=>{if(e.AxisB==group1[0].AxisB) return e;});
                                    let featGroup2=sortedArray.filter(e=>{if(featGroup1.includes(e)==false) return e;});
            

                                    // FeatureGroupPositive.count > FeatureGroupNegative.count ?
                                    if(featGroup1.length>featGroup2.length){
                                   
                                        HasOneDirection=false;
                                        HasOneRadisSize=false;
                                        isPossibleBoth=false;
                                        maxRadius=featGroup1[featGroup1.length-1].Radius;
                                        type='OTHER';
                                        // direction=featGroup1[0].AxisB;
                                        direction=getFeatDirect(featGroup1[0],featGroup1[0].AxisB,middlePoint);

                                    }
                                    else{
                                        HasOneDirection=false;
                                        HasOneRadisSize=false;
                                        isPossibleBoth=false;
                                        maxRadius=featGroup2[featGroup2.length-1].Radius;
                                        type='OTHER';
                                        direction=getFeatDirect(featGroup2[0],featGroup2[0].AxisB,middlePoint);
                                    }
                                    
                                }
                            }
                            else{
                                if(group1.length>group2.length){

                                    HasOneDirection=false;
                                    HasOneRadisSize=false;
                                    isPossibleBoth=false;
                                    maxRadius=group1[0].Radius;
                                    type='CBOR';
                                    //direction=group1[0].AxisB;
                                    direction=getFeatDirect(group1[0],group1[0].AxisB,middlePoint);

                                }
                                else{
                                    HasOneDirection=false;
                                    HasOneRadisSize=false;
                                    isPossibleBoth=false;
                                    maxRadius=group2[0].Radius;
                                    type='CBOR';
                                    //direction=group2[0].AxisB;
                                    direction=getFeatDirect(group2[0],group2[0].AxisB,middlePoint);

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

function getFeatDirect(circle,AxisB,MiddlePoint){

let direction='';
    if(AxisB=='X' || AxisB=='-X'){
        direction=circle.A.x>MiddlePoint.x?'X':'-X';
    }
    if(AxisB=='Y' || AxisB=='-Y'){
        direction=circle.A.y>MiddlePoint.y?'Y':'-Y';

    }
    if(AxisB=='Z' || AxisB=='-Z'){
        direction=circle.A.z>MiddlePoint.z?'Z':'-Z';
    }
    if(direction ==''){
        direction=AxisB;
    }
return direction;


}

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
            axis = "Y";}
        else {
            if (circel.B.z == 1 || circel.B.z == -1) {
                axis = "Z";
            }
        }
    }
    if(axis == "") {
        if(circel.B.x==0){
            axis='X';
        }
        else{
            if(circel.B.y==0){
                axis='Y';
            }
            else{
                if(circel.B.z==0){
                    axis='Z';
                }
                else{
                    axis='Compound';
                }
            }
        }
    }
    return axis;
}

function IsComolexCircle(circel) {
    var axis = "";
    if (circel.B.x == 1 || circel.B.x == -1) {
        axis = "X";
    }
    else {
        if (circel.B.y == 1 || circel.B.y == -1) {
            axis = "Y";}
        else {
            if (circel.B.z == 1 || circel.B.z == -1) {
                axis = "Z";
            }
        }
    }
    if(axis == "") {
     return true;
    }
    else{
        return false;
    }
    
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
    CalculatePart,
    GetAroundAxis,
    GetCirclesArr,
    GetFeatArr,
    GetDirectionsArr,
    GetMSPart,
    GetBounding,
    ReduceDirections,
    CalculateAroundAxisNumber,
    CalculateKeyMachineOptions,
    ClearDB,
};
