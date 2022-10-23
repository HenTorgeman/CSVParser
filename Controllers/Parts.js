const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const CoCircel = require("../Model/CoCircel");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");
const filePath = '/Users/hentorgeman/Desktop/ScriptReading/01-ScriptInput.csv'

const colPartNumber=0;
const colPath=1; 
const colMsOrigin=4; 
const colMsToPrint=5; 
const parts=[];

//---------------------------------------------------
// PROMISS IMPLIMITETION
//---------------------------------------------------


// const Start = async (req, res, next) => {
//     var data =fs.readFileSync(filePath, "utf8").split("\r\n");
//     var table=data;
//     let partsCount=table.length-1;

// for(el of table){        
//     console.log("## 00 Start looping the parts");
//         const row=el.split(",");
//         const pn=row[colPartNumber];
//         if(pn.toString().trim()==='Part' || pn.toString().trim()===''){
//         }
//         else{
//             const path=row[colPath];
//             var originMs=row[colMsOrigin];
//             const partData = fs.readFileSync(path, "utf8").split("\r\n");                    
//             parts.push(pn);
//             const circlesArr = await CalcController.GetCirclesArr(partData, pn);
//             saveAll(circlesArr);
//             const coCirclesArr = await CalcController.GetCoCirclesArr(circlesArr,pn);
//             saveAll(coCirclesArr);
//         }
//     }
//     res.status(200).send('ok');
// }

const Start = async (req, res, next) => {
  

            const parts=[];
            const partsName=[];
            const path="Files/DEMO.csv";
            let originMs=5;
            let index=0;
            let pn='DEMO';
            
            let partData = fs.readFileSync(path, "utf8").split("\r\n");                   
            let fileArr=partData[0].split("\n");
            partsName.push(pn);
            const circlesArr = await CalcController.GetCirclesArr(fileArr, pn);
            saveAll(circlesArr);
            const coCirclesArr = await CalcController.GetCoCirclesArr(circlesArr,pn);
            saveAll(coCirclesArr);

            var part = Part({
                index: index,
                PN: pn,
                FilePath: path,
                CoCircels: coCirclesArr,
                OriginalMS:originMs,
            });

        parts.push(part);
        saveAll(parts);
    res.status(200).send('ok');
}

async function saveAll(docArray){
  console.log('### 22 saveAll');
    return Promise.all(docArray.map((doc) => doc.save()));
}

const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    await Direction.deleteMany({});
    await Part.deleteMany({});
    res.status(200).send("ok");
}


module.exports = {
    Start,
    ClearDB,
};
