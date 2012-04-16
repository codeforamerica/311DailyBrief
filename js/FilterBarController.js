var FilterBarController = function (appController) {
  this.app = appController;
  
  this.element = document.getElementById("filters");
  this.wardSelector = document.getElementById("filters_ward");
  this.serviceSelector = document.getElementById("filters_service");
  this.statusSelector = document.getElementById("filters_status");
  this.applyButton = document.getElementById("filters_apply");
  
  this._initializeFilters();
  
  this.applyButton.addEventListener("click", this, false);
};

FilterBarController.prototype = {
  constructor: FilterBarController,
  
  _initializeFilters: function () {
    this._setSelectOptions(this.statusSelector, [
      {name: "Currently Open", value: "open"},
      {name: "Opened Yesterday", value: "opened"},
      {name: "Closed Yesterday", value: "closed"}
    ]);
    this._setSelectOptions(this.wardSelector, this.app.areas.map(function (area) {
      return {name: area.name};
    }));
    this._setSelectOptions(this.serviceSelector, this.app.services.map(function (service) {
      return {
        name: service.service_name,
        value: service.service_code
      };
    }));
  },
  
  _setSelectOptions: function (selectElement, options) {
    for (var i = 0, len = options.length; i < len; i++) {
      var optionElement = document.createElement("option");
      optionElement.value = options[i].value || options[i].name;
      optionElement.appendChild(document.createTextNode(options[i].name));
      selectElement.appendChild(optionElement);
    }
  },
  
  handleEvent: function (event) {
    // this will all change when we have a more complicated multiselect control
    var selectedService = this.serviceSelector.value;
    var selectedState = this.statusSelector.value;
    
    // TODO: should have something around default values
    var filters = {
      ward: this.wardSelector.value || null,
      services: selectedService ? [selectedService] : null,
      states: selectedState ? [selectedState] : ["open", "opened", "closed"]
    };
    
    // dispatch an event that the filter conditions have changed
    this.dispatchEvent("filtersChanged", filters);
  }
};

eventManager.mix(FilterBarController);