/*
 * Gather stats for N days from a start day
 * Requires: mongodb, optimist, moment from NPM
 * Set MONGO_NODE_DRIVER_HOST to mongo uri string (i.e. from MongoHQ admin page)
 */

var mongodb = require('mongodb'),
    argv = require('optimist').argv,
    moment = require('moment'),
    fs = require('fs');

// read input
var testStart = argv.date;
var testLengthDays = argv.days;
var completedTests = 0;

// set first date to analyize
var day = moment(testStart, "YYYY-MM-DD");
var prevDay = null;

var log = fs.createWriteStream('data.csv', {'flags': 'a'});

// connect to db and run through data gathering / file writing workflow
mongodb.Db.connect(process.env.MONGO_NODE_DRIVER_HOST, function(error, client) {

  var collection = new mongodb.Collection(client, 'requests');

  start();

  function start() {
    var memo = {};
    completedTests++;
    prevDay = moment(day).subtract('days', 1);

    console.log("Running for " + day.format('YYYY-MM-DD') + "/" + prevDay.format('YYYY-MM-DD'));
    memo.day = day.format('YYYY-MM-DD');
    getOpenedYesterday(memo);
  }

  function restart(memo) {

    console.log(memo);
    log.write(memo.day + "," + memo.openedYesterday + ","  + memo.closedYesterday + "," + memo.open + '\n');

    if (completedTests === testLengthDays) {
      client.close();
      return;
    }

    day.add('days', 1);
    start();
  }

  function getOpenedYesterday(memo) {

    var openedYesterday = collection.find({'endpoint':'boston',
      'requested_datetime':{$gte:prevDay.format('YYYY-MM-DD') + "\"",
      $lt:day.format('YYYY-MM-DD')}
    });

    openedYesterday.count(function(error, count) {
      console.log("  " + count + " opened documents(s) found");
      console.log("====================");
      memo.openedYesterday = count;

      getClosedYesterday(memo);
    });

  }

  function getClosedYesterday(memo) {

    var closedYesterday = collection.find({'endpoint':'boston',
     'status':'closed',
     'updated_datetime':{$gte:prevDay.format('YYYY-MM-DD') + "\"",
       $lt:day.format('YYYY-MM-DD')}
    });

    closedYesterday.count(function(error, count) {
      console.log("  " + count + " closed documents(s) found");
      console.log("====================");
      memo.closedYesterday = count;

      getOpenToday(memo);
    });

  }

  function getOpenToday(memo) {

    var allIncludingDay = collection.find({'endpoint':'boston',
     'updated_datetime':{$lte:day.format('YYYY-MM-DD')}
    });
    var closedBeforeDay = collection.find({'endpoint':'boston',
     'status':'closed',
     'updated_datetime':{$lt:day.format('YYYY-MM-DD')}
    });

    allIncludingDay.count(function(error, countTotal) {
      console.log("  " + countTotal + " total documents(s) found");
      console.log("====================");

      closedBeforeDay.count(function(error, countClosed) {
        console.log("  " + countClosed + " closed before day documents(s) found");
        console.log("====================");
        console.log("  " + countTotal - countClosed + " open documents(s) found");
        console.log("====================");
        memo.open = countTotal - countClosed;

        restart(memo);
      });
    });

  }

});

