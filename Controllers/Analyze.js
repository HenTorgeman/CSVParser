const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");

const filePath = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading/TG01-ScriptInput.csv'
const pnFilePath = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading/TG01-ScriptInput.csv'

const AnalyzeFile = async (req, res, next) => {

    console.log("## AnalyzeFile....");
    let data =fs.readFileSync(filePath, "utf8").split("\r\n");
    let dataRows=data;

    FindClosedShellCartesianPoints(dataRows);


    res.status(200).send(obj);
}


//(01-1)
const FindClosedShellCartesianPoints=(dataRows)=>
    new Promise(resolve=>{
    
        let closedShellRows=dataRows.filter(e=>{
            let r=e.split(" ");
            return r[2]==="CLOSED_SHELL";
        });
    
        var closedShellActionsArr = closedShellRows.at(0).split(" ");

            //get the direction AXIS2_PLACEMENT_3D
            for (let i = 0; i < closedShellActionsArr.length; i++) {
                if (closedShellActionsArr[i].includes("#")) {
                    if (closedShellActionsArr[i] != indexText) {
                        
                        //Assosiate actions LEVEL1
                        childActionIndex = closedShellActionsArr[i].toString().replace(/[^\w\s]/gi, '');
                        fileUtilit.GetPoint(table, childActionIndex, (Point) => {
                            if (Point!=null){

                            }
                        });
                    }
                }
            }

                
            
        resolve(null)
});

module.exports = {
    AnalyzeFile,
};
