var DailyBriefingController = function () {
  // default filters
  this.filterConditions = {
    area: null, // null means the whole city
    states: ["open", "opened", "closed"],
    services: null, // null means all services
    dateRange: {
      // On Monday, we show Friday-Sunday instead of just Sunday
      from: (dateTools.today().getDay() === 1) ? dateTools.subtract(dateTools.today(), dateTools.ONE_DAY * 3) : dateTools.yesterday(),
      to: dateTools.today()
    }
  };
  
  this.allRequests = {
    open: [],
    opened: [],
    closed: []
  };
  
  this.requests = {
    open: [],
    opened: [],
    closed: []
  };
  
  this.areas = new Array();
  this.services = new Array();
  
  // initialize sub-controllers
  this.legend = new LegendController();
  this.legend.dataSource = this;
  this.map = new MapController();
  this.map.dataSource = this;
  this.filterBar = new FilterBarController(this);
  this.api = new ThreeOneOneApi();
  this.headerBar = new HeaderBarController();
  
  eventManager.subscribe("filtersChanged", this);

  // get all open requests from the API and refresh app controllers
  this.api.find('requests',
                null,
                '{"endpoint": ' + Config.endpoint + ', "status": "open"}',
                this.allRequests['open'],
                function(data, self) { 
                  console.log('returned open request count is: ' + data.length);
                  self._filterData();
                  self._refreshData();
                },
                function(controller) { 
                  // using the instantaneous approach just above
                  // using this, finalize callback would only draw 
                  // on the map once all data is available
                  //controller._refreshData()
                },
                this);

  // get all opened requests from the API and refresh app controllers
  this.api.find('requests',
                null,
                '{"endpoint": ' + Config.endpoint + ',' + 
                 '"requested_datetime": ' + 
                 '{$gte: "' + dateTools.simpleDateString(dateTools.yesterday()) + '"", ' +
                 '$lt: "' + dateTools.simpleDateString(dateTools.today()) + '"}}',
                this.allRequests['opened'],
                function(data, self) { 
                  console.log('returned opened request count is: ' + data.length);
                  self._filterData();
                  self._refreshData();
                },
                function(controller) {},
                this);
 
  // get all closed requests from the API and refresh app controllers
  this.api.find('requests',
                null,
                '{"endpoint": ' + Config.endpoint + ',' + 
                 '"updated_datetime": ' + 
                 '{$gte: "' + dateTools.simpleDateString(dateTools.yesterday()) + '"", ' +
                 '$lt: "' + dateTools.simpleDateString(dateTools.today()) + '"}, ' +
                 '"status": "closed"}',
                this.allRequests['closed'],
                function(data, self) { 
                  console.log('returned closed request count is: ' + data.length);
                  self._filterData();
                  self._refreshData();
                },
                function(controller) {},
                this);

  // this gets the collections of areas and services from the API
  // and passes them to the filterBar controller to use to populate the dropdowns 
  this.api.findDistinct('{"boundaries": 1}', 
                        '{"_id": ' + Config.endpoint + '}',
                        this.areas,
                        function(data, self) {
                          self.areas = data.boundaries;
                          self.services = data.services;
                          console.log("boundaries filter count: " 
                            + self.areas.length);
                          console.log("services filter count: " 
                            + self.services.length);
                          console.log("updating filter selectors");
                          self.filterBar.updateFilters();
                        },
                        this);
};

DailyBriefingController.prototype = {
  constructor: DailyBriefingController,
  
  updateData: function () {
    
  },
  
  updateFilters: function (newFilters) {
    if (!(newFilters.area == null && this.filterConditions.area == null) && !this.arraysAreEquivalent(newFilters.area, this.filterConditions.area)) {
      // TODO: hit the server to do new spatial queries
      console.error("Results are wrong because we need to do a new spatial query")
    }
    this.filterConditions = newFilters;
    
    // populate this.requests based on new filters
    this._filterData(newFilters);
  },
  
  _filterData: function (filters) {
    filters = filters || this.filterConditions;
    for (var state in this.allRequests) {
      // TODO: this should probably be an empty array for filtered out states; not doing so for the sake of the legend right now
      // if (~filters.states.indexOf(state)) {
        this.requests[state] = this.allRequests[state].filter(function (request) {
          return filters.services == null || ~filters.services.indexOf(request.service_code);
        }, this);
      // }
      // else {
      //   this.requests[state] = [];
      // }
    }
  },
  
  _refreshData: function () {
    console.log("_refreshData called: open requests count = " + 
                this.requests['open'].length);
    console.log("_refreshData called: opened requests count = " + 
                this.requests['opened'].length);
    console.log("_refreshData called: closed requests count = " + 
                this.requests['closed'].length);
    this.legend.update();
    this.map.update();
  },

  handleEvent: function (event) {
    if (event.type === "filtersChanged") {
      // alert(JSON.stringify(event.data));
      // TODO: should really copy event.data here
      this.updateFilters(event.data);
      this._refreshData();
    }
  },
  
  // FIXME: this really shouldn't be here
  // would be nice on Array.prototype...
  arraysAreEquivalent: function (a, b) {
    if (!a || !b || a.length !== b.length) {
      return false;
    }
    for (var i=0, len=a.length; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
};
