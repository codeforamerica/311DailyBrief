var ThreeOneOneApi = function () {

};

ThreeOneOneApi.REQUEST_STATES = {
  OPEN: 'open',
  CLOSED: 'closed'
};

ThreeOneOneApi.prototype = {
  
  constructor: ThreeOneOneApi,

  find: function (collection, query, results, callback, finalize) {
    this._find(collection, query, results, 0, callback, finalize);
  },

  // get all documents from mongo, 100 at a time
  _find: function (collection, query, results, skipCount, callback, finalize) {

    // save this context to self so we can make recursive call inside anon func 
    self = this;

    // TODO: move these to proper app/local constant locations
    var MONGOHQ_API_BASE_URI = 'https://api.mongohq.com/databases/chicago/collections/'
    var MONGOHQ_API_KEY = 'o1rmgd84919ezzq9da58'

    var dataUri = MONGOHQ_API_BASE_URI + 
                  collection + "/" +
                  'documents?' +
                  '_apikey=' + MONGOHQ_API_KEY + "&" +
                  'limit=100&' + 
                  'q=' + query + '&' +
                  'skip=' + skipCount;

    // keep calling until we cannot get any more data from API
    $.getJSON(dataUri, function(data) {
      if (data.length > 0) { 
        $.merge(results, data);
        callback(results);
        skipCount += 100;
        self._find(collection, query, results, skipCount, callback, finalize);
      } else {
        finalize(); // no more data, alert the caller
      }
    });

  }

};
