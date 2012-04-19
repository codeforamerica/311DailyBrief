var MultiSelector = function MultiSelector (element, options) {
  this.showing = false;
  this.options = [];
  this.element = element;
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
    
    // Buttons
    this.allButton = document.createElement("button");
    this.allButton.appendChild(document.createTextNode("All"))
    this.allButton.className = "left button-all";
    this.noneButton = document.createElement("button");
    this.noneButton.appendChild(document.createTextNode("None"))
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
  },
  
  hide: function () {
    $(this.popup).fadeOut();
    this.showing = false;
  },
  
  getValue: function () {
    var value = [];
    for (var i=0, len=this.options.length; i < len; i++) {
      var checked = this.options[i].element.getElementsByTagName("input")[0].checked;
      if (checked) {
        value.push(this.options[i].value);
      }
    }
    return value;
  },
  
  setValue: function (value) {
    for (var i=0, len=this.options.length; i < len; i++) {
      var option = this.options[i];
      option.element.getElementsByTagName("input")[0].checked = !value || value.indexOf(option.value) > -1;
    }
    this.updateLabel();
  },
  
  setOptions: function (options) {
    for (var i=0, len=options.length; i < len; i++) {
      this.addOption(options[i]);
    }
  },
  
  addOption: function (option) {
    var itemElement = document.createElement("li");
    var control = itemElement.appendChild(document.createElement("input"));
    control.type = "checkbox";
    control.value = option.value || option.name;
    itemElement.appendChild(document.createTextNode(option.name));
    this.listElement.appendChild(itemElement);
    
    this.options.push({
      name: option.name,
      value: option.value || option.name,
      element: itemElement
    });
  },
  
  updateLabel: function () {
    var names = [];
    // track whether all items were selected
    var notAll = false;
    for (var i=0, len=this.options.length; i < len; i++) {
      var checked = this.options[i].element.getElementsByTagName("input")[0].checked;
      if (checked) {
        names.push(this.options[i].name);
      }
      else {
        notAll = true;
      }
    }
    // "All", "None", or a list
    var labelText = notAll ? names.join(", ") : "All";
    if (!labelText) {
      labelText = "None";
    }
    
    this.label.textContent = labelText;
  },
  
  handleEvent: function (event) {
    if (event.type === "click") {
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

eventManager.mix(MultiSelector);