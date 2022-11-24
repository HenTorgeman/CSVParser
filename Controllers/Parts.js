const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");
const { Resolver } = require("dns");
const filePath = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading/03-ScriptInput.csv'
const colPartNumber=0;
const colPath=1;
const colMsOrigin=3;
const colMsToPrint=4;

const Start = async (req, res, next) => {

    console.log("## Reading file....");
    let data =fs.readFileSync(filePath, "utf8").split("\r\n");
    let table=data;
    let index=0;
    const parts=[];
    const partsName=[];
    let mistakeRange=0;
    const mistakeList=[];
    
    for(el of table){      
        let row=el.split(",");
        let pn=row[colPartNumber];
        if(pn.toString().trim()==='Part' || pn.toString().trim()===''){
            // Its Title
        }
        else{
            // Its Line
            console.log("## Calculate data for.. "+ pn +"....."+index+"/"+table.length);
            let path=row[colPath];
            let originMs=row[colMsOrigin];
            let partData = fs.readFileSync(path, "utf8").split("\r\n");                   
            partsName.push(pn);
            const circlesArr = await CalcController.GetCirclesArr(partData, pn);
            saveAll(circlesArr);
            const coCirclesArr = await CalcController.GetFeatArr(circlesArr,pn);
            saveAll(coCirclesArr);
            const directionArr = await CalcController.GetDirectionsArr(coCirclesArr,pn);
            const flag=await IsIncludeButtom(directionArr);
           
            if(flag==false) {
                const d=new Direction({
                    PN:pn,
                    DirectionAxis:'Buttom',
                    AbsAxis:'Buttom',
                });
                directionArr.push(d);
            }
            saveAll(directionArr);

            let directionString=GetAsString(directionArr);
            let ms=directionArr.length;

            if(ms!=originMs) {mistakeRange++;
                mistakeList.push(pn);
            }
            var part = Part({
                PN: pn,
                index: index,
                FilePath: path,
                Directions:directionArr,
                DirectionStr:directionString,
                MS:ms,
                OriginalMS:originMs,
            });
            parts.push(part);
            index++;
        }
    }
    saveAll(parts);
    console.log("## Done! All parts created!");

    const obj={
        title:'Your mistake range is : ' + mistakeRange +' out of : '+parts.length,
        list:mistakeList
    }

    res.status(200).send(obj);
}

async function saveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await Feat.deleteMany({});
    await Direction.deleteMany({});
    await Part.deleteMany({});
    res.status(200).send("ok");
}

const IsIncludeButtom=(directionArr)=>
new Promise(async resolve =>{
    
    let DirectionX=0;
    let DirectionY=0;
    let DirectionZ=0;
    let flag=true;

    for(d of directionArr){
        if(d.DirectionAxis =='X' || d.DirectionAxis =='-X') DirectionX++;
        if(d.DirectionAxis =='Y' || d.DirectionAxis =='-Y') DirectionY++;
        if(d.DirectionAxis =='Z' || d.DirectionAxis =='-Z') DirectionZ++;
    }
    if(DirectionX<2 && DirectionY<2 && DirectionZ<2){
        flag= false;
    }
    resolve(flag);
});
async function IsIncludeNegative(directsionArr){
    
    let directions=['X','Y','Z'];
    let DirectionX=0;
    let DirectionY=0;
    let DirectionZ=0;
    let flag=true;

    for(d of directionArr){
        if(d =='X' || d =='-X') DirectionX++;
        if(d =='Y' || d =='-Y') DirectionY++;
        if(d =='Z' || d =='-Z') DirectionZ++;
    }
    if(DirectionX<2 && DirectionY<2 && DirectionZ<2){
        flag= false;
    }

    return flag;
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

module.exports = {
    Start,
    ClearDB,
};
