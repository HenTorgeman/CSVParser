const Circel = require("../Model/Circel");
const Point = require("../Model/Point");
const fileUtilit = require("../Utilities");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
const fs = require("fs");

const AroundAxis = require("../Model/AroundAxis");
const Machine = require("../Model/SetUp");
const values = require("../Files/SavedValues.json");
const PartCalculation = require("../Model/PartCalculation");
const PartAcssesability = require("../Model/PartAcssesability");
const ProductionProcessesController = require("./ProductionProcesses");

const PriceAlgorithmController = require("./Calculation");

var passCircelArr = [];
var featIndex=0;

//------------Accsesability-----------------------------------------
const CalculatePartAccsesability=(part)=>
    new Promise(async resolve =>{
    const calculation = part.PartCalculation;
    if(part.FilePath=='not valid path to file') resolve(null);
    else{
    let featursNumber=calculation.FeatursNumber;
    let partData=fs.readFileSync(part.FilePath, "utf8").split("\r\n");
    let stepRowsCount=partData.length;

    const maximumCircleRadius=await GetPartMaxRadius(part.PN);
    const minCircleRadius=await GetPartMinRadius(part.PN);
    const maximumDistance=await GetPartMaximumDistanceBetweenFeateures(part.PN);
    const minimumDistance=await GetPartMinimumDistanceBetweenFeateures(part.PN);

    const acssesability=new PartAcssesability({
       PartNumber:part.PN,
       FeatursNumber:featursNumber,
       StepRowsCount:stepRowsCount,
       MaximumCircleRadius:maximumCircleRadius,
       MinimumCircleRadius:minCircleRadius,
       MaximumDistanceBetweenCircles:maximumDistance,
       MinimumDistanceBetweenCircles:minimumDistance
    });
    resolve(acssesability);
}
        
});

//-------------Accsesability Funstions-------------------------------------
const GetPartMaxRadius=(pn)=>
new Promise(async resolve =>{
    const circles =await Circel.find({ PN:pn}).exec();
    const max = Math.max(...circles.map(o => o.Radius))
    resolve(max);
})
const GetPartMinRadius=(pn)=>
new Promise(async resolve =>{
    const circles =await Circel.find({ PN:pn}).exec();
    const min = Math.min(...circles.map(o => o.Radius))
    resolve(min);
})


const GetPartMinimumDistanceBetweenFeateures=(pn)=>
new Promise(async resolve =>{
    let partDistance=99999999;
    const feats =await Feat.find({ PN:pn}).exec();
    if(feats.length==0) resolve(null);

        for(let i=0;i<feats.length;i++){
            let feat1=feats[i];
            for(let j=0;j<feats.length;j++){
                if(j!=i){
                    let feat2=feats[j];
                    if(feat1!=undefined && feat2!=undefined){
                        if(feat1.circels.length>0 && feat2.circels.length>0){
        
                        let circles1=feat1.circels[0];
                        let circles2=feat2.circels[0];

                        if(circles1!=undefined && circles2!=undefined){
                            let x1=circles1.A.x;
                            let x2=circles2.A.x;
                            let y1=circles1.A.y;
                            let y2=circles2.A.y;
                            let z1=circles1.A.z;
                            let z2=circles2.A.z;

                            let distance=(Math.pow(x1-x2,2))+(Math.pow(y1-y2,2))+(Math.pow(z1-z2,2));
                            distance=Math.sqrt(distance);

                            if(distance<partDistance){
                                partDistance=distance;
                            }
                        }
                    }    
                }
            }
        }       
    }
resolve(partDistance);
});

const GetPartMaximumDistanceBetweenFeateures=(pn)=>
        new Promise(async resolve =>{
        let partDistance=1;

        const feats =await Feat.find({ PN:pn}).exec();
        if(feats.length==0) resolve(null);

            for(let i=0;i<feats.length;i++){
                let feat1=feats[i];
                for(let j=0;j<feats.length;j++){
                    if(j!=i){
                        let feat2=feats[j];
                        if(feat1!=undefined && feat2!=undefined){
                            if(feat1.circels.length>0 && feat2.circels.length>0){
            
                            let circles1=feat1.circels[0];
                            let circles2=feat2.circels[0];
        
                            if(circles1!=undefined && circles2!=undefined){
                                let x1=circles1.A.x;
                                let x2=circles2.A.x;
                                let y1=circles1.A.y;
                                let y2=circles2.A.y;
                                let z1=circles1.A.z;
                                let z2=circles2.A.z;
        
                                let distance=(Math.pow(x1-x2,2))+(Math.pow(y1-y2,2))+(Math.pow(z1-z2,2));
                                distance=Math.sqrt(distance);
        
                                if(distance>=partDistance){
                                    partDistance=distance;
                                }
                            }
                        }    
                    }
                }
            }       
        }
    resolve(partDistance);
});

