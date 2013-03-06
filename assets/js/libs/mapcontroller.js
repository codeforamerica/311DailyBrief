/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 e* BSD-style license; see the file LICENSE for details.
 */

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
  "default": new L.Icon("/assets/img/marker_red.png"),
  opened:    new L.Icon("/assets/img/marker_orange.png"),
  closed:    new L.Icon("/assets/img/marker_blue.png") 
};

MapController.ICON_PATHS = {
  "default": "/assets/img/marker_red.png",
  opened:    "/assets/img/marker_orange.png",
  closed:    "/assets/img/marker_blue.png"
};

MapController.prototype = {
  constructor: MapController,
  
  _initializeMap: function () {
    var map = new L.Map("map", {zoomControl:false}),
      cloudmade = new L.TileLayer("http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.jpg", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles By <a href="http://stamen.com">Stamen</a>',
        maxZoom: 18
      });
    
    this.map = map;

    map.addLayer(cloudmade);
    map.addControl(new L.Control.Center());
    map.addControl(new L.Control.Zoom());
    
    this._initializeMapRenderer();
  },
  
  update: function () {
    var self = this;
    self._openRequests = self.dataSource.requests.open.slice();
    self._openRequests.forEach(function(request) {
      request.statusType = "open";
    });
    self._openedRequests = self.dataSource.requests.opened.slice();
    self._openedRequests.forEach(function(request) {
      request.statusType = "opened";
    });
    self._closedRequests = self.dataSource.requests.closed.slice();
    self._closedRequests.forEach(function(request) {
      request.statusType = "closed";
    });
    
    self._updateRenderer();
    
    self.updateMapCenterZoom();
  },
  
  popupForRequest: function (request) {
    // TODO: need some sort of templating support here
    var boundaryText = request.boundary ? ("<br/>" + request.boundary) : "",
      parsedDate = new Date(request.requested_datetime),
      content = "<h2>" + request.service_name + "</h2>";

    if (request.media_url && request.media_url !== "") {
      content = content.concat('<div class="photo">' + '<a href="'+request.media_url+'" target="_blank">' +
          '<img src="'+request.media_url+'" alt="request img" height="250" width="250" />' +
          '</a></div>'
          );
    }

    content += "<div class='content'><h4>Address</h4><p>" + request.address + boundaryText + "</p>" +
    "<h4>Description</h4><p>" + request.description + "</p>" +
    "<h4>Created</h4><p>" + dateTools.formatDate(parsedDate) +
    " - <span class='ago'>"+dateTools.timeSpanString(parsedDate) + " ago</span></p>" + 
    (request.status === "closed" ? "<h5>CLOSED</h5>" : "") + "</div><div class='reset'></div>";

    return content;

  },
  
  updateMapCenterZoom: function() {
    var self = this;
    // Only move/zoom the map if the ward changes
    if (self.dataSource.filterConditions.area !== self.selectedArea) {
      self.selectedArea = self.dataSource.filterConditions.area;

      if (self.dataSource.filterConditions.area == null) {
        // if ward == null, then entire city... so use out defaults
        self.map.setView(new L.LatLng(self.defaultView.center[0], self.defaultView.center[1]), self.defaultView.zoom);
      } else {
        // build up an array of LatLngs and then generate our bounding box from it
        var requestsInWard = [],
          wardBoundary,
          allRequests = self.dataSource.requests['open']
                                       .concat(self.dataSource.requests['opened'], 
                                               self.dataSource.requests['closed'])
        $.each(allRequests, function(index, request) {
          requestsInWard.push(new L.LatLng(request.lat, request.long))
        });
        if (requestsInWard.length > 0) {
          wardBoundary = new L.LatLngBounds(requestsInWard);
          self.map.fitBounds(wardBoundary);
        }
      }
    }
  },
  
  handleEvent: function (event) {
    this._handleEventRenderer(event);
  }
};
