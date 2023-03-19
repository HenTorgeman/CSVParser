const CMrr = require("../Model/CMrr");
const CSurfaceTreatment = require("../Model/CSurfaceTreatment");
const ProcessController = require("./ProductionProcesses");
const values = require("../Files/SavedValues.json");
const { off } = require("../Model/Part");


const CalculateProduction=async (part)=>{

        const partProductionProcess=[];
        let roughingSetupNumber=GetPartRoughingSetupsNumber(part);
        let isHolderSetupNeeded=GetPartProcessHolderSetUp(part);
        let isHolderRemoveSetUpNeeded=GetPartProcessRemoveHolderSetUp(part);
        let finishingSetupNumber=part.PartInfo.KeyMachineSetups;
        let keyMachine=part.PartInfo.KeyMachine;
        let processIndex=0;

        //# Roughing
        const roughingTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.VolumGroup,'Roughing');
        const mrrVolum =GetPartMrrNumber(part.BoundingInfo);
        const mrrVolumCm=(mrrVolum/values.UnitConvert.Mm3ToCm3)
        let roughingTime = mrrVolumCm/roughingTimePerCM;

        const process=roughingSetupNumber>0?ProcessController.CreateRoughingProcess('Roughing',roughingTime,roughingSetupNumber,'3 Axis'):ProcessController.CreateRoughingProcess('Roughing',roughingTime,roughingSetupNumber,keyMachine);
        process.Index=processIndex;
        process.PN=part.PN;
        partProductionProcess.push(process);
        processIndex++;      

        //# ProcessHolder
        const holderTimePerPart = await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.VolumGroup,'Holder');
        const holderSetUpNumber=isHolderSetupNeeded==true?1:0;
        const processHolder=roughingSetupNumber>0?ProcessController.CreateRoughingProcess('Holder',holderTimePerPart,holderSetUpNumber,'3 Axis'):ProcessController.CreateRoughingProcess('Holder',holderTimePerPart,holderSetUpNumber,keyMachine);
        processHolder.Index=processIndex;
        processHolder.PN=part.PN;
        processIndex++;
        partProductionProcess.push(processHolder);
        
        //# ProcessHolderRemove
        const holderRemovalSetUpNumber=isHolderRemoveSetUpNeeded==true?1:0;
        const processRemovalHolder=roughingSetupNumber>0?ProcessController.CreateRoughingProcess('Holder',holderTimePerPart,holderRemovalSetUpNumber,'3 Axis'):ProcessController.CreateRoughingProcess('Holder',holderTimePerPart,holderRemovalSetUpNumber,keyMachine);
        processRemovalHolder.Index=processIndex;
        processRemovalHolder.PN=part.PN;
        partProductionProcess.push(processRemovalHolder);
        processIndex++;

        //# Finishing
        let surfaceGroup= GetPartSurfaceGroup(part.BoundingInfo.Surface/values.UnitConvert.Mm2ToCm2);
        const finishingSetupTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,surfaceGroup,'Finishing');
        // const semifinishingSetupTimePerCM = await GetMrrTimeMinutes(part.RawMaterial.Material,surfaceGroup,'Semi-finishing');

        const surface=part.BoundingInfo.Surface;
        const surfaceCm=(surface/values.UnitConvert.Mm2ToCm2);
        // const finishingTimeMinutes=(surfaceCm/finishingSetupTimePerCM)+(surfaceCm/semifinishingSetupTimePerCM);
        let finishingTimeMinutes=(surfaceCm/finishingSetupTimePerCM);


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

        if(part.PartInfo.ComplexityLevel==0){
            if(part.BoundingInfo.Size=='Small'){
                if(mrrPrecentage>values.StrCondition.VeryHighSmall){
                    str=true;
                }
            }
            else{
                if(part.BoundingInfo.Size=='Medium'){
                    if(mrrPrecentage>values.StrCondition.VeryHighMedium){
                        str=true;
                    }
                }
                else{
                    if(mrrPrecentage>values.StrCondition.VeryHighLarge){
                        str=true;
                    }
                }
            }
        }

        if(part.PartInfo.ComplexityLevel==1){
            if(part.BoundingInfo.Size=='Small'){
                if(mrrPrecentage>values.StrCondition.HighSmall){
                    str=true;
                }
            }
            if(part.BoundingInfo.Size=='Medium'){
                if(mrrPrecentage>values.StrCondition.HighMedium){
                    str=true;
                }
            }
            if(part.BoundingInfo.Size=='Large'){
                if(mrrPrecentage>values.StrCondition.HighLarge){
                    str=true;
                }
            }
        }
        
        if(part.PartInfo.ComplexityLevel==2){
            if(part.BoundingInfo.Size=='Large'){
                if(mrrPrecentage>values.StrCondition.MiddleLarge){
                    str=true;
                }
            }
        }
    }

    return str;
}
function GetPartRoughingSetupsNumber(part){
    let setups=0;
    if(part.PartInfo.STR){
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

    if(part.PartInfo.KeyMachine != '3 Axis'){
        if(roughingSetUpsNumber<=1){
            value=true;
        }
    }
    return value;
}
function GetPartProcessRemoveHolderSetUp(part){
    let value=false;
    let keySetups=part.PartInfo.KeyMachineSetups;
    if(part.PartInfo.KeyMachine!='3 Axis' && keySetups==1){
            value=true;
    }
    return value;
}
async function CalcPartRoughingSetupTime(part){
   
    const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.VolumGroup,'Roughing');
    const mrrVolum=GetPartMrrNumber(part.BoundingInfo);
    return mrrVolum/minutes;
}
async function GetPartProcessHolderTime(part){
    let isProcessHolderNeeded=GetPartProcessHolderSetUp(part);
    if(isProcessHolderNeeded!=true) return 0;
    else{
        const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.VolumGroup,'Holder');
        return minutes;

    }
}
async function GetPartFinishingTime(part){
    const minutes= await GetMrrTimeMinutes(part.RawMaterial.Material,part.BoundingInfo.SurfaceGroup,'Finishing');
    return minutes;      
}
function GetPartSurfaceGroup(surface){
    let group='';
    if(surface<=values.SizeGroupsMM.Surefac.S2500)
        group='S2500';
    else{
        if(surface>values.SizeGroupsMM.Surefac.S2500 && surface<=values.SizeGroupsMM.Surefac.S5500)
        {
            group='S5500';
        }
        if(surface>values.SizeGroupsMM.Surefac.S5500 &&surface<=values.SizeGroupsMM.Surefac.S10000)
        {
            group='S10000';
        }
        if(surface>values.SizeGroupsMM.Surefac.S10000 &&surface<=values.SizeGroupsMM.Surefac.S20000)
        {
            group='S20000';
        }
        if(surface>values.SizeGroupsMM.Surefac.S20000 && surface<=values.SizeGroupsMM.Surefac.S45000)
        {
            group='S45000';
        }
        if(surface>values.SizeGroupsMM.Surefac.S45000 &&surface<=values.SizeGroupsMM.Surefac.S60000)
        {
            group='S60000';
        }
        if(surface>values.SizeGroupsMM.Surefac.S60000)
        {
            group='S75000';
        }  
    }
    return group;
}
function GetPartVolumeGroup(volume){
    let group='';

    if(volume<=values.SizeGroupsMM.Volume.V10000)
    group='V10000';
    else{
        if(volume>values.SizeGroupsMM.Volume.V10000 && volume<=values.SizeGroupsMM.Volume.V30000)
        {
            group='V30000';
        }
        if(volume>values.SizeGroupsMM.Volume.V30000 && volume<=values.SizeGroupsMM.Volume.V100000)
        {
            group='V100000';
        }
        if(volume>values.SizeGroupsMM.Volume.V100000 && volume<=values.SizeGroupsMM.Volume.V300000)
        {
            group='V300000';
        }
        if(volume>values.SizeGroupsMM.Volume.V300000 && volume<=values.SizeGroupsMM.Volume.V1000000)
        {
            group='V1000000';
        }
        if(volume>values.SizeGroupsMM.Volume.V1000000 && volume<=values.SizeGroupsMM.Volume.V3000000)
        {
            group='V3000000';
        }
        if(volume>values.SizeGroupsMM.Volume.V3000000)
        {
            group='V3000001';
        }
    
    }
    return group;
}

