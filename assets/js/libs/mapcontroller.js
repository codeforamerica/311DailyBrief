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
      this.map = new L.Map("map", {zoomControl:false});
    var cloudmade = new L.TileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.jpg", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    });
    
    this.map.addLayer(cloudmade);
    this.map.addControl(new L.Control.Center());
    this.map.addControl(new L.Control.Zoom());
    
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

    var parsedDate = new Date(request.requested_datetime);

    var content = "<h2>" + request.service_name + "</h2>";

    if (request.media_url !== "") {
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
