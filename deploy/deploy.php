<?php
/**
 * Author: Adegoke Obasa <adegokeobasa@gmail.com>
 */

require 'recipe/common.php';

serverList('servers.yml');


task('upload_envs', function () {
    upload(dirname(__DIR__) . '/env/.env.' . env('APPLICATION_ENV'), '{{deploy_path}}/current/env/.env');
});

task('pm2:deploy', function () {
    runLocally('pm2 deploy pm2.json {{APPLICATION_ENV}} --force');
});

task('pm2:start', function () {
    run('cd {{deploy_path}}/current && npm install --production && pm2 startOrRestart app.json --env production');
});

/**
 * Main task
 */
task('deploy', [
    'pm2:deploy',
    'upload_envs',
    'pm2:start',
])->desc('Deploy Project');

set('repository', 'git@github.com:releafgroup/ikeora-back-end.git');