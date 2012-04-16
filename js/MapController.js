var MapController = function () {
  this.dataSource = null;
  this._initializeMap();
  
  this.selectedWard = null; // Save the state of the ward selector so we don't move the map unnecessarily
  
  // TODO: the initial position should be the center of the markers or set by configuration
  this.defaultView = {
    'center': [39.2903848, -76.61218930000001],
    'zoom': 13
  }
  
  this.map.setView(new L.LatLng(this.defaultView.center[0], this.defaultView.center[1]), this.defaultView.zoom);
};

MapController.ICONS = {
  "default": new L.Icon("images/marker_red.png"),
  opened:    new L.Icon("images/marker_orange.png"),
  closed:    new L.Icon("images/marker_blue.png") 
}

MapController.prototype = {
  constructor: MapController,
  
  _initializeMap: function () {
    this.map = new L.Map("map");
    var cloudmade = new L.TileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.jpg", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    });
    this.map.addLayer(cloudmade);
    this._mapped = {}; // points that have been displayed on the map
  },
  
  update: function () {
    var requests = this.dataSource.requests;
    requests.closed.forEach(this._addMarkerForRequest("closed", this._mapped), this);
    requests.opened.forEach(this._addMarkerForRequest("opened", this._mapped), this);
    requests.open.forEach(this._addMarkerForRequest("open", this._mapped), this);
    
    this.updateMapCenterZoom();    
  },
  
  _addMarkerForRequest: function (type, mapped) {
    return function (request) {
      // if a request is in more than one collection, we don't want to map it multiple times
      if (!mapped[request.service_request_id]) {
        mapped[request.service_request_id] = request;
        var marker = this.markerForRequest(request, type);
        marker.bindPopup(this.popupForRequest(request));
        this.map.addLayer(marker);
      }
    };
  },
  
  markerForRequest: function (request, type) {
    var options = {
      icon: MapController.ICONS[type] || MapController.ICONS["default"]
    };
    return new L.Marker(new L.LatLng(request.lat, request.long), options);
  },
  
  popupForRequest: function (request) {
    // TODO: need some sort of templating support here
    return request.service_name + 
           "<p>" + request.address + "</p>" +
           "<p>" + request.description + "</p>" +
           "<p>Created: " + request.requested_datetime + "</p>" + 
           (request.status === "closed" ? "(Closed)" : "");
  },
  
  updateMapCenterZoom: function() {
    // Only move/zoom the map if the ward changes
    if (this.dataSource.filterConditions.ward !== this.selectedWard) {
      if (this.dataSource.filterConditions.ward == null) {
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
  }
};