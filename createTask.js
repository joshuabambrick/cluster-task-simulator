var _ = require("underscore"),
    startEventTypes = [1], stopEventTypes = _.range(2, 6 + 1),
    startOrStopEventTypes = startEventTypes.concat(stopEventTypes),
    getByMinProp = function (obj, prop) {
        return _.reduce(obj, function (min, curItem) {
            return (min == null || curItem[prop] < min) ?  curItem : min;
        }, null);
    };

module.exports = function (jobId, taskIndex) {
    var updateEvents = [], registerEvent,
        updateUsages = [], registerUsage;

    registerEvent = function (fullEvent) {
        var ev = {
            time: fullEvent.time,
            isStart: _.contains(startEventTypes, fullEvent.eventType),
            cpuRequest: fullEvent.cpuRequest,
            memoryRequest: fullEvent.memoryRequest,
            diskSpaceRequest: fullEvent.diskSpaceRequest
        };

        if (_.contains(startOrStopEventTypes, fullEvent.eventType)) {
            updateEvents.push(ev);
        }
    };

    registerUsage = function (fullUsage) {
        var ev = {
            startTime: fullUsage.startTime,
            endTime: fullUsage.endTime,
            maximumMemoryUsage: fullUsage.maximumMemoryUsage,
            meanLocalDiskSpaceUsed: fullUsage.meanLocalDiskSpaceUsed,
            sampledCpuUsage: fullUsage.sampledCpuUsage
        };

        console.log("fullUsage");
        console.log(fullUsage);

        updateUsages.push(ev);
    };

    return {
        registerEvent : registerEvent,
        registerUsage : registerUsage,
        getMostRecentEvent: function () {
            return getByMinProp(updateEvents, "time");
        },
        getMostRecentUsage: function () {
            return getByMinProp(updateUsages, "startTime");
        }
    };
};