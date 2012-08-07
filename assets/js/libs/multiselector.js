/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var MultiSelector = function MultiSelector (element, options, allAsNull) {
  this.showing = false;
  this.options = [];
  this.element = element;
  this.allAsNull = allAsNull || true;
  $(element).addClass("MultiSelector");
  this._initializeElement();
  if (options) {
    this.setOptions(options);
  }
  this.updateLabel();
  
  this.popup.appendChild(this.listElement);
  document.addEventListener("mousedown", this, false);
  this.element.addEventListener("click", this, false);
};

MultiSelector.prototype = {
  constructor: MultiSelector,
  
  _initializeElement: function () {
    this.label = document.createElement("span");
    this.label.className = "label";
    this.element.appendChild(this.label);
    // this.label.addEventListener("click", this, false);
    
    this.popup = document.createElement("div");
    this.popup.className = "popup";
    this.element.appendChild(this.popup);
    
    // Filter
    var filterContainer = document.createElement("div");
    filterContainer.className = "MultiSelector-filter";
    this.filterField = document.createElement("input");
    this.filterField.type = "search";
    this.filterField.placeholder = "Search";
    this.filterField.addEventListener("keyup", this, false);
    this.filterField.addEventListener("change", this, false);
    // WebKit automatically provides this, but we might want it for other browsers...
    // this.clearFilterButton = document.createElement("button");
    // this.clearFilterButton.appendChild(document.createTextNode("Clear"));
    // this.clearFilterButton.addEventListener("click", this);
    filterContainer.appendChild(this.filterField);
    // filterContainer.appendChild(this.clearFilterButton);
    this.popup.appendChild(filterContainer);
    
    // Buttons
    this.allButton = document.createElement("button");
    this.allButton.appendChild(document.createTextNode("All"));
    this.allButton.className = "left button-all";
    this.noneButton = document.createElement("button");
    this.noneButton.appendChild(document.createTextNode("None"));
    this.noneButton.className = "right button-none";
    var buttonContainer = document.createElement("div");
    buttonContainer.className = "MultiSelector-buttons";
    buttonContainer.appendChild(this.allButton);
    buttonContainer.appendChild(this.noneButton);
    this.popup.appendChild(buttonContainer);
    // buttonContainer.addEventListener("click", this, false);
    
    // Option list
    this.listElement = document.createElement("ol");
    this.listElement.addEventListener("click", this, false);
  },
  
  show: function () {
    $(this.popup).fadeIn();
    this.showing = true;
    this.filterField.focus();
  },
  
  hide: function () {
    $(this.popup).fadeOut();
    this.showing = false;
  },
  
  getValue: function () {
    var value = [];
    var anyUnchecked = false;
    for (var i=0, len=this.options.length; i < len; i++) {
      var checked = this.options[i].element.getElementsByTagName("input")[0].checked;
      if (checked) {
        value.push(this.options[i].value);
      }
      else {
        anyUnchecked = true;
      }
    }
    
    return (!anyUnchecked && this.allAsNull) ? null : value;
  },
  
  setValue: function (value) {
    for (var i=0, len=this.options.length; i < len; i++) {
      var option = this.options[i];
      option.element.getElementsByTagName("input")[0].checked = !value || value.indexOf(option.value) > -1;
    }
    this.updateLabel();
  },
  
  setOptions: function (options) {
    // sort by name value
    var sorted = _.sortBy(options, function(obj) { return obj.name });

    for (var i=0, len=sorted.length; i < len; i++) {
      this.addOption(sorted[i]);
    }
    this.clearFilter();
  },
  
  addOption: function (option) {
    var itemElement = document.createElement("li");
    // values are inserted as all lowercase below, CSS is used to capitalize them properly
    itemElement.className = "capitalize";

    var control = itemElement.appendChild(document.createElement("input"));
    control.type = "checkbox";
    control.value = option.value || option.name.toLowerCase();

    itemElement.appendChild(document.createTextNode(option.name.toLowerCase()));
    this.listElement.appendChild(itemElement);
    
    this.options.push({
      name: option.name,
      value: option.value || option.name,
      element: itemElement
    });
  },
  
  filterOptions: function (filter) {
    filter = filter && filter.toUpperCase();
    var alwaysMatch = !filter;
    for (var i=0, len=this.options.length; i < len; i++) {
      var matches = alwaysMatch || this.options[i].name.toUpperCase().indexOf(filter) > -1;
      this.options[i].element.style.display = matches ? "" : "none";
    }
  },
  
  clearFilter: function () {
    this.filterField.value = "";
    this.filterOptions(null);
  },
  
  updateLabel: function () {
    var names = [];
    // track whether all items were selected
    var all = true;
    for (var i=0, len=this.options.length; i < len; i++) {
      var checked = this.options[i].element.getElementsByTagName("input")[0].checked;
      if (checked) {
        names.push(this.options[i].name);
      }
      else {
        all = false;
      }
    }
    
    // "All", "None", or a list
    var quantity = names.length;
    var labelText = quantity + " Selected";
    if (quantity === 0) {
      labelText = "None";
    }
    else if (quantity === 1) {
      labelText = names[0];
    }
    else if (all) {
      labelText = "All";
    }
    
    // labelText = ({
    //   "0": "None",
    //   "1": names[0],
    //   "true": "All"
    // })[all || quantity] || quantity + " Selected";
    
    this.label.textContent = labelText;
  },
  
  handleEvent: function (event) {
    if (event.target === this.filterField) {
      this.filterOptions(this.filterField.value);
    }
    
    if (event.type === "click" && event.target === this.clearFilterButton) {
      this.clearFilter();
    }
    else if (event.type === "click") {
      // Clicking anywhere on an item toggles it
      if (this.listElement == event.currentTarget && this.listElement != event.target) {
        // find li
        var element = event.target;
        while (element.tagName != "LI") {
          element = element.parentNode;
        }
        
        var checkbox = element.getElementsByTagName("input")[0];
        if (checkbox) {
          var checkValue = event.target === checkbox ? !checkbox.checked : checkbox.checked;
          if (event.altKey) {
            var newValue = [];
            for (var i=0, len=this.options.length; i < len; i++) {
              if ((checkValue && this.options[i].value !== checkbox.value) || (!checkValue && this.options[i].value === checkbox.value)) {
                newValue.push(this.options[i].value);
              }
            }
            this.setValue(newValue);
          }
          else {
            checkbox.checked = !checkValue;
          }
        }
        this.dispatchChange();
      }
      // buttons for select all/none
      else if (event.target == this.allButton) {
        this.setValue();
        this.dispatchChange();
      }
      else if (event.target == this.noneButton) {
        this.setValue([]);
        this.dispatchChange();
      }
      else if (!this.popup.contains(event.target)) {
        this[this.showing ? "hide" : "show"]();
      }

      // always update the label after all actions
      this.updateLabel();
    }
    // if not clicking on the selector, hide it
    else if (!this.element.contains(event.target) && this.showing) {
      this.hide();
    }
  },
  
  dispatchChange: function () {
    this.dispatchEvent("change", this.getValue());
  }
};
