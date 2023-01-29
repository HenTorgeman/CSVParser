const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const Feat = require("../Model/Feat");
const Point = require("../Model/Point");

const Direction = require("../Model/Direction");
const CMachine = require("../Model/CMachine");
const CMrr = require("../Model/CMrr");
const CRawMaterial = require("../Model/CRawMaterial");
const SetUp = require("../Model/SetUp");

const Bounding = require("../Model/BoundingInfo");
const PartInfo = require("../Model/PartInfo");

const ColumnsInputFile = require("../ColumnsInputFile.json");
const ColumnsOutputFile = require("../ColumnsOutputFile.json");
const ColumnsMrrFile = require("../ColumnsMrrFile.json");
const ColumnsRMFile = require("../ColumnsRmFile.json");
const values = require("../SavedValues.json");

const fs = require("fs");
const Util = require("../Utilities");
const AlgoController = require("./PriceAlgorithm");
const FileAnalysis = require("./FileAnalysis");


const BoundingInfo = require("../Model/BoundingInfo");
const CRawMaterialFile = '/Users/hentorgeman/Desktop/AutomatedCostingStageA/CRawMaterial.csv'
const CMrrFile = '/Users/hentorgeman/Desktop/AutomatedCostingStageA/CMRR.csv'
const inputFile = '/Users/hentorgeman/Desktop/AutomatedCostingStageA/Inputs/Input100.csv';
const testFile = '/Users/hentorgeman/Desktop/AutomatedCostingStageA/100PartsMetaData.csv';

//Files

