const fs = require('fs');

const CSVLineSeparator = '\n';
const CSVCellSeparator = ", ";


module.exports = {

    checkDirSync(dir)
    {
        return fs.existsSync(dir);
    },

    makeDirSync(dir)
    {
        if (!fs.existsSync(dir))
        {
            fs.mkdirSync(dir);
        }
    },

    readJSONSync(filename, callback)
    {
        let data = fs.readFileSync(filename);
        let json = JSON.parse(data);
    
        callback(json);
    },

    writeJSONSync(filename, json)
    {
        let data = JSON.stringify(json, null, 2);
        fs.writeFileSync(filename, data);
    },

    readCSVRecords(filename, callback)
    {
        try
        {
            fs.readFile(filename, 'utf8',  (err, data) =>
            {
                if (err) throw err;
                // console.log(data)

                let lines = data.split(CSVLineSeparator); //1st separator
                var i = lines.length;
                while(i--)
                {
                    if(lines[i] !== "")
                        lines[i] = lines[i].split(CSVCellSeparator); //2nd separator
                    else
                        lines.splice(i,1);
                }

                callback(lines);    //lines have been processed into records
            });
        }
        catch(e)
        {
            console.error(e);
        }
    },

    appendRecordSync(filename, record)
    {
        fs.appendFileSync(filename, record.join(CSVCellSeparator) + CSVLineSeparator);
    },


};