//#Simple calculations
function GetPartMrrNumber(boundingInfo)
{
    return boundingInfo.Volum-boundingInfo.VolumNet;
}
function GetPartMrrPrecentage(boundingInfo)
{
    let MrrNumber=GetPartMrrNumber(boundingInfo);
    let MrrPrecentage=( MrrNumber/boundingInfo.Volum)*100;
    return MrrPrecentage;
}
function GetPartSize(L,W,H){
    let size="";
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
            if(Val>=values.Size.Medium){
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

    let size= GetPartSize(L,W,H);
    let lGross=0;
    let wlGross=0;
    let hGross=0;

  if(size=='Small'){
         lGross=l+values.MaterialBuffer.Small;
         wlGross=w+values.MaterialBuffer.Small;
         hGross=h+values.MaterialBuffer.Small;
    }
    if(size=='Medium'){
        lGross=l+values.MaterialBuffer.Medium;
        wlGross=w+values.MaterialBuffer.Medium;
        hGross=h+values.MaterialBuffer.Medium;

    }
    if(size=='Large'){
        lGross=l+values.MaterialBuffer.Large;
        wlGross=w+values.MaterialBuffer.Large;
        hGross=h+values.MaterialBuffer.Large;
    }
    
    let Val=lGross*wlGross*hGross;
    return Val;
}
function GetPartChargableWeight(part){
    let materialWeight=GetPartMaterialWeight(part);
    let netVolumeDM=part.BoundingInfo.W * part.BoundingInfo.H * part.BoundingInfo.W/values.UnitConvert.Dm3ToMm3;
    let chargableWeight=Math.max(netVolumeDM/6,materialWeight);
    return chargableWeight;

}
function GetPartMaterialWeight(part){
    let w=parseFloat(part.BoundingInfo.W)+values.RmBoundingBuffer;
    let l=parseFloat(part.BoundingInfo.L)+values.RmBoundingBuffer;
    let h=parseFloat(part.BoundingInfo.H)+values.RmBoundingBuffer;
    let netWeighMM=w/10*l/10*h/10;
    
    let materialWeight=(netWeighMM/values.UnitConvert.Mm3ToCm3) * part.RawMaterial.Density;
    return materialWeight;
}
async function CalculateCost(part){
   let cost=0;
    let l=part.BoundingInfo.L;
    let w=part.BoundingInfo.W;
    let h=part.BoundingInfo.H;
    // # SurfaceTreatment
    let strObj=await GetSurfaceTreatment(part.BoundingInfo.SurfaceTreatment);
    if(strObj!=null){
        let GrossSurface=2*((l*w)+(w*h)+(h*l));
        let surfaceDM=GrossSurface/values.UnitConvert.Dm2ToMm2;
        let surfaceTreatmentCost=surfaceDM*strObj.Cost;
        cost+=surfaceTreatmentCost;
    }
    // # Packing
    let chargableWeight=part.BoundingInfo.ChargableWeight;
    let packingCost=chargableWeight*values.Shipping.China.NetToGrossWeight*(values.Shipping.China.DomesticDeliveryCostPerKg+values.Shipping.China.PackingCostPerKG);
    cost+=packingCost;

    // # Material Price
    let materialCost=GetPartMaterialWeight(part)*part.RawMaterial.PricePerKg;
    cost+=materialCost;
    
    for(let i=0;i<part.ProductionProcesses.length;i++){
        let process=part.ProductionProcesses[i];
        cost+=process.Cost;
    }

    let roughingSetupNumber=GetPartRoughingSetupsNumber(part);
    let keyMachine=part.PartInfo.KeyMachine;

    const HolesProcess=roughingSetupNumber>0?ProcessController.CreateRoughingProcess('Roughing',part.HolesMinuets,0,'3 Axis'):ProcessController.CreateRoughingProcess('Roughing',part.HolesMinuets,0,keyMachine);
    if(HolesProcess!=null){
        cost+=HolesProcess.Cost;
    }
    const TreadsProcess=roughingSetupNumber>0?ProcessController.CreateRoughingProcess('Roughing',part.ThreadsMinuets,0,'3 Axis'):ProcessController.CreateRoughingProcess('Roughing',part.ThreadsMinuets,0,keyMachine);
    if(TreadsProcess!=null){
        cost+=TreadsProcess.Cost;
    }
   return cost;
}
function CalculateLTMinuets(part){
    let minuets=0;
     for(let i=0;i<part.ProductionProcesses.length;i++){
         let process=part.ProductionProcesses[i];
         minuets+=process.Time;
    }
    return minuets;
}
function CalculateSetUpCost(part){
    let minutes=0;
    let cost=0;

    let machineCostPerMin=0;

    if(part.PartInfo.KeyMachine=='3 Axis') machineCostPerMin=values.Machines.Machine3AxisCostMin;
    if(part.PartInfo.KeyMachine=='4 Axis') machineCostPerMin=values.Machines.Machine4AxisCostMin;
    if(part.PartInfo.KeyMachine=='5 Axis') machineCostPerMin=values.Machines.Machine5AxisCostMin;

     for(let i=0;i<part.ProductionProcesses.length;i++){
         let process=part.ProductionProcesses[i];
         let val=process.ProcessesNumber*values.MinutesPerSetUp;
         minutes+=val;
    }
    cost=minutes*machineCostPerMin;
    return cost;
}
async function CalculateBatchLTDays(part){
    let strObj=await GetSurfaceTreatment(part.BoundingInfo.SurfaceTreatment);
    let strLTDay=strObj==null?0:strObj.LeadTime;
    let materialLTDays=part.RawMaterial.LT;
    let strStandart=1;

     let DaysSetUps=0;
     for(let i=0;i<part.ProductionProcesses.length;i++){
        let process=part.ProductionProcesses[i];
        let val=process.ProcessesNumber;
        DaysSetUps+=val;
   }

     let days=materialLTDays+strLTDay+strStandart+DaysSetUps;
     return days;
}

//#Pulling db data
const GetSurfaceTreatment= async (treatment)=>{
    const docs =await CSurfaceTreatment.find({ Name:treatment}).exec();
    if(docs.length==0) return null;
    else{
        return docs[0];
    }
} 
const GetMrrTimeMinutes = async (material,size,processName)=>{
    const docs =await CMrr.find({ Material:material,Size: size,ProcessName:processName}).exec();
    
    if(docs.length>1) {
        console.log("#Error: Duplicate values in CMRR table");
        return null;
    }
    else{
        if(docs.length>0){
            let value = docs[0].Lt;
            return value;
        }
        else{
            if(docs.length==0){
                let value =1;
                return value;
            }
        }
    }
}
async function SaveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}
module.exports = {
    GetPartSize,
    GetPartSurfaceGroup,
    GetPartVolumeGroup,
    GetPartShape,
    GetPartGrossVolume,
    GetPartSTR,
    GetPartRoughingSetupsNumber,
    CalculateProduction,
    GetPartMrrNumber,
    GetPartMrrPrecentage,
    GetMrrTimeMinutes,
    GetPartMaterialWeight,
    GetPartProcessRemoveHolderSetUp,
    CalcPartRoughingSetupTime,
    GetPartChargableWeight,
    GetPartProcessHolderTime,
    GetPartFinishingTime,
    GetSurfaceTreatment,
    CalculateCost,
    CalculateLTMinuets,
    CalculateSetUpCost,
    CalculateBatchLTDays,
    SaveAll


};
