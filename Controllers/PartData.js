const PartData = require("../Model/PD");
const fileUtilit = require("../Files");
var CalcController = require("./Calc");
const e = require("express");
const featuersWeight = require("../FeatuersWeight.json");
const featuersColumns = require("../FeatuersColumn.json");
const fs = require("fs");
const PD = require("../Model/PD");

const setFile = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading02/30-parts-ScriptInput.csv';
const inputFile = '/Users/hentorgeman/Desktop/AutomatedCosting/ScriptReading02/30-parts-ScriptInput.csv';

const CreateDataSet = async (req, res, next) => {
    console.log("## Reading file...."+GetTime());
    let fileTable =fs.readFileSync(setFile, "utf8").split("\r\n");
    let nodeIndex=0;

    const Pds=[];
    for(el of table){      
        let row=el.split(",");
        const pd=new PD({
            PartNumber:row[featuersColumns.PN],
            NodeIndex:nodeIndex,
            Description:row[featuersColumns.Description],
            H:row[featuersColumns.H],
            W:row[featuersColumns.W],
            L:row[featuersColumns.L],
            Hb:row[featuersColumns.Hb],
            Wb:row[featuersColumns.Wb],
            Lb:row[featuersColumns.Lb],
            MD:row[featuersColumns.MD],
            Surface:row[featuersColumns.Surface],
            NetWeight:row[featuersColumns.NetWeight],
            Volume:row[featuersColumns.Volume],
            MaxLength:row[featuersColumns.MaxLength],
            Shape:row[featuersColumns.Shape],
            MaterialVoulme:row[featuersColumns.MaterialVoulme],
            Dimensions:row[featuersColumns.Dimensions],
            ComplexityLevel:row[featuersColumns.ComplexityLevel],
            UnitCost:row[featuersColumns.UnitCost],
            UnitLT:row[featuersColumns.UnitLT],
        });

        Pds.push(pd);
        nodeIndex++;
    }
    SaveAll(Pds);


    //## Print the postman message
    const obj={
        
    }

    console.log("## Done 😀: "+nodeIndex+" Parts created" +GetTime());
    res.status(200).send(obj);
}

const GetPrice = async (req, res, next) => {
    console.log("## Calculate Price of ...."+GetTime());
    let inputFile =fs.readFileSync(inputFile, "utf8").split("\r\n");
    let nodeIndex=0;

    let row=el.split(",");
    const newPD=new PD({
            PartNumber:row[featuersColumns.PN],
            NodeIndex:nodeIndex,
            Description:row[featuersColumns.Description],
            H:row[featuersColumns.H],
            W:row[featuersColumns.W],
            L:row[featuersColumns.L],
            Hb:row[featuersColumns.Hb],
            Wb:row[featuersColumns.Wb],
            Lb:row[featuersColumns.Lb],
            MD:row[featuersColumns.MD],
            Surface:row[featuersColumns.Surface],
            NetWeight:row[featuersColumns.NetWeight],
            Volume:row[featuersColumns.Volume],
            MaxLength:row[featuersColumns.MaxLength],
            Shape:row[featuersColumns.Shape],
            MaterialVoulme:row[featuersColumns.MaterialVoulme],
            Dimensions:row[featuersColumns.Dimensions],
            ComplexityLevel:row[featuersColumns.ComplexityLevel],
            UnitCost:row[featuersColumns.UnitCost],
            UnitLT:row[featuersColumns.UnitLT],
        });

        Pds.push(pd);
        nodeIndex++;
        console.log("## Done 😀: "+nodeIndex+" Parts created" +GetTime());
        res.status(200).send(obj);
    }
function GetTime(){
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    return " "+ hours + ":" + minutes +":"+seconds;
}

async function SaveAll(docArray){
    return Promise.all(docArray.map((doc) => doc.save()));
}

module.exports = {
CreateDataSet,
GetPrice
};
