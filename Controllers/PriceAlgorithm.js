// const Part = require("../Model/Part");
// const Bounding = require("../Model/BoundingInfo");
// const Machine = require("../Model/SetUp");
const CMrr = require("../Model/CMrr");
const ProcessController = require("../Controllers/ProductionProcesses");
const values = require("../SavedValues.json");

const CalculateProduction=async (part)=>{
        console.log("CalculateProduction : "+part.PN);

        const partProductionProcess=[];
        let roughingSetupNumber=GetPartRoughingSetupsNumber(part);
        let isHolderSetupNeeded=GetPartProcessHolderSetUp(part);
        let isHolderRemoveSetUpNeeded=GetPartProcessRemoveHolderSetUp(part)
        let finishingSetupNumber=part.PartInfo.KeyMachineSetups;
        let keyMachine=part.PartInfo.KeyMachine;
        // let holderCostWithoutSetups=0;
        let processIndex=0;

        //# Roughing
         if(roughingSetupNumber>0){
            const roughingTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.Size,'Roughing');
            const mrrVolum =GetPartMrrNumber(part.BoundingInfo);
            const mrrVolumCm=(mrrVolum/values.UnitConvert.MmToCm)
            const roughingTime = mrrVolumCm/roughingTimePerCM;
            const process=ProcessController.CreateRoughingProcess('Roughing',roughingTime,roughingSetupNumber);
            process.Index=processIndex;
            process.PN=part.PN;
            partProductionProcess.push(process);
            processIndex++;
         }

        //# ProcessHolder
            const holderTimePerPart = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.Size,'Holder');
            const processHolder= ProcessController.CreateRoughingProcess('Holder',holderTimePerPart,1);

            if(isHolderSetupNeeded==true){
                processHolder.Index=processIndex;
                processHolder.PN=part.PN;
                processIndex++;
            }
            else{
                if(holderTimePerPart>0){
                    processHolder.Lt+=holderTimePerPart;
                    // holderCostWithoutSetups=holderTime*values.Machines["3AxisCostMin"];
                }
            }
            partProductionProcess.push(processHolder);


        //# ProcessHolderRemove
        if(isHolderRemoveSetUpNeeded==true){
            let process= ProcessController.CreateRoughingProcess('Holder',holderTime,1);
            process.Index=processIndex;
            process.PN=part.PN;
            partProductionProcess.push(process);
            processIndex++;
        }

        //# Finishing
        const finishingSetupTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.Size,'Finishing');
        const semifinishingSetupTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.Size,'Semi-finishing');

        const surface=part.BoundingInfo.Surface;
        const surfaceCm=(surface/values.UnitConvert.MmToCm);
        const finishingTimeMinutes=(surfaceCm/finishingSetupTimePerCM)+(surfaceCm/semifinishingSetupTimePerCM);
        
        //# In script Version : will be based on around axis and around axis secondary.
                if(keyMachine=='4 Axis'){
                    let process= ProcessController.Create4AxisProcess('Finishing',finishingTimeMinutes,finishingSetupNumber);
                    process.Index=processIndex+1;
                    process.PN=part.PN;
                    partProductionProcess.push(process);
                }
                if(keyMachine=='5 Axis'){
                    let process= ProcessController.Create5AxisProcess('Finishing',finishingTimeMinutes,finishingSetupNumber);
                    process.Index=processIndex+1;
                    process.PN=part.PN;
                    partProductionProcess.push(process);
                }
                if(keyMachine=='3 Axis'){
                    let process= ProcessController.Create3AxisProcess('Finishing',finishingTimeMinutes,finishingSetupNumber);
                    process.Index=processIndex+1;
                    process.PN=part.PN;
                    partProductionProcess.push(process);
                }

    return partProductionProcess;
}
function GetPartSTR(part){
    let str=false;
    let mrrPrecentage=GetPartMrrPrecentage(part.BoundingInfo);
    
    if(part.RawMaterial.Material=='Aluminum'){
        if(part.ComplexityLevel==0){
            if(part.BoundingInfo.Size=='Small'){
                if(mrrPrecentage>values.MrrGroupPracentage.VeryHighSmall){
                    str=true;
                }
            }
            else{
                if(mrrPrecentage>values.MrrGroupPracentage.VeryHeighMedium){
                    str=true;
                }
            }
        }
        if(part.ComplexityLevel==1){
            if(part.BoundingInfo.Size=='Medium'){
                if(mrrPrecentage>values.MrrGroupPracentage.HighMedium){
                    str=true;
                }
            }
            if(part.BoundingInfo.Size=='Large'){
                if(mrrPrecentage>values.MrrGroupPracentage.HighLarge){
                    str=true;
                }
            }
        }
        if(part.ComplexityLevel==2){
            if(part.BoundingInfo.Size=='Large'){
                if(mrrPrecentage>values.MrrGroupPracentage.MiddleLarge){
                    str=true;
                }
            }
        }
    }

    return str;
}
function GetPartRoughingSetupsNumber(part){
    let setups=0;
    // let str=GetPartSTR(part);
    if(part.PartInfo.STR==true){
        if(part.PartInfo.MD>=6){
            setups=3;
        }
        else{
            setups=2;
        }
    }    
    return setups;
}
function GetPartProcessHolderSetUp(part){
    let value=false;
    let roughingSetUpsNumber=GetPartRoughingSetupsNumber(part);
    // let str=GetPartSTR(part);
    if(part.PartInfo.KeyMachine!='3 Axis'){
        if(roughingSetUpsNumber<=1){
            value=true;
        }
    }
    return value;
}
function GetPartProcessRemoveHolderSetUp(part){
    let value=false;
    let keySetups=part.PartInfo.keySetups;
    // let keySetups=part.PartProductionProcess.KeySetupsNumber;

    if(part.PartInfo.KeyMachine!='3 Axis' && keySetups==1){
            value=true;
    }
    return value;
}
async function CalcPartRoughingSetupTime(part){
   
    const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.Size,'Roughing');
    const mrrVolum=GetPartMrrNumber(part.BoundingInfo);
    return mrrVolum/minutes;
}
async function GetPartProcessHolderTime(part){
    let isProcessHolderNeeded=GetPartProcessHolderSetUp(part);
    if(isProcessHolderNeeded!=true) return 0;
    else{
        const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.size,'Holder');
        return minutes;

    }
}
async function GetPartFinishingTime(part){
    const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.size,'Finishing');
    return minutes;      
}

