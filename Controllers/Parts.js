const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const Feat = require("../Model/Feat");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");
const { Resolver } = require("dns");
const { time } = require("console");
const Bounding = require("../Model/Bounding");
const filePath = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading02/2-parts-ScriptInput.csv'

const colPartNumber=0;
const colPath=1;
const colMsOrigin=3;
const colComplexity=4;
const colH=7;
const colW=6;
const colL=5;


const Start = async (req, res, next) => {
    console.log("## Reading file....");
    let data =fs.readFileSync(filePath, "utf8").split("\r\n");
    let table=data;
    let index=0;
    const parts=[];
    const partsName=[];
    let mistakeRange=0;
    const mistakeList=[];

    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    console.log("##---START----- : "+ hours + ":" + minutes +":"+seconds);
    for(el of table){      
        let row=el.split(",");
        let pn=row[colPartNumber];
        if(pn.toString().trim()==='Part' || pn.toString().trim()===''){
        }
        else{    
            console.log("## Calculate data for.. "+ pn +"....."+index+"/"+table.length);
            let path=row[colPath];
            let originMs=row[colMsOrigin];
            let complexity=row[colComplexity];
            let w=row[colW];
            let h=row[colH];
            let l=row[colL];

            let partData = fs.readFileSync(path, "utf8").split("\r\n");                   
            partsName.push(pn);
            const circlesArr = await CalcController.GetCirclesArr(partData, pn);
            saveAll(circlesArr);
            const bounding=await CalcController.GetBounding(pn,partData,w,l,h);
            bounding.save();
            const featsArr = await CalcController.GetFeatArr(circlesArr,pn,bounding);
            saveAll(featsArr);
            const directionArr = await CalcController.GetDirectionsArr(featsArr,pn,bounding);
            saveAll(directionArr);

            //## Calc how many feats in part.
            let totalFeats=0;
            directionArr.map((d) =>totalFeats+=d.NumberOfFeat);

            //## Print the direction string
            let directionString=GetAsString(directionArr);
            let ms=directionArr.length;

            //## Print the correct sate
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
                FeatursNumber:totalFeats,
                BoundingBox:bounding,
                ComplexityLevel:complexity,
            });
            parts.push(part);
            index++;
        }
    }
    saveAll(parts);
     date_ob = new Date();
     hours = date_ob.getHours();
     minutes = date_ob.getMinutes();
     seconds = date_ob.getSeconds();
    console.log("##---DONE----- : "+ hours + ":" + minutes +":"+seconds);

    const obj={
        title:'Your mistake range is : ' + mistakeRange +' out of : '+parts.length,
        list:mistakeList
    }

    res.status(200).send(obj);
}

const Print = async (req, res, next) => {


const titles = ['PN','MS(o)','ComplexityLevel','L','W','H','','MS','MS Gap','Directions','KeyMachine','SetUps','Feats','MiddlePointX','MiddlePointY','MiddlePointZ'];
const data=[];
data.push(titles);
const parts =await Part.find({}).exec();
    
    
for(index in parts){
    let p=parts[index];
    let bound=p.BoundingBox;
    console.log(p);
    console.log(bound);

    const dataRow=[p.PN,p.OriginalMS,p.ComplexityLevel,p.BoundingBox.L,p.BoundingBox.W,p.BoundingBox.H,' ',p.Directions.length,(p.OriginalMS-p.MS),p.directionString,'machine','setupsnumber',p.FeatursNumber,p.BoundingBox.MiddlePoint.x,p.BoundingBox.MiddlePoint.y,p.BoundingBox.MiddlePoint.z];
    //  const dataRow=[p.PN,p.originMs,p.complexityLevel,'p.BoundingBox.H','p.BoundingBox.W','p.BoundingBox.L',p.directionString,'machine','setupsnumber',p.FeatursNumber,'p.BoundingBox.MiddlePoint.x','p.BoundingBox.MiddlePoint.y','p.BoundingBox.MiddlePoint.z',(p.OriginalMS-p.MS)];

    data.push(dataRow);
}

const csvData = data.map(d => d.join(',')).join('\n');
//'/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading02/10-parts-ScriptInput.csv'
fs.writeFile('/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading02/ResultFile.csv', csvData, (error) => {
// fs.writeFile('./ResultFile.csv', csvData, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('The CSV file was written successfully');
  }
});
  
    res.status(200).send(data);
}


async function saveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await Feat.deleteMany({});
    await Direction.deleteMany({});
    await Bounding.deleteMany({});
    await Part.deleteMany({});

    res.status(200).send("ok");
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
    Print,
    ClearDB,
};
