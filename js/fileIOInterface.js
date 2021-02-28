const fs = require('fs');

const CSVLineSeparator = '\n';
const CSVCellSeparator = ", ";


module.exports = {

    makeDirSync(dir)
    {
        if (!fs.existsSync(dir))
        {
            fs.mkdirSync(dir);
        }
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