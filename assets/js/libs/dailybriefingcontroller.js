/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var DailyBriefingController = function () {
  this.rebuildDataForBoundaries = false;

  eventManager.mix(FilterBarController);
  eventManager.mix(MultiSelector);

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

  this.requests = {
    open: [],
    opened: [],
    closed: []
  };

  this.areas = [];
  this.services = [];

  // initialize sub-controllers
  this.legend = new LegendController();
  this.legend.dataSource = this;
  this.map = new MapController();
  this.map.dataSource = this;
  this.filterBar = new FilterBarController(this);
  this.api = new ThreeOneOneApi();
  this.headerBar = new HeaderBarController();
  this.words = new WordsController();
  this.words.dataSource = this;

  eventManager.subscribe("filtersChanged", this);

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

  this.updateData();
};

DailyBriefingController.prototype = {
  constructor: DailyBriefingController,

  updateData: function () {
    // clear current data
    this.allRequests = {
      open: [],
      opened: [],
      closed: []
    };

    // boundary filters have to be computed on the server...?
    var boundaryFilter = "";
    if (this.rebuildDataForBoundaries && this.filterConditions.area) {
      boundaryFilter = ', "boundary": {"$in": ' + JSON.stringify(this.filterConditions.area) + '}';
    }

    // get all open requests from the API and refresh app controllers
    this.api.find('requests',
                  null,
                  '{"endpoint": ' + Config.endpoint + ', "status": "open"' + boundaryFilter + '}',
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

    // XXX this should be improved
    // the API expects to get date range calls with Date-1 Day to Date
    // Connected Bits endpoints stamp SR dates with local time (not UTC)
    // so dateTools.yesterdayFromDate() will return values based on local time
    // which, in the US, reduces some oddities with "yesterday" SRs getting
    // removed from display when it's midnight UTC time but still "today" in
    // the US
    var today = new Date(),
      yesterday = dateTools.yesterdayFromDate(today);
    console.log("pulling data with today=" + today + "and yesterday=", yesterday);

    // get all opened requests from the API and refresh app controllers
    this.api.find('requests',
                  null,
                  '{"endpoint": ' + Config.endpoint + ',' +
                   '"requested_datetime": ' +
                   '{$gte: "' + dateTools.simpleDateString(yesterday) + '"", ' +
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
                   '{$gte: "' + dateTools.simpleDateString(yesterday) + '"", ' +
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
  },

  post: function(doc, collection) {
    this.api.post(doc, collection);
  },

  updateFilters: function (newFilters) {
    var oldFilters = this.filterConditions;
    this.filterConditions = newFilters;

    if (this.rebuildDataForBoundaries && !(newFilters.area == null && oldFilters.area == null) && !this.arraysAreEquivalent(newFilters.area, oldFilters.area)) {
      // Because we might not be showing all markers, we're going to hit the server again. This should really be done client-side :\
      this.updateData();
      return;
    }

    // populate this.requests based on new filters
    this._filterData(newFilters);
  },

  currentFiltersEqual: function (filters) {
    return this.arraysAreEquivalent(filters.area, this.filterConditions.area) &&
           this.arraysAreEquivalent(filters.states, this.filterConditions.states) &&
           this.arraysAreEquivalent(filters.services, this.filterConditions.services) &&
           filters.dateRange.from.getTime() === this.filterConditions.dateRange.from.getTime() &&
           filters.dateRange.to.getTime() === this.filterConditions.dateRange.to.getTime();
  },

  _filterData: function (filters) {
    filters = filters || this.filterConditions;
    for (var state in this.allRequests) {
      // TODO: this should probably be an empty array for filtered out states; not doing so for the sake of the legend right now
      // if (~filters.states.indexOf(state)) {
        this.requests[state] = this.allRequests[state].filter(function (request) {
          var passesServices = filters.services == null || ~filters.services.indexOf(request.service_code);
              passesAreas = filters.area == null || ~filters.area.indexOf(request.boundary);
          return passesServices && passesAreas;
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
    this.words.update();
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
    // if it's the same array or if both are null/undefined
    if (a == b) {
      return true;
    }
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
