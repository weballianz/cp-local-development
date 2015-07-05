var debug = require('debug')('ld:init');
var async = require('async');
var mkdirp = require('mkdirp');
var command = require('./command.js');
var fs = require('fs');
var _ = require('lodash');

module.exports = function(argv, systems, cb) {
  debug(system);

  var usage = 'Usage: init <system-name>\n e.g. init phase1';
  var sysName = argv._[1];
  if (!sysName) return cb(usage);
  if (!systems[sysName]) return cb('System not found: ' + sysName);

  var system = systems[sysName];
  var workspace = 'workspace-' + sysName;
  console.log('Initialising system:', sysName, system.stringify(), 'workspace: ' + workspace);

  // do all the setup
  async.series([
    createWorkspace,
    initRepos,
    checkoutBranches,
    npmInstalls,
    createDatabases
  ], cb);

  function createWorkspace(cb){
    mkdirp(workspace, cb);
  }

  function initRepos(cb) {
    async.map(system.services, initRepo, cb);
  }

  function initRepo(service, cb) {
    fs.exists(workspace + '/' + service.name, function(exists) {
      if (exists === true) return cb();
      //var cmd = 'cd ' + workspace + ' && git clone ' + service.repo + ' ' + service.name;
      var cmd = 'git clone ' + service.repo + ' ' + service.name;
      debug('initRepo', workspace, cmd);
      command(cmd, workspace, service.env, cb);
    });
  }

  function checkoutBranches(cb) {
    async.map(system.services, checkoutBranch, cb);
  }

  function checkoutBranch(service, cb) {
    //var cmd = 'cd ' + workspace + '/' + service.name + ' && git checkout ' + service.branch;
    var cmd = 'git checkout ' + service.branch;
    var dir = workspace + '/' + service.name;
    debug('checkoutBranch', dir, cmd);
    command(cmd, dir, service.env, cb);
  }

  function npmInstalls(cb) {
    async.map(system.services, npmInstall, cb);
  }

  function npmInstall(service, cb) {
    //var cmd = 'cd ' + workspace + '/' + service.name + ' && npm install .';
    var dir = workspace + '/' + service.name;
    var cmd = 'npm install .';
    debug('npmInstall', dir, cmd);
    command(cmd, dir, service.env, cb);
  }

  function createDatabases(cb) {
    async.map(system.services, createDatabase, cb);
  }

  function createDatabase(service, cb) {
    return cb();
  }

};