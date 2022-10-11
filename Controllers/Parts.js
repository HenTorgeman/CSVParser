const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const CoCircel = require("../Model/CoCircel");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");
const filePath = "C:\\Users\\hen-t\\Desktop\\AutoCosting_Script_Files\\ScriptReading\\01-ScriptInput.csv";

const colPartNumber=0;
const colPath=1; 
const colMsOrigin=4; 
const colMsToPrint=5; 
const parts=[];


const Start = async (req, res, next) => {
    var data =fs.readFileSync(filePath, "utf8").split("\r\n");
    var table=data;
    let partsCount=table.length-1;

    table.map(async (el)=>{
        console.log("## 00 Start looping the parts");
        const row=el.split(",");
        const pn=row[colPartNumber];
        if(pn.toString().trim()==='Part' || pn.toString().trim()===''){
            console.log("Title");
        }
        else{
            const path=row[colPath];
            // var originMs=row[colMsOrigin];
            const partData = fs.readFileSync(path, "utf8").split("\r\n");        
            // var coCirclesArr=[];
            
            parts.push(pn);
            const circlesArr = await CalcController.GetCirclesArr(partData, pn);
           await saveAll(circlesArr);
            const coCirclesArr = await CalcController.GetCoCirclesArr(circlesArr,pn);
            await saveAll(coCirclesArr);
        }

    });
    res.status(200).send('ok');


}

const GetCompleteCircles = async (req, res, next) => {
    let rowNumber=parts.length;

    for(let i=0;i<rowNumber;i++){
        console.log("## Part "+ i);
        var pn=parts[i];
        var coCirclesArr=[]; 
        var circleArr=await Circel.find({'PN':pn}).exec();
        coCirclesArr=CalcController.GetCoCirclesArr(circleArr,pn);
        await saveAll(coCirclesArr);
    }

res.status(200).send('ok');

}


async function saveAll(docArray){
    // var total = docArray.length
    // if(total>0){
    // var doc = docArray.pop();
  console.log('### 22 saveAll');
    return Promise.all(docArray.map((doc) => doc.save()));

//   await doc.save(function(err, saved){
//       if (err) throw err;//handle error
//       console.log("Obj Saved in DB");  
//       if (--total) saveAll(docArray);
//       else{
//       } // all saved here
//     });
//}
// else{
//     console.log("XX: arr is not saved becase its Empty.");
// }
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
    GetCompleteCircles,
};