const ReadInputFile = async (req, res, next) => {
    console.log("## Reading file...."+GetTime());
    let table =fs.readFileSync(inputFile, "utf8").split("\r\n");
    const arr=[];

    for(el of table){
        let row=el.split(",");
        let p=row[ColumnsInputFile.PN];
        if(p!="Pn" && p!=""){
            let str=row[ColumnsInputFile.STR]=='Y'?true:false;

            const part=new Part({
                PN:row[ColumnsInputFile.PN],
                Index:row[ColumnsInputFile.Index],
                FilePath:row[ColumnsInputFile.file],
                ComplexityLevel:row[ColumnsInputFile.ComplexityLevel],
                KeyMachine:row[ColumnsInputFile.KeyMachine],
            });

            const centroidPoint=new Point({
                x:row[ColumnsInputFile.CenterX],
                y:row[ColumnsInputFile.CenterY],
                z:row[ColumnsInputFile.CenterZ]
            });
            const partInfo=new PartInfo({
                KeyMachine:row[ColumnsInputFile.KeyMachine],
                KeyMachineSetups:row[ColumnsInputFile.KeyMachineSetUps],
                OtherSetUps:row[ColumnsInputFile.OtherSetups],
                MD:row[ColumnsInputFile.MD],                
                STR:str,
            });

            const boundingInfo=new Bounding({
                PartNumber:row[ColumnsInputFile.PN],
                MiddlePoint:centroidPoint,
                L:row[ColumnsInputFile.L],
                W:row[ColumnsInputFile.W],
                H:row[ColumnsInputFile.H],
                HAxis:row[ColumnsInputFile.Haxis],
                WAxis:row[ColumnsInputFile.Waxis],
                LAxis:row[ColumnsInputFile.Laxis],
                VolumNet:(row[ColumnsInputFile.NetVolume]), //DM^3
                Surface:(row[ColumnsInputFile.Surface]),
                NetWeight:row[ColumnsInputFile.NetWeight]
            });

            boundingInfo.Size=AlgoController.GetPartSize(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Shape=AlgoController.GetPartShape(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Volum=AlgoController.GetPartGrossVolume(boundingInfo.L,boundingInfo.W,boundingInfo.H);

            const RawMaterial = await CRawMaterial.find({ RawMaterial:row[ColumnsInputFile.RM]}).exec();
            part.RawMaterial=RawMaterial[0];
            part.BoundingInfo=boundingInfo;
            part.PartInfo=partInfo;

            const productionProcesses=await AlgoController.CalculateProduction(part);

            if (productionProcesses != null) {
                    part.ProductionProcesses=productionProcesses;
                    part.Cost=AlgoController.CalculateCost(part);
                    part.LT=AlgoController.CalculateLT(part);
                    part.BatchTime=AlgoController.CalculateBatchLT(part);
                    part.BatchCost=AlgoController.CalculateBatchPrice(part);

                    let rughingTime=0;
                    let finishingTime=0;

                    for(let i=0;i<productionProcesses.length;i++){
                        let proc=productionProcesses[i];
                        if(proc.ProcessName=='Roughing' || proc.ProcessName=='Holder'){
                            rughingTime+=proc.Time;                        
                        }
                        else{
                            finishingTime+=proc.Time;   
                        }
                    }

                    part.RoughingMinuets=rughingTime;
                    part.FinishingMinuets=finishingTime;


                    arr.push(part);
            }

        }
    }

    SaveAll(arr);
    res.status(200).send('OK');
}
const ReadInputFileScript = async (req, res, next) => {
    console.log("## Reading file...."+GetTime());
    let table =fs.readFileSync(inputFile, "utf8").split("\r\n");
    const arr=[];

    for(el of table){
        let row=el.split(",");
        let p=row[ColumnsInputFile.PN];
        if(p!="Pn" && p!=""){
            let str=row[ColumnsInputFile.STR]=='Y'?true:false;

            const part=new Part({
                PN:row[ColumnsInputFile.PN],
                Index:row[ColumnsInputFile.Index],
                FilePath:row[ColumnsInputFile.file],
                ComplexityLevel:row[ColumnsInputFile.ComplexityLevel],
                KeyMachine:row[ColumnsInputFile.KeyMachine],
            });

            const centroidPoint=new Point({
                x:row[ColumnsInputFile.CenterX],
                y:row[ColumnsInputFile.CenterY],
                z:row[ColumnsInputFile.CenterZ]
            });
            const partInfo=new PartInfo({
                KeyMachine:row[ColumnsInputFile.KeyMachine],
                KeyMachineSetups:row[ColumnsInputFile.KeyMachineSetUps],
                OtherSetUps:row[ColumnsInputFile.OtherSetups],
                MD:row[ColumnsInputFile.MD],                
                STR:str,
            });

            const boundingInfo=new Bounding({
                PartNumber:row[ColumnsInputFile.PN],
                MiddlePoint:centroidPoint,
                L:row[ColumnsInputFile.L],
                W:row[ColumnsInputFile.W],
                H:row[ColumnsInputFile.H],
                HAxis:row[ColumnsInputFile.Haxis],
                WAxis:row[ColumnsInputFile.Waxis],
                LAxis:row[ColumnsInputFile.Laxis],
                VolumNet:(row[ColumnsInputFile.NetVolume]), //DM^3
                Surface:(row[ColumnsInputFile.Surface]),
                NetWeight:row[ColumnsInputFile.NetWeight]
            });

            boundingInfo.Size=AlgoController.GetPartSize(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Shape=AlgoController.GetPartShape(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Volum=AlgoController.GetPartGrossVolume(boundingInfo.L,boundingInfo.W,boundingInfo.H);

            const RawMaterial = await CRawMaterial.find({ RawMaterial:row[ColumnsInputFile.RM]}).exec();
            part.RawMaterial=RawMaterial[0];
            part.BoundingInfo=boundingInfo;
            part.PartInfo=partInfo;

            // const productionProcesses=await AlgoController.CalculateProduction(part);
            const calculation=await FileAnalysis.CalculatePart(part);

            const productionProcesses=await AlgoController.CalculateProduction(part);


            if (productionProcesses != null) {
                    part.ProductionProcesses=productionProcesses;
                    part.Cost=AlgoController.CalculateCost(part);
                    part.LT=AlgoController.CalculateLT(part);
                    part.BatchTime=AlgoController.CalculateBatchLT(part);
                    part.BatchCost=AlgoController.CalculateBatchPrice(part);

                    let rughingTime=0;
                    let finishingTime=0;

                    for(let i=0;i<productionProcesses.length;i++){
                        let proc=productionProcesses[i];
                        if(proc.ProcessName=='Roughing' || proc.ProcessName=='Holes' || proc.ProcessName=='Holder'){
                            rughingTime+=proc.Time;                        
                        }
                        else{
                            finishingTime+=proc.Time;   
                        }
                    }

                    part.RoughingMinuets=rughingTime;
                    part.FinishingMinuets=finishingTime;


                    arr.push(part);
            }

        }
    }

    SaveAll(arr);
    res.status(200).send('OK');
}


//Print
const Print = async (req, res, next) => {

    const titles = []
    const data=[];

    for(let i=0;i<18;i++){
        let col1=ColumnsOutputFile[i.toString()];
        titles.push(col1);
    }   
    data.push(titles);
    const parts =await Part.find({}).exec();
        
    for(index in parts){
        let p=parts[index];
        let pn =p.PN;
        let keyMachineProcess=p.PartInfo.KeyMachine;
        let AdditionalProcessObj=p.ProductionProcesses.filter((p)=>{
            if(p.Type=='Additional')
                return p;
        });
        let AdditionalProcess=AdditionalProcessObj.length;
        // let MachiningDirections=p.PartCalculation.MD;
        let MachiningDirections="";
        // let AroundAxis=p.PartCalculation.AroundAxis.length;
        let AroundAxis="";
        // let MDSecondaeyAxis=p.PartCalculation.AroundAxis[1].MachiningDirections.length;
        let MDSecondaeyAxis="";
        let PartNetVolume=p.BoundingInfo.VolumNet;
        let PartGrossVolume=p.BoundingInfo.Volum;

        let PartSurface=p.BoundingInfo.Surface;
        // let NumberOfHoles=p.PartCalculation.FeatursNumber;
        let NumberOfHoles="";
        let RoughingMinuets=p.RoughingMinuets;
        let FinishingMinuets=p.FinishingMinuets;
        let FineHolesThreads="";
        let HolesTime="";
        let UnitCost=p.Cost;
        let SetupCost=p.BatchCost;
        let UnitLeadTimeHours=p.LT;
        let BatchLeadTimeDays=p.BatchTime;
        const dataRow=[];
        dataRow.push(pn);
        dataRow.push(keyMachineProcess);
        dataRow.push(AdditionalProcess);
        dataRow.push(MachiningDirections);
        dataRow.push(AroundAxis);
        dataRow.push(MDSecondaeyAxis);
        dataRow.push(PartNetVolume.toFixed(2));
        dataRow.push(PartGrossVolume.toFixed(2));
        dataRow.push(PartSurface.toFixed(2));
        dataRow.push(NumberOfHoles);
        dataRow.push(RoughingMinuets.toFixed(2));
        dataRow.push(FinishingMinuets.toFixed(2));
        dataRow.push(FineHolesThreads);
        dataRow.push(HolesTime);
        dataRow.push(UnitCost.toFixed(2));
        dataRow.push(SetupCost.toFixed(2));
        dataRow.push(UnitLeadTimeHours.toFixed(2));
        dataRow.push(BatchLeadTimeDays.toFixed(2));
        data.push(dataRow);
    }

    const csvData = data.map(d => d.join(',')).join('\n');
    fs.writeFile('/Users/hentorgeman/Desktop/AutomatedCostingStageA/ResultFile.csv', csvData, (error) => {
    
    if (error) {
        console.error(error);
      } else {
        console.log('The CSV file was written successfully');
      }
    });
      
    res.status(200).send(data);
}
    

const ReadCMrrFile = async (req, res, next) => {
    console.log("## Reading CMrrFile...."+GetTime());
    let table =fs.readFileSync(CMrrFile, "utf8").split("\r\n");
    
    const Options=[];
    for(el of table){      
        let row=el.split(",");

        console.log(row);

        let Material=row[ColumnsMrrFile.Material];
        let Size=row[ColumnsMrrFile.Size];
        let ProcessName = row[ColumnsMrrFile.ProcessName];
        let Lt=row[ColumnsMrrFile.Time];
        if(Lt!="Time(Min)"){
            const Mrr = new CMrr({
                Material:Material,
                Size:Size,
                ProcessName:ProcessName,
                Lt:Lt
            });
            console.log(Mrr);

            Options.push(Mrr);
        }
    }
    SaveAll(Options);

    console.log("## Done 😀 Mrr created" +GetTime());
    res.status(200).send('ok');
}
const ReadCRawMaterialFile = async (req, res, next) => {
    console.log("## Reading CRawMaterialFile...."+GetTime());
    let table =fs.readFileSync(CRawMaterialFile, "utf8").split("\r\n");
    const RawMaterials=[];
    for(el of table){      
        let row=el.split(",");

        let rm=row[ColumnsRMFile.RawMaterial];
        let Material=row[ColumnsRMFile.Material];
        let Density = row[ColumnsRMFile.Density];
        let Price=row[ColumnsRMFile.Cost];
        let LT=row[ColumnsRMFile.LT];

        if(LT!="Lead time (days)"){
        const RawMaterial=new CRawMaterial({
            RawMaterial:rm,
            Material:Material,
            Density:Density,
            Price:Price,
            LT:LT
        });

        const docs =await CMrr.find({ Material:RawMaterial.Material}).exec();
        RawMaterial.MrrOptions=docs;

        RawMaterials.push(RawMaterial);
        }
    }
    SaveAll(RawMaterials);

    console.log("## Done 😀 Mrr created" +GetTime());
    res.status(200).send('ok');
}
const ReadTestFile = async (req, res, next) => {

    console.log("## Reading file....");
    let data =fs.readFileSync(testFile, "utf8").split("\r\n");
    let table=data;
    console.log("##---START----- : ");
    
    for(el of table){      
        let row=el.split(",");
        let pn=row[1];
        if(pn.toString().trim()==='Pn' || pn.toString().trim()===''){
            // Its Title
        }
        else{
            // Its Line
    
            console.log("## Calculate data for.. "+ pn+ " " +row[0]+"....."+table.length);
            let path=row[2];
            let partData = fs.readFileSync(path, "utf8").split("\r\n");
        }
    }
    console.log("##---DONE----- : ");

    res.status(200).send('Ok');
}

//DB Many
const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await Feat.deleteMany({});
    await Direction.deleteMany({});
    await Bounding.deleteMany({});
    await SetUp.deleteMany({});
    await PartInfo.deleteMany({});
    await Part.deleteMany({});

    res.status(200).send("ok");
}
const ClearMachineDB = async (req, res, next) => {
    await CMachine.deleteMany({});
    res.status(200).send("ok");
}
const ClearCMrrDB = async (req, res, next) => {
    await CMrr.deleteMany({});
    res.status(200).send("ok");
}
const ClearRawMaterialDB = async (req, res, next) => {
    await CRawMaterial.deleteMany({});
    res.status(200).send("ok");
}
async function SaveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

//Heplers
function GetTime(){
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    return " "+ hours + ":" + minutes +":"+seconds;
}


module.exports = {
    ReadInputFile,
    ReadCMrrFile,
    ReadCRawMaterialFile,
    ClearDB,
    ClearMachineDB,
    ClearCMrrDB,
    ClearRawMaterialDB,
    ReadTestFile,
    Print
};