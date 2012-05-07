var MapController = function () {
  this.useCanvas = Config.useCanvasMap;
  this.dataSource = null;
  
  this._openRequests = [];
  this._openedRequests = [];
  this._closedRequests = [];
  
  // mix in appropriate renderer
  if (this.useCanvas) {
    Utils.extend(this, MapController.CanvasRenderer);
  }
  else {
    Utils.extend(this, MapController.MarkerRenderer);
  }
  this._initializeRenderer();
  
  this._initializeMap();
  
  this.selectedArea = null; // Save the state of the ward selector so we don't move the map unnecessarily
  
  // TODO: the initial position should be the center of the markers or set by configuration
  this.defaultView = {
    'center': Config.center,
    'zoom': Config.zoom
  }
  
  this.map.setView(new L.LatLng(this.defaultView.center[0], this.defaultView.center[1]), this.defaultView.zoom);
};

MapController.ICONS = {
  "default": new L.Icon("images/marker_red.png"),
  opened:    new L.Icon("images/marker_orange.png"),
  closed:    new L.Icon("images/marker_blue.png") 
};

MapController.ICON_PATHS = {
  "default": "images/marker_red.png",
  opened:    "images/marker_orange.png",
  closed:    "images/marker_blue.png"
};

MapController.prototype = {
  constructor: MapController,
  
  _initializeMap: function () {
    this.map = new L.Map("map");
    var cloudmade = new L.TileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.jpg", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    });
    this.map.addLayer(cloudmade);
    
    this._initializeMapRenderer();
  },
  
  update: function () {
    this._openRequests = this.dataSource.requests.open.slice();
    this._openRequests.forEach(function(request) {
      request.statusType = "open";
    });
    this._openedRequests = this.dataSource.requests.opened.slice();
    this._openedRequests.forEach(function(request) {
      request.statusType = "opened";
    });
    this._closedRequests = this.dataSource.requests.closed.slice();
    this._closedRequests.forEach(function(request) {
      request.statusType = "closed";
    });
    
    this._updateRenderer();
    
    this.updateMapCenterZoom();
  },
  
  popupForRequest: function (request) {
    // TODO: need some sort of templating support here
    var boundaryText = request.boundary ? ("<br/>" + request.boundary) : "";

    return request.service_name + 
           "<p>" + request.address + boundaryText + "</p>" +
           "<p>" + request.description + "</p>" +
           "<p>Created: " + request.requested_datetime + "</p>" + 
           "<p>Lat/long: " + request.lat + "/" + request.long + "</p>" + 
           (request.status === "closed" ? "(Closed)" : "");
  },
  
  updateMapCenterZoom: function() {
    // Only move/zoom the map if the ward changes
    if (this.dataSource.filterConditions.area !== this.selectedArea) {
      if (this.dataSource.filterConditions.area == null) {
        // if ward == null, then entire city... so use out defaults
        this.map.setView(new L.LatLng(this.defaultView.center[0], this.defaultView.center[1]), this.defaultView.zoom);
      }
      else {
        // build up an array of LatLngs and then generate our bounding box from it
        // TODO: Make this more performant
        var requestsInWard = [];
        $.each(this._mapped, function(index, request) {
          requestsInWard.push(new L.LatLng(request.lat, request.long))
        });
        var wardBoundary = new L.LatLngBounds(requestsInWard);
        console.log(wardBoundary);
        this.map.fitBounds(wardBoundary);
      }
    }
  },
  
  handleEvent: function (event) {
    this._handleEventRenderer(event);
  }
};