//------------Key Machine Processes-----------------------------------------

const CalculateKeyMachineProcesses=(part)=>
    new Promise(async resolve =>{

     
        if(part.FilePath=='not valid path to file') resolve(null);
        else{
            let partData =fs.readFileSync(part.FilePath, "utf8").split("\r\n");
            const circlesArr = await GetCirclesArr(partData, part.PN,part.BoundingInfo.MiddlePoint);
            SaveAll(circlesArr);
            const featsArr = await GetFeatArr(circlesArr,part.PN,part.BoundingInfo);
            SaveAll(featsArr);
            const directionArr = await GetDirectionsArr(featsArr,part.PN,part.BoundingInfo);
            SaveAll(directionArr);
            const AroundAxisArr = await GetAroundAxis(directionArr,part.PN);
            SaveAll(AroundAxisArr);
            const partUnit = await GetStepUnit(part.BoundingInfo,partData);            
            let totalFeats=0;
            directionArr.map((d) =>totalFeats+=d.NumberOfFeat);
            let directionString=GetAsString(directionArr);

            const CalcKeyProductionObj={
                PN:part.PN,
                directions:directionArr,
                complexityLevel:part.ComplexityLevel,
                aroundAxis:AroundAxisArr
            };

            const finishingSetupTimePerCM = await PriceAlgorithmController.GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.SurfaceGroup,'Finishing');
            const semifinishingSetupTimePerCM = await PriceAlgorithmController.GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.SurfaceGroup,'Semi-finishing');

            const surface=part.BoundingInfo.Surface;
            const surfaceCm=(surface/values.UnitConvert.Mm2ToCm2);
            const finishingTimeMinutes=(surfaceCm/finishingSetupTimePerCM)+(surfaceCm/semifinishingSetupTimePerCM);

            const ProductionOptions = await CalculateKeyProductionProcesses(CalcKeyProductionObj,finishingTimeMinutes);
            const lowerOption = await SelectLowerOption(ProductionOptions,part.PartInfo.KeyMachine);
            const keyProcesses=[];

            if(lowerOption!=null){

            for(let i=0;i<lowerOption.Processes.length;i++){
                let process=lowerOption.Processes[i];
                keyProcesses.push(process);
            }
        }
    
        const Calculation= new PartCalculation({
            PN:part.PN,
            MD:directionArr.length,
            DirectionStr:directionString,
            FeatursNumber:totalFeats,
            AroundAxisNumber:AroundAxisArr.length,
            AroundAxises:AroundAxisArr,
            KeyProductionProcesses:keyProcesses,
            IsInch:partUnit
        });    

        resolve(Calculation);
    }
        
});