//#Simple calculations
function GetPartMrrNumber(boundingInfo)
{
    return boundingInfo.Volum-boundingInfo.VolumNet;
}
function GetPartMrrPrecentage(boundingInfo)
{
    let MrrNumber=GetPartMrrNumber(boundingInfo);
    let MrrPrecentage=(boundingInfo.Volum / MrrNumber)*100;
    return MrrPrecentage;
}
function GetPartSize(L,W,H){
    let size="";
    
    // let Val=(parseFloat(L)*parseFloat(H)*parseFloat(W))/1000;
    let Val=(L*H*W);

    if(Val<values.Size.Small){
        size="Small";
    }
    else{
        if(Val>=values.Size.Small && Val<values.Size.Medium)
        {
            size="Medium";
        }
        else{
            if(Val>values.Size.Medium){
                size="Large";
    
            }
    }
    }
    return size;
}
function GetPartShape(L,W,H){
    let shape="";
    let Val= Math.max(L,W,H)/ Math.min(L,W,H);
    
    if(Val<values.Shape){
         shape="Plate";
    }
    else{
        shape="Cube";
    }
    return shape;
}
function GetPartGrossVolume(L,W,H){
    let l=parseFloat(L);
    let w=parseFloat(W);
    let h=parseFloat(H);

    let lGross=l+values.RmBoundingBuffer;
    let wlGross=w+values.RmBoundingBuffer;
    let hGross=h+values.RmBoundingBuffer;

    // let lGross=l+((l*values.RmBoundingBuffer)/100);
    // let wlGross=w+((w*values.RmBoundingBuffer)/100);
    // let hGross=h+((h*values.RmBoundingBuffer)/100);

    let Val=lGross*wlGross*hGross;
    return Val;
}
function GetPartMaterialWeight(L,W,H,price){

}

function CalculateCost(part){
   let cost=0;
    for(let i=0;i<part.ProductionProcesses.length;i++){
        let process=part.ProductionProcesses[i];
        cost+=process.Cost;
   }
   return cost;
}
function CalculateLT(part){
    let minuets=0;
     for(let i=0;i<part.ProductionProcesses.length;i++){
         let process=part.ProductionProcesses[i];
         minuets+=process.Time;
    }
    return minuets;
}
 function CalculateBatchPrice(part){
    let cost=0;
    let machineCostPerMin=0;

    if(part.PartInfo.KeyMachine=='3 Axis') machineCostPerMin=values.Machines.Machine3AxisCostMin;
    if(part.PartInfo.KeyMachine=='4 Axis') machineCostPerMin=values.Machines.Machine4AxisCostMin;
    if(part.PartInfo.KeyMachine=='5 Axis') machineCostPerMin=values.Machines.Machine5AxisCostMin;

    let batchAdditionalCost=120*machineCostPerMin;
     for(let i=0;i<part.ProductionProcesses.length;i++){
         let process=part.ProductionProcesses[i];
         let val=process.Cost+batchAdditionalCost;
         cost+=val;
    }
    return cost;
}

function CalculateBatchLT(part){
     let minuets=0;
      for(let i=0;i<part.ProductionProcesses.length;i++){
          let process=part.ProductionProcesses[i];
          minuets+=process.Time;
     }

     let hours=minuets/60;
     let days=part.ProductionProcesses.length+hours;
     return days;
}


//#Pulling db data

const GetMrrTimeMinutes = async (material,size,processName)=>{
    const docs =await CMrr.find({ Material:material,Size: size,ProcessName:processName}).exec();
    let value=null;

    if(docs.length>1) {
        console.log("#Error: Duplicate values in CMRR table");
        return null;
    }
    else{
        if(docs.length>0){
            let value = docs[0].Lt;
            return value;
        }
    }
}             

async function SaveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}
module.exports = {
    GetPartSize,
    GetPartShape,
    GetPartGrossVolume,
    GetPartSTR,
    GetPartRoughingSetupsNumber,
    CalculateProduction,
    GetPartMrrNumber,
    GetPartMrrPrecentage,
    GetMrrTimeMinutes,
    GetPartProcessRemoveHolderSetUp,
    CalcPartRoughingSetupTime,
    GetPartProcessHolderTime,
    GetPartFinishingTime,
    CalculateCost,
    CalculateLT,
    CalculateBatchPrice,
    CalculateBatchLT,
    SaveAll


};
