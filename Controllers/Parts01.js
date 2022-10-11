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

const ReadPartsFile = async (req, res, next) => {
    const data = fs.readFileSync(filePath, "utf8").split("\r\n");
    let rowNumber=data.length-1;
    
    console.log("data");
    console.log(data);

    console.log("File rows");
    console.log(rowNumber);


    for(let i=1;i<rowNumber;i++){
        let row=data[i].split(",");
        let pn=row[colPartNumber];

        // await createPart(row,async (part)=>{
        //     var circles = await CoCircel.find({'PN':part.PN});
        //     console.log("## Co-cercles for part.");
        //     part.CoCircels=circles;
        //         await part.save(function (err) {
        //             if (err) throw err;
        //             else {
        //                 console.log("## Part saved in DB ");
        //                 }
        //             });
        //         });
        // }
        


        createPart(row,(part)=>{
            CoCircel.find({'PN':pn})
            .exec((err, docs) => {
                if (err) {
                    console.log("# error");
                    console.log(err);
                    cb('not ok');
                }
                else {
                        console.log("## Co-cercles for part.");
                        part.CoCircels=docs;
                        part.save(function (err) {
                            if (err) throw err;
                            else {
                                console.log("## Part saved in DB ");
                            }
                            });
                        }
            });
        });
    }
   res.status(200).send("ok");
}





async function createPart(row,cb){

    let pn=row[colPartNumber];
    let path=row[colPath];
    let originMs=row[colMsOrigin];
    console.log('## Creating PN : '+pn);

    var part=Part({
        PN:pn,
        FilePath:path,
        OriginalMS:originMs
    });

    var req={
        filePath:part.FilePath,
        pn:part.PN
    }                


    const promis1 = new Promise((resolve,reject)=>{CalcController.GetCircels(req,(data=>{
        console.log("GetCircels...Done");
        resolve('ok');
    }));});
    const promis2 = new Promise((resolve,reject)=>{CalcController.CreateCoCircels(req,(data=>{
        console.log("CreateCoCircels...Done");
        resolve('ok');
    }));});
    Promise.all([promis1,promis2]).then(values=>{console.log('Done Getting Part data.');
    cb(part)

});

//    await CalcController.GetCircels(req,(data)=>{
//         if(data=='ok'){
//             console.log("## Circles Created for Part :"+pn);

//             console.log("## Search for Co-cercles for part....");
//             CalcController.CreateCoCircels(req,(data)=>{
//                 if(data=='ok'){
//                     console.log("##Done Search for Co-cercles for part");
//                      cb(part)
//                 }
//             });
//         }    
//     });
 
}

// const ReadPartsFile = async (req, res, next) => {
//     const data = fs.readFileSync(filePath, "utf8").split("\r\n");
//     let rowNumber=data.length-1;
    
//     console.log("data");
//     console.log(data);

//     console.log("File rows");
//     console.log(rowNumber);


//     for(let i=1;i<rowNumber;i++){
//         let row=data[i].split(",");
//         let pn=row[colPartNumber];
//         let path=row[colPath];
//         let originMs=row[colMsOrigin];
//         console.log('## index : '+i +"PN : "+pn);

//         var part=Part({
//             PN:pn,
//             FilePath:path,
//             OriginalMS:originMs
//         });

//         var req={
//             filePath:part.FilePath,
//             pn:part.PN
//         }                
//         CalcController.CreateCoCircels(req,res,(data)=>{
//             CoCircel.find({'PN':pn})
//             .exec((err, docs) => {
//                 if (err) {
//                     console.log(err);
//                     res.status(200).send('not ok');
//                 }
//                 else {
//                     part.CoCircels=docs;
//                     parts.push(part);
//             }

//         });
//     });


//     // const data = fs.readFileSync(req.filePath, "utf8").split("\r\n");

// }
// res.status(200).send("ok");

// }

const ClearDB = async (req, res, next) => {
    await Circel.deleteMany({});
    await CoCircel.deleteMany({});
    await Direction.deleteMany({});
    await Part.deleteMany({});
    res.status(200).send("ok");
}



module.exports = {
    ReadPartsFile,
    ClearDB,
};
