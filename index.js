var cronLib = require('crontab'),
    Q = require('q'),
    _ = require('underscore');

function Cron(identifier) {
  this.crontab = Q.nfcall(cronLib.load);
  this.identifier = identifier;
  this.variables = {};

  this
    .set('job_template', 'bash -l -c \'<%= job %>\'')
    .set('output', '>> ./log/cron.log 2>&1')
    .set('path', process.cwd())
    .set('environment_variable', 'NODE_ENV')
    .set('environment', 'production')
    .job_type('command', '<%= task %> <%= output %>');
}

Cron.prototype.removeAll = function() {
  return this._enqueue(function(crontab) {
    crontab.remove({comment: this.identifier});
  });
};

Cron.prototype.save = function() {
  return this._enqueue(function(crontab) {
    crontab.save();
  });
};

Cron.prototype.set = function(key, value) {
  this.variables[key] = value;

  return this;
};

Cron.prototype.job_type = function(name, command) {
  var _this = this;
  _this[name] = function(task) {
    var variables = _.extend({}, _this.variables);
    variables.task = task;
    variables.job = _.template(command)(variables);

    return _.template(variables.job_template)(variables);
  };
  return this;
};

Cron.prototype.schedule = function(whenCallback, actions) {
  return this._enqueue(function(crontab) {
    var when, job, action;

    if (!_.isArray(actions)) {
      actions = [actions];
    }

    if (!_.isFunction(whenCallback)) {
      when = whenCallback;
      whenCallback = null;
    }


    for(var i = 0; i < actions.length; i++) {
      job = crontab.create(actions[i], when, this.identifier);

      if (whenCallback) {
        whenCallback(job);
      }
    }
  });
};

Cron.prototype._enqueue = function(fn) {
  var _this = this;
  this.crontab = this.crontab.then(function(crontab) {
    fn.call(_this, crontab);
    return crontab;
  });
  return this;
};


function CronJobs(tasksFile, identifier) {
  this.tasksFile     = tasksFile;
  this.identifier    = identifier;
  this.tasksFunction = require(this.tasksFile);
  this.cron          = new Cron(this.identifier);
}

CronJobs.prototype.clear = function() {
  this.cron.removeAll();
  this.cron.save();
};

CronJobs.prototype.add = function() {
  this.tasksFunction(this.cron);
  this.cron.save();
};

module.exports = CronJobs;
