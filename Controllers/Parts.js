const Part= require("../Model/Part");
const Circel = require("../Model/Circel");
const CoCircel = require("../Model/CoCircel");
const Direction = require("../Model/Direction");
var CalcController = require("./Calc");
const fs = require("fs");
const filePath = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading/02-ScriptInput.csv'
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
    
    for(el of table){      
        let row=el.split(",");
        let pn=row[colPartNumber];
        if(pn.toString().trim()==='Part' || pn.toString().trim()===''){
            // Its Title
        }
        else{
            // Its Line
            console.log("## Calculate data for.. "+ pn);
            let path=row[colPath];
            console.log(path);
            let originMs=row[colMsOrigin];
            let partData = fs.readFileSync(path, "utf8").split("\r\n");                   
            //let fileArr=partData[0].split("\n");
            partsName.push(pn);
            const circlesArr = await CalcController.GetCirclesArr(partData, pn);
            saveAll(circlesArr);
            const coCirclesArr = await CalcController.GetCoCirclesArr(circlesArr,pn);
            saveAll(coCirclesArr);
            const directionArr = await CalcController.GetMSPart(coCirclesArr,pn);
            
            let radiusCount=0;
            let pinCount=0;
            let holesCount=0;
            let otherCount=0;
            let cBorCount=0;

            coCirclesArr.map((e)=>{
                if(e.type=='RADIUS')
                    radiusCount++;
                if(e.type=='PIN')
                    pinCount++;
                if(e.type=='OTHER')
                    otherCount++;
                if(e.type=='HOLE')
                    holesCount++;
                if(e.type=='CBOR')
                    cBorCount++;
            });


            //If found only 1 surface that requier machining we need to add another 1 for the buttom.
            let ms=directionArr.length;
            if(ms==1) ms=2;

            if(ms!=originMs) mistakeRange++;

            var part = Part({
                index: index,
                PN: pn,
                FilePath: path,
                CoCircels: coCirclesArr,
                Directions:directionArr,
                MS:ms,
                OriginalMS:originMs,
                RadiusCount:radiusCount,
                PinCount:pinCount,
                HolesCount:holesCount,
                OtherCount:otherCount,
                CBorCount:cBorCount,
            });
            parts.push(part);
            index++;
        }
    }
    saveAll(parts);
    console.log("## Done! All parts created!");
    res.status(200).send('Your mistake range is : ' + mistakeRange +' out of : '+parts.length);
}

const ReduceDirections=async(req,res,next)=>{


    // OverView all parts in db
        // for each part, save the direction and overall Part.circles
        //

    console.log("Start Reducing....");
    const parts = await Part.find({}).exec();
    
    for(p of parts){

        var directions=p.directions;


    }



}


async function saveAll(docArray){
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