const CalculateKeyProductionProcesses=(obj,finishingTime)=>
new Promise(async resolve =>{

    let pn=obj.PN;
    let directionArr=obj.directions;
    let complexity=obj.complexityLevel;
    let aroundAxisNumber=obj.aroundAxis.length;
    let msNumber=directionArr.length;
    let Options=[];
    
    if(msNumber<=2)
    {       
        let Processes=[];
        let process= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,2);
        Processes.push(process);

        let option= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes);
        Options.push(option);
    }
    else{
        if(complexity==3)
        {            
            if(aroundAxisNumber==1){
                let Processes3Axis=[];
                let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,msNumber);

                Processes3Axis.push(process3Axis);
                let option= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
                Options.push(option);

                let Processes4Axis=[];
                let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,1);

                Processes4Axis.push(process4Axis);
                let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                Options.push(option4Axis);


            }
            if(aroundAxisNumber==2){
                //Option 1 3 Axis  -> machine3=creatiMachine3(pn,msNumber);
                let Processes3Axis=[];
                let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,msNumber);

                Processes3Axis.push(process3Axis);
                let option3Axis= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
                Options.push(option3Axis);

                //Option 2 : 4 Axis * 2 -> machine4=creatiMachine4(pn,2);
                if(obj.aroundAxis[1].Directions.length>2){
                    let Processes4Axis=[];
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,2);

                    Processes4Axis.push(process4Axis);
                    let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                    Options.push(option4Axis);
    
                }
                 //Option 2.1 : 4 Axis*1 3 Axis*msNumber
                else{
                    let Processes3Axis=[];
                    let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime/2,obj.aroundAxis[1].Directions.length);
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime/2,1);

                    Processes3Axis.push(process3Axis);
                    Processes3Axis.push(process4Axis);

                    let option3Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes3Axis);
                    Options.push(option3Axis);
                }
            
                 //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);
                 let Processes5Axis=[];
                 let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                 Processes5Axis.push(process5Axis);
                 let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                 Options.push(option5Axis);
            
            }
            if(aroundAxisNumber==3){
            //Option 1 3 Axis  -> machine3=creatiMachine3(pn,msNumber);
            let Processes3Axis=[];
            let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,msNumber);
            Processes3Axis.push(process3Axis);
            let option3Axis= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
            Options.push(option3Axis);

                //Option 2 : 4 Axis * 2 -> machine4=creatiMachine4(pn,2);   
                if(obj.aroundAxis[2].Directions.length>2){
                    let Processes4Axis=[];
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,3);
                    Processes4Axis.push(process4Axis);
                    let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                    Options.push(option4Axis);
                }
                 //Option 2.1 : 4 Axis*1 3 Axis*msNumber
                else{
                    let Processes3Axis=[];
                    let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime/3,obj.aroundAxis[2].Directions.length);
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',((finishingTime/3)*2),2);
                  
                    Processes3Axis.push(process3Axis);
                    Processes3Axis.push(process4Axis);
                    let option3Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes3Axis);
                    Options.push(option3Axis);
                }
            
                 //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);
                 let Processes5Axis=[];
                 let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                 Processes5Axis.push(process5Axis);
                 let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                 Options.push(option5Axis);
            }
        }
        //complexity 2 : Medium
        if(complexity==2)
        {            

            if(aroundAxisNumber==1){
                //let machine3=creatiMachine3(pn,msNumber);
                let Processes3Axis=[];
                let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,msNumber);
                Processes3Axis.push(process3Axis);
                let option= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
                Options.push(option);

                // let machine4=creatiMachine4(pn,1);

                let Processes4Axis=[];
                let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,1);
                Processes4Axis.push(process4Axis);
                let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                Options.push(option4Axis);            
            }
            if(aroundAxisNumber==2){
                //Option 1 3 Axis  -> machine3=creatiMachine3(pn,msNumber);
                let Processes3Axis=[];
                let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime,msNumber);
                Processes3Axis.push(process3Axis);
                let option3Axis= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
                Options.push(option3Axis);

                //Option 2 : 4 Axis * 2 -> machine4=creatiMachine4(pn,2);   
                if(obj.aroundAxis[1].Directions.length>2){
                    let Processes4Axis=[];
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,2);
                    Processes4Axis.push(process4Axis);
                    let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                    Options.push(option4Axis);
    
                }
                 //Option 2.1 : 4 Axis*1 3 Axis*msNumber
                else{
                    let Processes3Axis=[];
                    let process3Axis= ProductionProcessesController.Create3AxisProcess('Finishing',finishingTime/2,obj.aroundAxis[1].Directions.length);
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime/2,1);
                    Processes3Axis.push(process3Axis);
                    Processes3Axis.push(process4Axis);
                    let option3Axis= ProductionProcessesController.CreateOption(pn,'3 Axis',Processes3Axis);
                    Options.push(option3Axis);
                }
            
                 //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);
                 let Processes5Axis=[];
                 let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                 Processes5Axis.push(process5Axis);
                 let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                 Options.push(option5Axis);

            }
            if(aroundAxisNumber==3){    
                //Option 2 : 4 Axis * 2 -> machine4=creatiMachine4(pn,2);   
                    let Processes4Axis=[];
                    let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,3);
                    Processes4Axis.push(process4Axis);
                    let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                    Options.push(option4Axis);
            
                 //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);

                 let Processes5Axis=[];
                 let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                 Processes5Axis.push(process5Axis);
                 let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                 Options.push(option5Axis);
                
            }
        }
        //complexity 1 : High || 0 : Very High
        if(complexity<=1)
        {            
            if(aroundAxisNumber==1){

                //Option 2 : 4 Axis * 2 -> machine4=creatiMachine4(pn,2);   
                let Processes4Axis=[];
                let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,1);
                Processes4Axis.push(process4Axis);
                let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                Options.push(option4Axis);

                //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);

                let Processes5Axis=[];
                let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                Processes5Axis.push(process5Axis);
                let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                Options.push(option5Axis);

            }
            if(aroundAxisNumber==2){                
                let Processes4Axis=[];
                let process4Axis= ProductionProcessesController.Create4AxisProcess('Finishing',finishingTime,2);
                Processes4Axis.push(process4Axis);
                let option4Axis= ProductionProcessesController.CreateOption(pn,'4 Axis',Processes4Axis);
                Options.push(option4Axis);
        
             //Option 5 : 5 Axis *1 -> machine5=creatiMachine5(pn,1);

                let Processes5Axis=[];
                let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                Processes5Axis.push(process5Axis);
                let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                Options.push(option5Axis);
            }
            if(aroundAxisNumber==3){    
                let Processes5Axis=[];
                let process5Axis= ProductionProcessesController.Create5AxisProcess('Finishing',finishingTime,1);
                Processes5Axis.push(process5Axis);
                let option5Axis= ProductionProcessesController.CreateOption(pn,'5 Axis',Processes5Axis);
                Options.push(option5Axis);
            }
        }
    }

    for(let i=0;i<Options.length;i++){
        let op=Options[i];
        let cost=0;
        for(let j=0;j<op.Processes.length;j++){
            let proc=op.Processes[j];
            cost+=proc.Cost;
        }

        Options[i].Cost=cost;
    }

    resolve(Options)

});

