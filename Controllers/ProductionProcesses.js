
const CMrr = require("../Model/CMrr");
const ProductionProcesses = require("../Model/ProductionSetUp");
const KeyProcessesOption = require("../Model/KeyProcessesOption");


const values = require("../Files/SavedValues.json");

function CreateRoughingProcess(processName,minutes,processNumber,machine){
    let cost=0;
    if(machine=='3 Axis'){
        cost=minutes*values.Machines["Machine3AxisCostMin"];
    }
    if(machine=='4 Axis'){
        cost=minutes*values.Machines["Machine4AxisCostMin"];

    }
    if(machine=='4 Axis'){
        cost=minutes*values.Machines["Machine5AxisCostMin"];
    }
    
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Additional',
            Machine:machine,
            ProcessesNumber:processNumber,
            Time:minutes,
            Cost:cost
    });
    return productionProcess;
}

function Create3AxisProcess(processName,minutes,processNumber){
    let cost=minutes*values.Machines["Machine3AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Key',
            Machine:'3 Axis',
            ProcessesNumber:processNumber,
            Time:minutes,
            Cost:cost
    });
    return productionProcess;
}
function Create4AxisProcess(processName,minutes,processNumber){
    let cost=minutes*values.Machines["Machine4AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Key',
            Machine:'4 Axis',
            ProcessesNumber:processNumber,

            Time:minutes,
            Cost:cost
    });
    return productionProcess;

      
}
function Create5AxisProcess(processName,minutes,processNumber){
    let cost=minutes*values.Machines["Machine5AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            ProcessesNumber:processNumber,
            Type:'Key',
            Machine:'5 Axis',
            Time:minutes,
            Cost:cost
    });
    return productionProcess;

}

function CreateOption(pn,keyMachine,list){
    const option = new KeyProcessesOption({
        PN:pn,
        Processes:list,
        KeyMachine:keyMachine
    });
    return option;
}


//#Pulling db data
const GetProcessCost=(material,size,processName)=>
    new Promise(async resolve=>{
    const docs =await CMrr.find({ Material:material,Size: size,ProcessName:processName}).exec();
    
    if(docs.length==0) resolve(null);
    if(docs.length>1) {
        console.log("#Error: Duplicate values in CMRR table");
        resolve(null);
    }
    else{
        resolve(docs[0].Lt);
    }
                 
});

module.exports = {
    GetProcessCost,
    CreateRoughingProcess,
    Create3AxisProcess,
    Create4AxisProcess,
    Create5AxisProcess,
    CreateOption

};
