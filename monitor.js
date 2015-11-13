var _ = require("underscore");

module.exports = (function () {
    var update, printReservations, initReservation,
        taskTrackers = {},
        decayRate = 0.05, safetyMargin = 1.1,
        calcNewReservation;

    calcNewReservation = function (lastUsage, limit) {
        return Math.max(limit * 1.1, lastUsage - (lastUsage * decayRate));
    }; 

    update = function (tasks) {
        _.each(tasks, function (curTask, curTaskProp) {
            var taskTracker = initTaskTracker(curTask, curTaskProp),
                mostRecentEvent = curTask.getMostRecentEvent(),
                mostRecentUsage = curTask.getMostRecentUsage();

            if (taskTracker && mostRecentUsage && mostRecentUsage.startTime > taskTracker.lastEventTime) {
                taskTracker.reservations.cpuReservation = calcNewReservation(mostRecentUsage.sampledCpuUsage, taskTracker.limits.cpuLimit);
                taskTracker.reservations.memoryReservation = calcNewReservation(mostRecentUsage.maximumMemoryUsage, taskTracker.limits.memoryLimit);
                taskTracker.reservations.diskSpaceReservation = calcNewReservation(mostRecentUsage.meanLocalDiskSpaceUsed, taskTracker.limits.diskSpaceLimit);
            }
        });
    };

    initTaskTracker = function (task, taskProp) {
        var mostRecentEvent = task.getMostRecentEvent();
        if (!taskTrackers[taskProp] && mostRecentEvent) {
            taskTrackers[taskProp] = {
                lastEventTime: mostRecentEvent.time,
                reservations: {
                    cpuReservation: mostRecentEvent.cpuReservation,
                    memoryReservation: mostRecentEvent.memoryReservation,
                    diskSpaceReservation: mostRecentEvent.diskSpaceReservation
                },
                limits: {
                    cpuLimit: mostRecentEvent.cpuReservation,
                    memoryLimit: mostRecentEvent.memoryReservation,
                    diskSpaceLimit: mostRecentEvent.diskSpaceReservation
                }
            };
        }
        return taskTrackers[taskProp];
    };

    printReservations = function () {
        _.each(taskTrackers, function (curTracker) {
            console.log(curTracker.reservations);
        });
    };

    return {
        update: update,
        printReservations: printReservations
    };
}());