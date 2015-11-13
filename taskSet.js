var createTask = require("./createTask");

module.exports = (function () {
    var tasks, ensureTask, registerEvent, registerUsage;

    tasks = {};

    ensureTask = function (taskUpdate) {
        var prop = taskUpdate.jobId + "-" + taskUpdate.taskIndex;
        if (!tasks[prop]) tasks[prop] = createTask(taskUpdate.jobId, taskUpdate.taskIndex);
        return tasks[prop];
    };

    registerEvent = function (ev) {
        var task = ensureTask(ev);
        task.registerEvent(ev);
    };

    registerUsage = function (usage) {
        var task = ensureTask(usage);
    };

    return {
        getTasks: function () { return tasks; },
        registerEvent: registerEvent,
        registerUsage: registerUsage
    };
}());