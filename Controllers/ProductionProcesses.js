
const CMrr = require("../Model/CMrr");
const ProductionProcesses = require("../Model/ProductionProcesses");
const values = require("../SavedValues.json");

function CreateRoughingProcess(processName,minutes){
    let cost=minutes*values.Machines["Machine3AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Additional',
            Machine:'3 Axis',
            Time:minutes,
            Cost:cost
    });
    return productionProcess;

      
}

function Create3AxisProcess(processName,minutes){
    let cost=minutes*values.Machines["Machine3AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Key',
            Machine:'3 Axis',
            Time:minutes,
            Cost:cost
    });
    return productionProcess;

      
}
function Create4AxisProcess(processName,minutes){
    let cost=minutes*values.Machines["Machine4AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Key',
            Machine:'4 Axis',
            Time:minutes,
            Cost:cost
    });
    return productionProcess;

      
}


function Create5AxisProcess(processName,minutes){
    let cost=minutes*values.Machines["Machine5AxisCostMin"];
    const productionProcess=new ProductionProcesses ({
            ProcessName:processName,
            Type:'Key',
            Machine:'5 Axis',
            Time:minutes,
            Cost:cost
    });
    return productionProcess;

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
    Create5AxisProcess

};
