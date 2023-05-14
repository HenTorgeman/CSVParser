const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const Feat = require("../Model/Feat");
const Point = require("../Model/Point");
const Direction = require("../Model/Direction");
const AroundAxis = require("../Model/AroundAxis");
const CMachine = require("../Model/CMachine");
const CMrr = require("../Model/CMrr");
const CSurfaceTreatment = require("../Model/CSurfaceTreatment");
const CRawMaterial = require("../Model/CRawMaterial");
const SetUp = require("../Model/SetUp");
const ProductionSetUp = require("../Model/ProductionSetUp");
const PartCalculationController = require("../Controllers/Calculation");

const Bounding = require("../Model/BoundingInfo");
const PartInfo = require("../Model/PartInfo");

const ColumnsInputFile = require("../Files/ColumnsInputFile.json");
const ColumnsInputFileByInput = require("../Files/ColumnsInputFileByInput.json");

const ColumnsOutputFile = require("../Files/ColumnsOutputFile.json");
const ColumnsFullOutputFile = require("../Files/ColumnsOutputFullFile.json");

const ColumnsSurfaceTRFile = require("../Files/ColumnsSurfaceTRFile.json");
const ColumnsMrrFile = require("../Files/ColumnsMrrFile.json");
const ColumnsRMFile = require("../Files/ColumnsRmFile.json");
const values = require("../Files/SavedValues.json");

const fs = require("fs");
const Util = require("../Utilities");
const AlgoController = require("./Calculation");
const CalculateByInputController = require("./CalculationByInput");

const FileAnalysis = require("./KeyMachineProc");
const PartCalculation = require("../Model/PartCalculation");
const PartAcssesability = require("../Model/PartAcssesability");

const CRawMaterialFile = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/InputFiles/CRawMaterial.csv';
const CMrrFile = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/InputFiles/CMRR.csv';
const CSTRFile = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/InputFiles/SurfaceTreatment.csv';
const inputFile = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/InputFiles/InputMD.csv';

const  OutputPath= '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/ODashboard.csv';
const MrrOutputPath = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/OMRRDashboard.csv';
const AccsesabilityOutputPath = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/OAccsesabilityDashboard.csv';
const OutputFullData = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/OFullData.csv';
const PricesOutputPath = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/OPriceDashboard.csv';
const TimesOutputPath = '/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Script/OutputFiles/OTimesDashboard.csv';


