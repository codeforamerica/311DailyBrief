/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var FilterBarController = function (appController) {
  this.app = appController;

  // update the Ward/Neighborhood/BoundaryTitle
  $('#boundaryTitle').html(Config.boundaryTitle);

  this.element = document.getElementById("filters");
  this.statusSelector = new MultiSelector(document.getElementById("filters_status"));
  this.areaSelector = new MultiSelector(document.getElementById("filters_area"));
  this.serviceSelector = new MultiSelector(document.getElementById("filters_service"));
  this.statusSelector.subscribe("change", this);
  this.areaSelector.subscribe("change", this);
  this.serviceSelector.subscribe("change", this);
  this.clearButton = document.getElementById("filters_clear");
  this._initializeFilters();
  this.clearButton.addEventListener("click", this, false);
};

FilterBarController.prototype = {
  constructor: FilterBarController,

  _initializeFilters: function () {
    this.statusSelector.setOptions([
      {name: "Currently Open", value: "open", checked: Config.statusSelectorValues.open},
      {name: "Opened Yesterday", value: "opened", checked: Config.statusSelectorValues.opened},
      {name: "Closed Yesterday", value: "closed", checked: Config.statusSelectorValues.closed}
    ]);

    this.statusSelector.updateLabel();
    var states = [];
    var selectedService = this.serviceSelector.getValue();
    var selectedArea = this.areaSelector.getValue();

    if (Config.statusSelectorValues.open) { states.push("open"); }
    if (Config.statusSelectorValues.opened) { states.push("opened"); }
    if (Config.statusSelectorValues.closed) { states.push("closed"); }

    // set filters to initialize with values based on config file
    // subsequent changes to filters will be sent via eventing system
    var filters = this._setFilters(selectedArea, selectedService, states);
    this.app.updateFilters(filters);

    this.updateFilters();
  },

  // need a public way to update the filters so that they can get populated with
  // data after the API callback returns
  updateFilters: function() {
    this.areaSelector.setOptions(this.app.areas.map(function (area) {
      return {name: area.name};
    }));
    this.areaSelector.setValue(null);
    this.serviceSelector.setOptions(this.app.services.map(function (service) {
      return {
        name: service.service_name,
        value: service.service_code
      };
    }));
    this.serviceSelector.setValue(null);
  },

  _setSelectOptions: function (selectElement, options) {
    for (var i = 0, len = options.length; i < len; i++) {
      var optionElement = document.createElement("option");
      console.log(options[i].name);
      optionElement.value = options[i].value || options[i].name;
      optionElement.appendChild(document.createTextNode(options[i].name));
      selectElement.appendChild(optionElement);
    }
  },

  /*
   * Utility to create the filters object
   */
  _setFilters: function(area, service, state) {
   return { area: area || null,
        services: service ? service : null,
          states: state ? state : ["open", "opened", "closed"],
       dateRange: this.app.filterConditions.dateRange };
  },

  handleEvent: function (event) {

    var selectedService = this.serviceSelector.getValue();
    var selectedState = this.statusSelector.getValue();
    var selectedArea = this.areaSelector.getValue();

    if (event.target === this.clearButton) {
      this.serviceSelector.setValue();
      this.statusSelector.setValue();
      this.areaSelector.setValue();
      selectedService = null;
      selectedState = null;
      selectedArea = null;
      var filters = this._setFilters(selectedArea, selectedService, selectedState);
      this.dispatchEvent("filtersChanged", filters);
    }

    var filters = this._setFilters(selectedArea, selectedService, selectedState);

    if (event.type === "change") {
      this.dispatchEvent("filtersChanged", filters);
    }

    $(this.element)
      [selectedService || selectedState || selectedArea ? "addClass" : "removeClass"]("has-filters")
  }
};
