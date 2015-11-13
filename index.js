var express = require("express"),
    app = express(),
    _ = require("underscore"),
    lineReader = require("line-reader")
    multer  = require('multer'),
    upload = multer({dest: "/tmp/uploads"}),
    taskSet = require("./taskSet"),
    monitor = require("./monitor"),
    fieldTypes = {
        NUMBER: 0,
        BOOLEAN: 1,
        STRING: 2
    }, taskUsageProperties = [
        { prop: "startTime", type: fieldTypes.NUMBER },
        { prop: "endTime", type: fieldTypes.NUMBER },
        { prop: "jobId", type: fieldTypes.NUMBER },
        { prop: "taskIndex", type: fieldTypes.NUMBER },
        { prop: "machineId", type: fieldTypes.NUMBER },
        { prop: "meanCpuUsageRate", type: fieldTypes.NUMBER },
        { prop: "canonicalMemoryUsage", type: fieldTypes.NUMBER },
        { prop: "assignedMemoryUsage", type: fieldTypes.NUMBER },
        { prop: "unmappedPageCacheMemoryUsage", type: fieldTypes.NUMBER },
        { prop: "totalPageCacheMemoryUsage", type: fieldTypes.NUMBER },
        { prop: "maximumMemoryUsage", type: fieldTypes.NUMBER },
        { prop: "meanDiskIoTime", type: fieldTypes.NUMBER },
        { prop: "meanLocalDiskSpaceUsed", type: fieldTypes.NUMBER },
        { prop: "maximumCpuUsage", type: fieldTypes.NUMBER },
        { prop: "maximumDiskIoTime", type: fieldTypes.NUMBER },
        { prop: "cpi", type: fieldTypes.NUMBER },
        { prop: "mai", type: fieldTypes.NUMBER },
        { prop: "samplePortion", type: fieldTypes.NUMBER },
        { prop: "aggregationType", type: fieldTypes.BOOLEAN },
        { prop: "sampledCpuUsage", type: fieldTypes.NUMBER }
    ], taskEventsProperties = [
        { prop: "time", type: fieldTypes.NUMBER },
        { prop: "missingInfo", type: fieldTypes.NUMBER },
        { prop: "jobId", type: fieldTypes.NUMBER },
        { prop: "taskIndex", type: fieldTypes.NUMBER },
        { prop: "machineId", type: fieldTypes.NUMBER },
        { prop: "eventType", type: fieldTypes.NUMBER },
        { prop: "user", type: fieldTypes.STRING },
        { prop: "schedulingClass", type: fieldTypes.NUMBER },
        { prop: "priority", type: fieldTypes.NUMBER },
        { prop: "cpuRequest", type: fieldTypes.NUMBER },
        { prop: "memoryRequest", type: fieldTypes.NUMBER },
        { prop: "diskSpaceRequest", type: fieldTypes.NUMBER },
        { prop: "differentMachinesRestriction", type: fieldTypes.BOOLEAN }
    ],
    taskEventsFileFormName = "taskEventsCsv",
    taskUsageFileFormName = "taskUsageCsv";

app.all("/", upload.fields([
  { name: taskEventsFileFormName, maxCount: 1 },
  { name: taskUsageFileFormName, maxCount: 1 }
]), function (req, res) {
    res.sendFile(__dirname + "/uploadTaskEvents.html");

    if (req.files) {
        _.each(req.files, function (files, fileFormName) {
            var lr, file = files[0], isEventsFile = fileFormName === taskEventsFileFormName, curLineNo = 0;

            if (!/\.CSV$/i.test(file.originalname)) throw "invalid file name given: " + file.originalname;

            lineReader.eachLine(file.path, function(curLine, last, callback) {
                if (curLineNo++ > 500000) {
                    callback(false);
                } else {
                    var lineObj, fields = curLine.split(","), properties;
                    properties = isEventsFile ? taskEventsProperties : taskUsageProperties;
                    lineObj = _.object(_.map(fields, function (curField, curFieldIndex) {
                        var propertyDetails = properties[curFieldIndex];
                        curField = propertyDetails.type === fieldTypes.NUMBER ? +curField : (propertyDetails.type === fieldTypes.BOOLEAN ? !!curField : curField);
                        return [propertyDetails.prop, curField];
                    }));

                    if (isEventsFile) {
                        taskSet.registerEvent(lineObj);
                    } else {
                        taskSet.registerUsage(lineObj);
                    }
                    
                    if (!isEventsFile && curLineNo % 500 === 0) {
                        if (curLineNo % 5000 === 0) {
                            console.log("===");
                            // monitor.printData();
                        }
                        monitor.update(taskSet.getTasks());
                    }

                    callback();
                }
            });
        });
    }
});

app.listen(8080, function () { console.log("listening"); });
