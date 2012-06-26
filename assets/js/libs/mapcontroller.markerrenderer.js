/**
 * Marker rendering support for MapController.
 **/

/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

MapController.MarkerRenderer = {
  // ---------------------- RENDERER METHODS -------------------------
  
  _initializeRenderer: function () {
    this._markerPoolSize = Config.maxMarkers || 500;
  },
  
  _initializeMapRenderer: function () {
    this._addedMarkers = 0;
    this._mapped = {}; // points that have been displayed on the map
    this._typeLayers = {
      open: {},
      opened: {},
      closed: {}
    };
  },
  
  _updateRenderer: function () {
    var requests = this.dataSource.requests;
    
    // TODO: be more efficient! (use layer groups?)
    // XXX: this was causing markers to flash and not honor 500 limit
    //this._clearMarkers();
    //this._addedMarkers = 0;
      
    if (~this.dataSource.filterConditions.states.indexOf("closed")) {
      requests.closed.forEach(this._addMarkerForRequest("closed", this._mapped), this);
    }
    if (~this.dataSource.filterConditions.states.indexOf("opened")) {
      requests.opened.forEach(this._addMarkerForRequest("opened", this._mapped), this);
    }
    if (~this.dataSource.filterConditions.states.indexOf("open")) {
      requests.open.forEach(this._addMarkerForRequest("open", this._mapped), this);
    }
  },
  
  _handleEventRenderer: function (event) {},
  
  
  // ---------------------- MARKER MANAGEMENT -------------------------
  
  _clearMarkers: function () {
    for (var state in this._typeLayers) {
      var markers = this._typeLayers[state];
      for (var key in markers) {
        this.map.removeLayer(markers[key]);
        delete markers[key];
        delete this._mapped[key];
      }
    }
  },
  
  _addMarkerForRequest: function (type, mapped) {
    if (!this._typeLayers[type]) {
      this._typeLayers[type] = {};
    }
    
    return function (request) {
      // if a request is in more than one collection, we don't want to map it multiple times
      var requestId = request.service_request_id || request.token;
      var marker;
      if (!mapped[requestId] && this._addedMarkers < this._markerPoolSize) {
        this._addedMarkers++;
        marker = this.markerForRequest(request, type);
        marker.bindPopup(this.popupForRequest(request));
        
        this._typeLayers[type][requestId] = marker;
        mapped[requestId] = request;
        
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
};
