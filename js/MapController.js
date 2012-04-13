var MapController = function () {
  this.dataSource = null;
  this._initializeMap();
  
  // TODO: the initial position should be the center of the markers or set by configuration
  this.map.setView(new L.LatLng(39.2903848, -76.61218930000001), 13);
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
    this._mapped = {};
  },
  
  update: function () {
    var requests = this.dataSource.requests;
    requests.closed.forEach(this._addMarkerForRequest("closed", this._mapped), this);
    requests.opened.forEach(this._addMarkerForRequest("opened", this._mapped), this);
    requests.open.forEach(this._addMarkerForRequest("open", this._mapped), this);
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
  }
};