//Files
const ReadInputFile = async (req, res, next) => {
    ConsoleStart();
    let table =fs.readFileSync(inputFile, "utf8").split("\r\n");
    const arr=[];
    let partsCount=table.length-1;
    let genIndex=0;

    for(el of table){
        
        let row=el.split(",");
        let p=row[ColumnsInputFileByInput.PN];
        let index=row[ColumnsInputFileByInput.Index];
        if(genIndex>0){
            console.log("part : "+p+"...."+index+" / "+partsCount);
            let filePathValid="not valid path to file";

            if (fs.existsSync(row[ColumnsInputFileByInput.file])) {
                filePathValid=row[ColumnsInputFileByInput.file];
            }

            const part=new Part({
                PN:row[ColumnsInputFileByInput.PN],
                Index:row[ColumnsInputFileByInput.Index],
                FilePath:filePathValid,
                KeyMachine:row[ColumnsInputFileByInput.KeyMachine],
            });

            const centroidPoint=new Point({
                x:row[ColumnsInputFileByInput.CenterX],
                y:row[ColumnsInputFileByInput.CenterY],
                z:row[ColumnsInputFileByInput.CenterZ]
            });

            const partInfo=new PartInfo({
                KeyMachine:row[ColumnsInputFileByInput.KeyMachine],
                KeyMachineSetups:row[ColumnsInputFileByInput.KeyProcesses],
                OtherSetUps:row[ColumnsInputFileByInput.AdditionProcesses],
                AroundAxis:row[ColumnsInputFileByInput.AroundAxis],
                MD:row[ColumnsInputFileByInput.MD],                
                STR:false,
                ComplexityLevel:row[ColumnsInputFileByInput.ComplexityLevel],
                Threads:row[ColumnsInputFileByInput.Threads],
                Holes:row[ColumnsInputFileByInput.Holes],
            });

            const boundingInfo=new Bounding({
                PartNumber:row[ColumnsInputFileByInput.PN],
                MiddlePoint:centroidPoint,
                L:row[ColumnsInputFileByInput.L],
                W:row[ColumnsInputFileByInput.W],
                H:row[ColumnsInputFileByInput.H],
                HAxis:row[ColumnsInputFileByInput.Haxis],
                WAxis:row[ColumnsInputFileByInput.Waxis],
                LAxis:row[ColumnsInputFileByInput.Laxis],
                VolumNet:row[ColumnsInputFileByInput.NetVolume], 
                Surface:row[ColumnsInputFileByInput.Surface],
                NetWeight:row[ColumnsInputFileByInput.NetWeight],
                SurfaceTreatment:row[ColumnsInputFileByInput.SurfaceTreatment],
            });

            boundingInfo.Volum=CalculateByInputController.GetPartGrossVolume(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.VolumGroup=CalculateByInputController.GetPartVolumeGroup(boundingInfo.Volum);
            boundingInfo.SurfaceGroup=CalculateByInputController.GetPartSurfaceGroup(boundingInfo.Surface);
            boundingInfo.Size=CalculateByInputController.GetPartSize(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Shape=CalculateByInputController.GetPartShape(boundingInfo.L,boundingInfo.W,boundingInfo.H);

            const RawMaterial = await CRawMaterial.find({ RawMaterial:row[ColumnsInputFileByInput.RM]}).exec();
            part.RawMaterial=RawMaterial[0];
            part.BoundingInfo=boundingInfo;
            part.BoundingInfo.ChargableWeight=CalculateByInputController.GetPartChargableWeight(part);
            part.PartInfo=partInfo;

            //Added for Accsesability.
            const Calculation=await FileAnalysis.CalculateKeyMachineProcesses(part);
            part.PartCalculation=Calculation!=null?Calculation:null;
        
            const Acssesability=await FileAnalysis.CalculatePartAccsesability(part);
            part.PartAcssesability=Acssesability!=null?Acssesability:null;
           
            let str = CalculateByInputController.GetPartSTR(part);
            part.PartInfo.STR=str;

            const productionProcesses=await CalculateByInputController.CalculateProductionProcesses(part);
            if (productionProcesses != null) {
                part.ProductionProcesses=productionProcesses;
                const partResults=await CalculateByInputController.CalculatePartResults(part);
                part.PartResults=partResults;
                arr.push(part);
            }
        }
        genIndex++;
    }
    SaveAll(arr);
    ConsoleEndGood();
    res.status(200).send('OK');
}

const ReadInputFileScript = async (req, res, next) => {
    ConsoleStart();
    let table =fs.readFileSync(inputFile, "utf8").split("\r\n");
    const arr=[];
    
    for(el of table){
        let row=el.split(",");
        let p=row[ColumnsInputFile.PN];
        let index=row[ColumnsInputFile.Index];
        if(p!="Part Number" && p!=""){
            let filePathValid='not valid file';
            if (fs.existsSync(row[ColumnsInputFile.file])) {
                filePathValid=row[ColumnsInputFile.file];
            }

            const part=new Part({
                PN:row[ColumnsInputFile.PN],
                Index:index,
                FilePath:filePathValid,
                KeyMachine:row[ColumnsInputFile.KeyMachine],
            });

            const centroidPoint=new Point({
                x:row[ColumnsInputFile.CenterX],
                y:row[ColumnsInputFile.CenterY],
                z:row[ColumnsInputFile.CenterZ]
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
                VolumNet:parseFloat(row[ColumnsInputFile.NetVolume]), //DM^3
                Surface:parseFloat(row[ColumnsInputFile.Surface]),
                SurfaceTreatment:row[ColumnsInputFile.SurfaceTreatment],
            });

            const RawMaterial = await CRawMaterial.find({ RawMaterial:row[ColumnsInputFile.RM]}).exec();
            part.RawMaterial=RawMaterial[0];

            boundingInfo.Size=AlgoController.GetPartSize(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Shape=AlgoController.GetPartShape(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            boundingInfo.Volum=AlgoController.GetPartGrossVolume(boundingInfo.L,boundingInfo.W,boundingInfo.H);
            part.BoundingInfo=boundingInfo;
            part.BoundingInfo.ChargableWeight=AlgoController.GetPartChargableWeight(part);

            // let str=row[ColumnsInputFile.STR]=='Y'?true:false;
            let str = AlgoController.GetPartSTR(part);
            const partInfo=new PartInfo({
                KeyMachine:row[ColumnsInputFile.KeyMachine],            
                STR:str,
                ComplexityLevel:row[ColumnsInputFile.ComplexityLevel],
            });

            part.PartInfo=partInfo;
            const Calculation=await FileAnalysis.CalculateKeyMachineProcesses(part);
            if(Calculation!=null){
                part.PartCalculation=Calculation;
                const productionProcesses=await AlgoController.CalculateProduction(part,Calculation.KeyProductionProcesses);
                SaveAll(productionProcesses);

                if (productionProcesses != null) {
                        part.ProductionProcesses=productionProcesses;
                        part.Cost=await AlgoController.CalculateCost(part);
                        part.LT=AlgoController.CalculateLT(part);
                        part.BatchTime=AlgoController.CalculateBatchLT(part);
                        part.BatchCost=AlgoController.CalculateBatchPrice(part);

                        let rughingTime=0;
                        let finishingTime=0;
                        
                        // ## If no key machine in input file (-)
                        let keyMachine='-';   
                        let expensiveMachine=0;

                        for(let i=0;i<productionProcesses.length;i++){
                            let proc=productionProcesses[i];
                            if(proc.ProcessName=='Roughing'){
                                rughingTime+=proc.Time;                        
                            }
                            else{
                                finishingTime=proc.Time;
                                if(proc.Cost>expensiveMachine){
                                    expensiveMachine=proc.Cost;
                                    keyMachine=proc.Machine;
                                }
                            }
                        }

                        part.RoughingMinuets=rughingTime;
                        part.FinishingMinuets=finishingTime;

                        if(part.PartInfo.KeyMachine=='-'){
                            part.PartInfo.KeyMachine=keyMachine;
                            console.log('KeyMachine Calculated');
                        }
                        arr.push(part);
                }
            }
        }
    }

    SaveAll(arr);
    ConsoleEndGood();
    res.status(200).send('OK');
}

//Print: by file inputs
const PrintDashboard = async (req, res, next) => {

    const titles = []
    const data=[];

    for(let i=0;i<20;i++){
        let col1=ColumnsOutputFile[i.toString()];
        titles.push(col1);
    }   
    data.push(titles);
    const parts =await Part.find({}).exec();
        
    for(index in parts){
        let p=parts[index];
        let pn =p.PN;
        let keyMachine=p.PartInfo.KeyMachine;
        let isStr=p.PartInfo.STR;
        let keyProcessNumber=0;
        let additionlProcessNumber=0;

        p.ProductionProcesses.map((p)=>{
            if(p.Type=='Key'){
                keyProcessNumber+= p.ProcessesNumber;
            }
        });
        p.ProductionProcesses.map((p)=>{
            if(p.Type=='Additional'){
                additionlProcessNumber+= p.ProcessesNumber;
            }
        });
        let keyMachineProcessNumber=keyProcessNumber;
        let AdditionalProcess=additionlProcessNumber;
        let MachiningDirections=p.PartInfo.MD;
        let AroundAxis=p.PartInfo.AroundAxis;
        let MDSecondaeyAxis="Not calculated";
        let PartNetVolume=p.BoundingInfo.VolumNet;
        let PartGrossVolume=p.BoundingInfo.Volum;
        let PartSurface=p.BoundingInfo.Surface;
        let NumberOfHoles="Not calculated";
        let RoughingMinuets=p.RoughingMinuets;
        let FinishingMinuets=p.FinishingMinuets;
        let FineHolesThreads="Not calculated";
        let HolesTime="Not calculated";
        let UnitCost=p.Cost;
        let SetupCost=p.BatchCost;
        let UnitLeadTimeHours=(p.LT/60);
        let BatchLeadTimeDays=p.BatchTime;
        const dataRow=[];
        dataRow.push(pn);
        dataRow.push(keyMachine);
        dataRow.push(keyMachineProcessNumber);
        dataRow.push(isStr);
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
    fs.writeFile(OutputPath, csvData, (error) => {
    
    if (error) {
        ConsoleFileEndBad('Dashboard',error);
      } else {
        ConsoleFileEndGood('Dashboard');
    }
    });
      
    res.status(200).send(data);
}   
//Print: by calculation
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
        let keyMachine=p.PartInfo.KeyMachine;
        let isStr=p.PartInfo.STR;
        
        let keyProcessesObj=p.ProductionProcesses.filter((p)=>{
            if(p.Type=='Key')
                return p;
        });
        let AdditionalProcessObj=p.ProductionProcesses.filter((p)=>{
            if(p.Type=='Additional')
                return p;
        });

        let keyMachineProcessNumber=keyProcessesObj.length;
        let AdditionalProcess=AdditionalProcessObj.length;
        let MachiningDirections=p.PartInfo.MD;
        let AroundAxis=p.PartCalculation.AroundAxises.length;
        let MDSecondaeyAxis=AroundAxis>1?p.PartCalculation.AroundAxises[1].Directions.length:0;
        let PartNetVolume=p.BoundingInfo.VolumNet;
        let PartGrossVolume=p.BoundingInfo.Volum;
        let PartSurface=p.BoundingInfo.Surface;
        let NumberOfHoles=p.PartCalculation.FeatursNumber;
        let RoughingMinuets=p.RoughingMinuets;
        let FinishingMinuets=p.FinishingMinuets;
        let FineHolesThreads="";
        let HolesTime="";
        let UnitCost=p.Cost;
        let SetupCost=p.BatchCost;
        let UnitLeadTimeHours=(p.LT/60);
        let BatchLeadTimeDays=p.BatchTime;
        const dataRow=[];
        dataRow.push(pn);
        dataRow.push(keyMachine);
        dataRow.push(keyMachineProcessNumber);
        dataRow.push(isStr);
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
    fs.writeFile('/Users/hentorgeman/Dropbox (Chen Tech)/00 - Costing/Options based costing sheet/Automated costing/Test files/ResultFile.csv', csvData, (error) => {
    
        if (error) {
            ConsoleFileEndBad('Main',error);
          } else {
            ConsoleFileEndGood('Main');
        }
    });
      
    res.status(200).send(data);
}   
//Print: for analyzing mrr groups
const PrintMrrDashboard = async (req, res, next) => {

    const titles = []
    const data=[];
    titles.push("Part Number");
    titles.push("Complexity");
    titles.push("Accsesability");
    titles.push("Raw material");
    titles.push("L");
    titles.push("W");
    titles.push("H");
    titles.push("Side Buffer");
    titles.push("RM Volume mm3");
    titles.push("Part Volume mm3");
    titles.push("Remove Volume mm3");
    titles.push("Removal Rate");
    titles.push("Volume Group");
    titles.push("CM3 In 1Min");
    titles.push("Roughing Minitues");
    titles.push("Part Surface mm2");
    titles.push("Surface group");
    titles.push("CM2 In 1Min");
    titles.push("Finishing Minuets");
    titles.push("Featurs Number (Script)");
    titles.push("Featurs Number (CT)");
    titles.push("Step Rows Count");
    titles.push("Maximum Radius");
    titles.push("Minimum Radius");
    titles.push("Ab Normal Directions Number");
    titles.push("Maximum Distance Between Featurs");
    titles.push("Minimum Distance Between Featurs");
    titles.push("MD (Script)");



    const parts =await Part.find({}).exec();
    data.push(titles);
    for(index in parts){
        let p=parts[index];
        let pn =p.PN;
        let complexity=p.PartInfo.ComplexityLevel;
        let Accsesability=0;
        let rm=p.RawMaterial.RawMaterial;
        let l=p.BoundingInfo.L;
        let h=p.BoundingInfo.H;
        let w=p.BoundingInfo.W;
        let sidebuffer=values.RmBoundingBuffer;
        let rmVolume=p.BoundingInfo.Volum;
        let removeMM=(rmVolume-p.BoundingInfo.VolumNet);
        let removalRate=((rmVolume-p.BoundingInfo.VolumNet)/rmVolume)*100;
        let volumeNet=p.BoundingInfo.VolumNet;
        let volumeGroup=p.BoundingInfo.VolumGroup;
        let surface=p.BoundingInfo.Surface;
        let surfaceGroup=p.BoundingInfo.SurfaceGroup;
        let roughingMin=p.RoughingMinuets;
        let finishingMin=p.FinishingMinuets;
        const cm31min = await PartCalculationController.GetMrrTimeMinutes(p.RawMaterial.Material,p.BoundingInfo.VolumGroup,'Roughing');
        const cm21min = await PartCalculationController.GetMrrTimeMinutes(p.RawMaterial.Material,p.BoundingInfo.SurfaceGroup,'Finishing');

        const dataRow=[];
        dataRow.push(pn);
        dataRow.push(complexity);
        dataRow.push(Accsesability);
        dataRow.push(rm);
        dataRow.push(l);
        dataRow.push(w);
        dataRow.push(h);
        dataRow.push(sidebuffer);
        dataRow.push(rmVolume);
        dataRow.push(volumeNet);
        dataRow.push(removeMM);
        dataRow.push(removalRate);
        dataRow.push(volumeGroup);
        dataRow.push(cm31min);
        dataRow.push(roughingMin);
        dataRow.push(surface);
        dataRow.push(surfaceGroup);
        dataRow.push(cm21min);
        dataRow.push(finishingMin);
        dataRow.push(p.PartAcssesability.FeatursNumber);
        dataRow.push(dataRow);
        dataRow.push(p.PartAcssesability.StepRowsCount);
        dataRow.push(p.PartAcssesability.MaximumCircleRadius);
        dataRow.push(p.PartAcssesability.MinimumCircleRadius);
        dataRow.push(p.PartAcssesability.AbNormalDirectionsNumber);
        dataRow.push(p.PartAcssesability.MaximumDistanceBetweenCircles);
        dataRow.push(p.PartCalculation.MD);
        data.push(dataRow);
   
    }

    const csvData = data.map(d => d.join(',')).join('\n');
    fs.writeFile(MrrOutputPath, csvData, (error) => {
        if (error) {
            ConsoleFileEndBad('MRR Dashboard',error);
          } else {
            ConsoleFileEndGood('MRR Dashboard');
        }
    });
      
    res.status(200).send(data);
}  

const PrintFullData = async (req, res, next) => {
    const titles = []
    const data=[];

    for(let i=1;i<50;i++){
        let col1=ColumnsFullOutputFile[i.toString()];
        titles.push(col1);
    }   
    data.push(titles);
    const parts =await Part.find({}).exec();
    for(index in parts){
        let p=parts[index];
        let pn =p.PN;
        let complexity=p.PartInfo.ComplexityLevel;
        let Accsesability=0;
        let rm=p.RawMaterial.RawMaterial;
        let l=p.BoundingInfo.L;
        let h=p.BoundingInfo.H;
        let w=p.BoundingInfo.W;
        let sidebuffer=values.RmBoundingBuffer;
        let rmVolume=p.BoundingInfo.Volum;
        let removeMM=(rmVolume-p.BoundingInfo.VolumNet);
        let removalRate=((rmVolume-p.BoundingInfo.VolumNet)/rmVolume)*100;
        let volumeNet=p.BoundingInfo.VolumNet;
        let volumeGroup=p.BoundingInfo.VolumGroup;
        let surface=p.BoundingInfo.Surface;
        let surfaceGroup=p.BoundingInfo.SurfaceGroup;

        const cm31min = await PartCalculationController.GetMrrTimeMinutes(p.RawMaterial.Material,p.BoundingInfo.VolumGroup,'Roughing');
        const cm21min = await PartCalculationController.GetMrrTimeMinutes(p.RawMaterial.Material,p.BoundingInfo.SurfaceGroup,'Finishing');

        //Accesability
        let featNumber='';
        let rows='';
        let maxRadius='';
        let minRadius='';
        let abNormalDirections='';
        let MinimumDistance='';
        let MaximumDistance='';
        let isInch=''

        if(p.PartAcssesability!=null){ 

            featNumber=p.PartAcssesability.FeatursNumber;
            rows=p.PartAcssesability.StepRowsCount;
            maxRadius=p.PartAcssesability.MaximumCircleRadius;
            minRadius=p.PartAcssesability.MinimumCircleRadius;
            abNormalDirections=p.PartAcssesability.AbNormalDirectionsNumber;
            MinimumDistance=p.PartAcssesability.MinimumDistanceBetweenCircles;
            MaximumDistance=p.PartAcssesability.MaximumDistanceBetweenCircles;
            isInch=p.PartCalculation.IsInch;
        }
        else{
             featNumber='NotCalculated';
             rows='NotCalculated';
             maxRadius='NotCalculated';
             minRadius='NotCalculated';
             abNormalDirections='NotCalculated';
             MinimumDistance='NotCalculated';
             MaximumDistance='NotCalculated';
             isInch='NotCalculated';
        }

        //Production
        let keyMachine=p.PartInfo.KeyMachine;
        let isStr=p.PartInfo.STR;
        let MachiningDirections=p.PartInfo.MD;
        let AroundAxis=p.PartInfo.AroundAxis;
        let MDSecondaeyAxis="Not calculated";
        let UnitCost=p.Cost;
        let SetupCost=p.BatchCost;
        let UnitLeadTimeHours=(p.LT/60);
        let BatchLeadTimeDays=p.BatchTime;
        const productionProcesses=p.ProductionProcesses;

        // # Roughing | Finishing

        let roughingProcessesList= productionProcesses.filter(pro=>{
            if(pro.ProcessName=='Roughing') return pro;
        });
        let holderProceesesList= productionProcesses.filter(pro=>{
            if(pro.ProcessName=='Holder') return pro;
        });
        let finishingProcessesList= productionProcesses.filter(pro=>{
            if(pro.ProcessName=='Finishing') return pro;
        });

        let roughing=roughingProcessesList[0];
        let roughingMin=roughing.Time;
        let roughingCost=roughing.Cost;
        let additionalProcess=roughing.ProcessesNumber;
        holderProceesesList.map(p=>{
            additionalProcess+=p.ProcessesNumber;
        });

        let finishing=finishingProcessesList[0];
        let finishingMin=finishing.Time;
        let finishingCost=finishing.Cost;
        keyProcessNumber=finishing.ProcessesNumber;
       
        let keyMachineProcessNumber=keyProcessNumber;


        let surfaceTreatmentCost=0;
        let surfaceTreatmentLT=0;
        let materialCost=0;
        let materialLT=0;


        // # Surface Treatment
        let strObj=await PartCalculationController.GetSurfaceTreatment(p.BoundingInfo.SurfaceTreatment);
        if(strObj!=null){
            let surfaceDM=p.BoundingInfo.Surface/values.UnitConvert.Dm2ToMm2;
            surfaceTreatmentCost=surfaceDM*strObj.Cost;
            surfaceTreatmentLT=strObj.LeadTime;
        }

        // # packing Price

        let chargableWeight=p.BoundingInfo.ChargableWeight;
        let packingCost=chargableWeight*values.Shipping.China.NetToGrossWeight*(values.Shipping.China.DomesticDeliveryCostPerKg+values.Shipping.China.PackingCostPerKG);
    
        // # Material Price
        materialCost= CalculateByInputController.GetPartMaterialWeight(p)*p.RawMaterial.PricePerKg;
        materialLT=p.RawMaterial.LT;

        const dataRow=[];
        dataRow.push(pn);          
        dataRow.push(complexity);
        dataRow.push(Accsesability);
        dataRow.push(rm);
        dataRow.push(l.toFixed(1));
        dataRow.push(w.toFixed(1));
        dataRow.push(h.toFixed(1));
        dataRow.push(sidebuffer);
        dataRow.push(rmVolume.toFixed(1));
        dataRow.push(volumeNet.toFixed(1));
        dataRow.push(removeMM.toFixed(1));
        dataRow.push(removalRate.toFixed(1));
        dataRow.push(volumeGroup);
        dataRow.push(cm31min.toFixed(1));
        dataRow.push(roughingMin);
        dataRow.push(surface.toFixed(1));
        dataRow.push(surfaceGroup);
        dataRow.push(cm21min.toFixed(1));
        dataRow.push(finishingMin); 
        dataRow.push(p.PartInfo.Holes); 
        dataRow.push(p.PartInfo.Threads); 
        dataRow.push(p.HolesMinuets); 
        dataRow.push(p.ThreadsMinuets); //23

        dataRow.push(rows);
        dataRow.push(featNumber);
        dataRow.push(maxRadius);
        dataRow.push(minRadius);
        dataRow.push(MaximumDistance);
        dataRow.push(MinimumDistance);
        dataRow.push(abNormalDirections);
        dataRow.push(isInch);

        dataRow.push(finishingCost);
        dataRow.push(roughingCost);
        dataRow.push(materialCost);
        dataRow.push(materialLT);
        dataRow.push(surfaceTreatmentCost);
        dataRow.push(surfaceTreatmentLT);
        
        dataRow.push(isStr);
        dataRow.push(MachiningDirections);
        dataRow.push(AroundAxis);
        dataRow.push(MDSecondaeyAxis);
        dataRow.push(additionalProcess);

        dataRow.push(keyMachine);
        dataRow.push(keyMachineProcessNumber);
        dataRow.push(UnitCost.toFixed(2));
        dataRow.push(SetupCost.toFixed(2));
        dataRow.push(UnitLeadTimeHours.toFixed(2));
        dataRow.push(BatchLeadTimeDays.toFixed(2));
        dataRow.push(packingCost);

        data.push(dataRow);
    }

    const csvData = data.map(d => d.join(',')).join('\n');
    fs.writeFile(OutputFullData, csvData, (error) => {
        if (error) {
            ConsoleFileEndBad('Full-OutPut',error);
          } else {
            ConsoleFileEndGood('Full-OutPut');
        }
    });
      
    res.status(200).send(OutputFullData);
}  
const PrintAccsesabilityDashboard = async (req, res, next) => {

    const titles = []
    const data=[];
    titles.push("Part Number");
    titles.push("Complexity");
    titles.push("Step File Rows");
    titles.push("Number of Feateures");
    titles.push("Max Radius");    
    titles.push("Min Radius");    
    titles.push("Max distance between featuers");    
    titles.push("Min distance between featuers");
    titles.push("AbNormal directions");
    titles.push("IsInch?");

    const parts =await Part.find({}).exec();
    data.push(titles);
    for(index in parts){
        let p=parts[index];
        let pn =p.PN;
        let complexity=p.PartInfo.ComplexityLevel;
        let featNumber='';
        let rows='';
        let maxRadius='';
        let minRadius='';
        let abNormalDirections='';
        let MinimumDistance='';
        let MaximumDistance='';
        let isInch=''

        if(p.PartAcssesability!=null){ 

            featNumber=p.PartAcssesability.FeatursNumber;
             rows=p.PartAcssesability.StepRowsCount;
             maxRadius=p.PartAcssesability.MaximumCircleRadius;
             minRadius=p.PartAcssesability.MinimumCircleRadius;
             abNormalDirections=p.PartAcssesability.AbNormalDirectionsNumber;
             MinimumDistance=p.PartAcssesability.MinimumDistanceBetweenCircles;
             MaximumDistance=p.PartAcssesability.MaximumDistanceBetweenCircles;
             isInch=p.PartCalculation.IsInch;
        }
        else{
             featNumber='NotCalculated';
             rows='NotCalculated';
             maxRadius='NotCalculated';
             minRadius='NotCalculated';
             abNormalDirections='NotCalculated';
             MinimumDistance='NotCalculated';
             MaximumDistance='NotCalculated';
             isInch='NotCalculated';
        }

        const dataRow=[];
        dataRow.push(pn);
        dataRow.push(complexity);
        dataRow.push(rows);
        dataRow.push(featNumber);
        dataRow.push(maxRadius);
        dataRow.push(minRadius);
        dataRow.push(MaximumDistance);
        dataRow.push(MinimumDistance);
        dataRow.push(abNormalDirections);
        dataRow.push(isInch);
        data.push(dataRow);
    }

    const csvData = data.map(d => d.join(',')).join('\n');
    fs.writeFile(AccsesabilityOutputPath, csvData, (error) => {
        if (error) {
            ConsoleFileEndBad('Accesability-Dashboard',error);
          } else {
            ConsoleFileEndGood('Accesability-Dashboard');
        }
    });
      
    res.status(200).send(data);
}

const ReadCMrrFile = async (req, res, next) => {
    let table =fs.readFileSync(CMrrFile, "utf8").split("\r\n");
    const Options=[];
    for(el of table){      
        let row=el.split(",");
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
            Options.push(Mrr);
        }
    }
    SaveAll(Options);
    ConsoleFileEndGood('MRR-DB');
    res.status(200).send('ok');
}
const ReadCSurfaceTreatmentFile = async (req, res, next) => {
    let table =fs.readFileSync(CSTRFile, "utf8").split("\r\n");
    const Options=[];
    for(el of table){      
        let row=el.split(",");
        let Name=row[ColumnsSurfaceTRFile.Name];
            let Material=row[ColumnsSurfaceTRFile.Material];
            let Type = row[ColumnsSurfaceTRFile.Type];
            if(Type!='Type'){
            let Color=row[ColumnsSurfaceTRFile.Color];
            let Cost=row[ColumnsSurfaceTRFile.Cost];
            let LeadTime=row[ColumnsSurfaceTRFile.LeadTime];

                const STR = new CSurfaceTreatment({
                    Name:Name,
                    Material:Material,
                    Type:Type,
                    Color:Color,
                    Cost:Cost,
                    LeadTime:LeadTime
                });

                Options.push(STR);
            }
    }
    SaveAll(Options);
    ConsoleFileEndGood('SurfaceTreatment-DB');
    res.status(200).send('ok');
}
const ReadCRawMaterialFile = async (req, res, next) => {
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
            PricePerKg:Price,
            LT:LT
        });

        const docs =await CMrr.find({ Material:RawMaterial.Material}).exec();
        RawMaterial.MrrOptions=docs;

        RawMaterials.push(RawMaterial);
        }
    }
    SaveAll(RawMaterials);

    ConsoleFileEndGood('RawMaterial-DB');
    res.status(200).send('ok');
}
//DB Many
const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await Feat.deleteMany({});
    await Direction.deleteMany({});
    await Bounding.deleteMany({});
    await SetUp.deleteMany({});
    await PartInfo.deleteMany({});
    await AroundAxis.deleteMany({});
    await ProductionSetUp.deleteMany({});
    await PartCalculation.deleteMany({});
    
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

//Consol Logs
function ConsoleStart(){
    console.log("## Start Processing.....🙏🏼 ##");
    console.log("## Start Time : "+GetTime());
}
function ConsoleEndGood(){
    console.log("## Complete Processing.....🟢 ##");
    console.log("## End Time : "+GetTime());
}
function ConsoleFileEndGood(fileName){
    console.log("## File Process "+fileName+" Completed.....🟢 ##");
}
function ConsoleFileEndBad(fileName,err){
    console.log("## Error in File Process "+fileName+" .....🔴 ##");
    console.error(err);

}
function ConsoleEndBad(){
    console.log("## Error In Processing.....🔴");
    console.log("## End Time : "+GetTime());
}


module.exports = {
    ReadInputFile,
    ReadInputFileScript,
    ReadCMrrFile,
    ReadCRawMaterialFile,
    ReadCSurfaceTreatmentFile,
    ClearDB,
    ClearMachineDB,
    ClearCMrrDB,
    ClearRawMaterialDB,
    Print,
    PrintDashboard,
    PrintMrrDashboard,
    PrintAccsesabilityDashboard,
    PrintFullData,

};