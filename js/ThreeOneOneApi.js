var ThreeOneOneApi = function () {

};

ThreeOneOneApi.REQUEST_STATES = {
  OPEN: 'open',
  CLOSED: 'closed'
};

ThreeOneOneApi.prototype = {
  
  constructor: ThreeOneOneApi,

  // get all documents from mongo, 100 at a time
  _find: function (collection, query, results, skipCount, callback) {
 
    console.log('running _find...');

    // TODO: move these to proper app/local constant locations
    var MONGOHQ_API_BASE_URI = 'https://api.mongohq.com/databases/chicago/collections/'
    var MONGOHQ_API_KEY = 'o1rmgd84919ezzq9da58'

    var dataUri = MONGOHQ_API_BASE_URI + 
                  collection + "/" +
                  'documents?' +
                  '_apikey=' + MONGOHQ_API_KEY + "&" +
                  'limit=100&' + 
                  'q={"endpoint": "baltimore", "status": "open"}&' +
                  'skip=' + skipCount;

    $.getJSON(dataUri, function(data) {
      results.push(data);
      callback(results);
      if (data.length > 0) {
        console.log('got data, running again');
        skipCount += 100;
        this._find(collection, query, results, skipCount, callback);
      }
    });

  }

};
