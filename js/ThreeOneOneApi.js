var ThreeOneOneApi = function () {

  this.MONGOHQ_API_BASE_URI = 'https://api.mongohq.com/databases/chicago/collections/'
  // this is jesse's key, using for now because Smart Chi's key is FUBAR
  this.MONGOHQ_API_KEY = 'tvepg5ejlqmvfh6ph52i'

};

ThreeOneOneApi.REQUEST_STATES = {
  OPEN: 'open',
  CLOSED: 'closed'
};

ThreeOneOneApi.prototype = {
  
  constructor: ThreeOneOneApi,

  find: function (collection, fields, query, results, callback, finalize, caller) {
    this._find(collection, query, results, 0, callback, finalize, caller);
  },

  findDistinct: function (fields, query, results, callback, caller) {

    var dataUri = this.MONGOHQ_API_BASE_URI + 
                  "distinct/" +
                  'documents?' +
                  '_apikey=' + this.MONGOHQ_API_KEY + "&" +
                  'q=' + query;

    $.getJSON(dataUri, function(data) {
        results = data[0];
        callback(results, caller);
    });
    
  },

  // get all documents from mongo, 100 at a time
  _find: function (collection, query, results, skipCount, callback, finalize, caller) {

    // save this context to self so we can make recursive call inside anon func 
    self = this;

    var dataUri = this.MONGOHQ_API_BASE_URI + 
                  collection + "/" +
                  'documents?' +
                  '_apikey=' + this.MONGOHQ_API_KEY + "&" +
                  'limit=100&' + 
                  'q=' + query + '&' +
                  'skip=' + skipCount;

    // keep calling until we cannot get any more data from API
    $.getJSON(dataUri, function(data) {
      if (data.length > 0) { 
        $.merge(results, data);
        callback(results, caller);
        skipCount += 100;
        self._find(collection, query, results, skipCount, callback, finalize, caller);
      } else {
        finalize(caller); // no more data, alert the caller
      }
    });

  }

};
