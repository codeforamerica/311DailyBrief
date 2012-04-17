var DailyBriefingController = function () {
  // default filters
  this.filterConditions = {
    ward: null, // null means the whole city
    states: ["open", "opened", "closed"],
    services: null, // null means all services
    dateRange: {
      from: dateTools.yesterday(),
      to: dateTools.today()
    }
  };
  
  this.requests = new Array();
  this.requests['open'] = new Array();
  this.requests['opened'] = new Array();
  this.requests['closed'] = new Array();
  
  // TODO: pull this data from the API
  this.areas = sampleAreas;
  this.services = sampleServices;
  
  // initialize sub-controllers
  this.legend = new LegendController();
  this.legend.dataSource = this;
  this.map = new MapController();
  this.map.dataSource = this;
  this.filterBar = new FilterBarController(this);
  this.api = new ThreeOneOneApi();
  this.headerBar = new HeaderBarController();
  
  eventManager.subscribe("filtersChanged", this);

  // TODO: by default we show all open requests, probably not a good idea
  this.api.find('requests',
                '{"endpoint": "baltimore", "status": "open"}',
                this.requests['open'],
                function(data, self) { 
                  console.log('returned open request count is: ' + data.length) 
                  self._refreshData()
                },
                function(controller) { 
                  // using the instantanious approach just above
                  // using this, finalize callback would only draw 
                  // on the map once all data is available
                  //controller._refreshData()
                },
                this);
  this.api.find('requests',
                '{"endpoint": "baltimore",' + 
                 '"requested_datetime": ' + 
                 '{$gte: "' + dateTools.simpleDateString(dateTools.yesterday()) + '"", ' +
                 '$lt: "' + dateTools.simpleDateString(dateTools.today()) + '"}}',
                this.requests['opened'],
                function(data, self) { 
                  console.log('returned opened request count is: ' + data.length) 
                  self._refreshData()
                },
                function(controller) {},
                this);
  
  this.api.find('requests',
                '{"endpoint": "baltimore",' + 
                 '"updated_datetime": ' + 
                 '{$gte: "' + dateTools.simpleDateString(dateTools.yesterday()) + '"", ' +
                 '$lt: "' + dateTools.simpleDateString(dateTools.today()) + '"}, ' +
                 '"status": "closed"}',
                this.requests['closed'],
                function(data, self) { 
                  console.log('returned opened request count is: ' + data.length) 
                  self._refreshData()
                },
                function(controller) {},
                this);

};

DailyBriefingController.prototype = {
  constructor: DailyBriefingController,
  
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
      this.filterConditions = event.data;
      this._refreshData();
    }
  },
};
