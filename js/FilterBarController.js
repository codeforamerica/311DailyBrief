var FilterBarController = function () {
  this.element = document.getElementById("filters");
  this.wardSelector = document.getElementById("filters_ward");
  this.serviceSelector = document.getElementById("filters_service");
  this.statusSelector = document.getElementById("filters_status");
  this.applyButton = document.getElementById("filters_apply");
  
  this.applyButton.addEventListener("click", this, false);
};

FilterBarController.prototype = {
  constructor: FilterBarController,
  
  handleEvent: function (event) {
    // this will all change when we have a more complicated multiselect control
    var selectedService = this.serviceSelector.value;
    var selectedState = this.statusSelector.value;
    
    // TODO: should have something around default values
    var filters = {
      ward: this.wardSelector.value || null,
      services: selectedService ? [selectedService] : null,
      states: selectedState ? [selectedState] : [ThreeOneOneApi.REQUEST_STATES.OPEN, ThreeOneOneApi.REQUEST_STATES.CLOSED]
    };
    
    // dispatch an event that the filter conditions have changed
    this.dispatchEvent("filtersChanged", filters);
  }
};

eventManager.mix(FilterBarController);