const SelectLowerOption=(ProductionOptions,keyMachine)=>
new Promise(async resolve =>{
    let productionProcessKeyMachine=[];
    if(ProductionOptions.length==1) resolve(ProductionOptions[0]);
    else{
        if(keyMachine=="-"){
            productionProcessKeyMachine=ProductionOptions;
        }
        else{
             productionProcessKeyMachine=ProductionOptions.filter((op)=>{
                if(op.KeyMachine==keyMachine) return op;
            });
        }   
    let lowerOption=Math.min(...productionProcessKeyMachine.map(item => item.Cost));

    let SelectedOption=ProductionOptions.filter((op)=>{
        if(op.Cost==lowerOption) return op;
    });
    resolve(SelectedOption[0]);
}
});

//-------------Files Functions----------------------------------------------

const GetAroundAxis=(directionArr,pn)=>
    new Promise(async resolve =>{
        
        let absDirctionList=[];
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
                if(e.AbsAxis==abs1) return e;
            });
            let direction2=directionArr.filter((e)=>{
                if(e.AbsAxis!=abs1) return e;
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
            if(direction1.length>direction2.length){
                aroundAxisObjects[0]=axisObj1;
                aroundAxisObjects[1]=axisObj2;
            }
            else{
                aroundAxisObjects[0]=axisObj2;
                aroundAxisObjects[1]=axisObj1;
            }
        }
        
        if(absDirctionList.length>3){ 

            let abs1=absDirctionList[0];
            let abs2=absDirctionList[1];

            let direction1=directionArr.filter((e)=>{
                if(e.AbsAxis==abs1) return e;
            });
            let direction2=directionArr.filter((e)=>{
                if(e.AbsAxis==abs2) return e;
            });
            let direction3=directionArr.filter((e)=>{
                if(e.AbsAxis!=abs2 &&e.AbsAxis!=abs1 ) return e;
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


            if(direction1.length>direction2.length){
                aroundAxisObjects[0]=axisObj1;
                aroundAxisObjects[1]=axisObj2;
            }
            else{
                aroundAxisObjects[0]=axisObj2;
                aroundAxisObjects[1]=axisObj1;
            }
            aroundAxisObjects[2]=axisObj3;
    }
        
    resolve(aroundAxisObjects);
});

//(01)
const GetCirclesArr=(tableFile,pn,middlePoint)=>
    new Promise(async resolve =>{
    var circleArr=[];
    var dictionary =[];

    let filteredArr=tableFile.filter(e=>{
        return e.includes("CIRCLE");
        
    });

    for(el of filteredArr){        
        var row = el.split(",");
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
const GetStepUnit=(bounding,fullTable)=>
    new Promise(async resolve =>{
        let w=parseFloat(bounding.W);
        let l=parseFloat(bounding.L);
        let h=parseFloat(bounding.H);
        let arrayX=[];
        let arrayY=[];
        let arrayZ=[];
        let isInc=false;
        let LAxis=bounding.LAxis;

        // # Reading all x y z from step file ----------
        let filteredArr=fullTable.filter(e=>{
            let r=e.split(" ");
            return r[2]==="CARTESIAN_POINT";
        });

        for(el of filteredArr){
            var row = el.split(" ")
            let x = parseFloat(row[7]).toFixed(2);
            let y = parseFloat(row[8]).toFixed(2);
            let z = parseFloat(row[9]).toFixed(2);

            if(Math.abs(x)>w && Math.abs(x)>l && Math.abs(x)>h || Math.abs(y)>w && Math.abs(y)>l && Math.abs(y)>h || Math.abs(z)>w && Math.abs(z)>l && Math.abs(z)>h){
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

        if(LAxis=='X'){
            if(areaX*25.4<l+10){
                isInc=true;
            }
        }
        else{
            if(LAxis=='Y'){
                if(areaY*25.4<l+10){
                    isInc=true;
                }
            }
            else{
                if(LAxis=='Z'){
                    if(areaZ*25.4<l+10){
                        isInc=true;
                    }
                }
            }
        }

    resolve(isInc);
})

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


//-------------SUB FUNCTION---------------------------------------------------

//(01-1)
const CreateCircel=(rowArr,fileArr,pn,middlePoint)=>
    new Promise(resolve=>{

            rowArr.map(e=>{
                e=e.toString().replace(/[^\w\s]/gi, '');
            });

            var initial = rowArr[0].split('=');
            var indexText=initial[0];
            var index = indexText.toString().replace(/[^\w\s]/gi, '');
            var radius =rowArr[2].split(')')[0];
            var axisIndex = rowArr[1];
            const Arr = [];

            var circel = Circel({
                index: index,
                indexText: indexText,
                actionName: "CIRCLE",
                Radius: Number(radius),
            });

            fileUtilit.GetRow(fileArr, axisIndex, (dataAxis) => {
                if (dataAxis != null) {
                    fileUtilit.GetPointActions(fileArr, dataAxis, (PointActions) => {

                    var cp1 = PointActions[0];
                    var cp2 = PointActions[1];
                    var cp3 = PointActions[2];

                    fileUtilit.GetPointValues(fileArr, cp1, (pointDataA) => {
                                let x = pointDataA.x;
                                let y = pointDataA.y;
                                let z = pointDataA.z;

                                const pointA = Point({                              
                                    x: Number(x).toFixed(3),
                                    y: Number(y).toFixed(3),
                                    z: Number(z).toFixed(3),
                                });
                                circel.A = pointA;
                                Arr.push(pointA);

                            fileUtilit.GetPointValues(fileArr, cp2, (pointBdata) => {
                                        let x = pointBdata.x;
                                        let y = pointBdata.y;
                                        let z = pointBdata.z;
        
                                    const pointB = Point({                              
                                        x: Number(x).toFixed(3),
                                        y: Number(y).toFixed(3),
                                        z: Number(z).toFixed(3),
                                    });
                                        circel.B = pointB;
                                        Arr.push(pointB);

                                        fileUtilit.GetPointValues(fileArr, cp3, (pointCdata) => {
                                                let x = pointCdata.x;
                                                let y = pointCdata.y;
                                                let z = pointCdata.z;
                
                                            const pointC = Point({                              
                                                x: Number(x).toFixed(3),
                                                y: Number(y).toFixed(3),
                                                z: Number(z).toFixed(3),
                                            });
                                                circel.C = pointC;
                                                Arr.push(pointC);
                                                
                                                circel.PN=pn;
                                                circel.AxisB = GetCircelAxisB(circel,middlePoint);
                                                circel.AbsulteAxisB = GetGenCircelAxisB(circel);                                    
                                                circel.IsComplex=IsComolexCircle(circel);
                                                resolve(circel)
                                         });
                                    });                    
                               });
                        });
                    }
                });

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
                                    direction=getFeatDirect(MaxRadiusArr[0],MaxRadiusArr[0].AxisB,middlePoint);

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
const GetMSPart=(coCirclesArr)=>
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

function GetAsString(directionArr){
    
    let start='[ ';
    let end=' ]';
    let temp='';
    let str='';

    for(d of directionArr){
        let axis = d.DirectionAxis;
        temp=temp.concat(' #',axis);
    }
    str=str.concat(start,temp,end);
    return str;

}

//-------------------## DB
const ClearDB = async (req, res) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    res.status(200).send("ok");
}

async function SaveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

module.exports = {
    CalculateKeyMachineProcesses,
    CalculatePartAccsesability,
    GetAroundAxis,
    GetCirclesArr,
    GetFeatArr,
    GetDirectionsArr,
    GetMSPart,
    CalculateAroundAxisNumber,
    CalculateKeyMachineOptions,
    CalculateKeyProductionProcesses,
    GetAsString,
    ClearDB,
    SaveAll
};
