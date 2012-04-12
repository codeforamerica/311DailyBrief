var DailyBriefingController = function () {
  // default filters
  this.filterConditions = {
    ward: null, // null means the whole city
    states: [ThreeOneOneApi.REQUEST_STATES.OPEN, ThreeOneOneApi.REQUEST_STATES.CLOSED],
    services: null, // null means all services
    date: dateTools.yesterday()
  };
  
  this.requests = null;
  
  // initialize sub-controllers
  this.legend = new LegendController();
  this.legend.dataSource = this;
  
  this.filterBar = new FilterBarController();
  
  this._refreshData();
};

DailyBriefingController.prototype = {
  constructor: DailyBriefingController,
  
  _refreshData: function () {
    // TODO: call out to ThreeOneOneApi
    this.requests = sampleData;
    this.legend.update();
  }
  
  
};