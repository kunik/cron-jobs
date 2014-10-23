# cron-jobs

Command line tool for managing cron jobs for application.
Inspired by https://github.com/javan/whenever

## Installation

```sh
$ npm install cron-jobs
```

## Example of `cron-jobs.js`

```javascript
module.exports = function (cron) {
  cron
    .set('whenever_command', 'bundle exec whenever')

    .job_type('rake',    'cd <%= path %> && <%= environment_variable %>=<%= environment %> bundle exec rake <%= task %> --silent <%= output %>')
    .job_type('runner',  'cd <%= path %> && script/rails runner -e <%= environment %> "<%= task %>" <%= output %>')

    .schedule(function(j) {
      j.minute().at(30);
      j.hour().at(9);
      j.dom().on(24);
      j.month().in('dec');
    }, [
      cron.command('echo "you can use raw cron syntax too"'),
      cron.rake('db:drop'),
      cron.runner('hello()')
    ])
    .schedule(new Date(), cron.command('ls -la'))
    .schedule('0 3 * * *', cron.command('echo "hello"'))
    .schedule(function(j) {
      j.hour().every(2);
    }, cron.command('echo "Hello" | mail "mail@example.com"'));
};
```
