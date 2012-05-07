var MapController = function () {
  this.useCanvas = Config.useCanvasMap;
  this._markerPoolSize = Config.maxMarkers || 500;
  // adjust for an accuracy vs. drawing speed sweet spot (more accuracy makes drawing markers slower)
  // 1 == perfect accuracy, 2 == every other pixel, etc. Integers only, please!
  this.interactionResolution = 2;
  
  this.dataSource = null;
  
  this._featureMap = {};
  this._openRequests = [];
  this._openedRequests = [];
  this._closedRequests = [];
  
  this._initializeIcons();
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
    this.canvasTiles = new L.TileLayer.Canvas();
    var self = this;
    this.canvasTiles.drawTile = function() { self.drawTile.apply(self, arguments); };
    
    this.map.addLayer(this.canvasTiles);
    
    
    this._addedMarkers = 0;
    this._mapped = {}; // points that have been displayed on the map
    this._typeLayers = {
      open: {},
      opened: {},
      closed: {}
    };
    
    // interaction for canvas
    if (this.useCanvas) {
      this.map._container.addEventListener("mousemove", this, false);
    }
    
    this.map.on("click", this.handleEvent, this);
  },
  
  _initializeIcons: function () {
    this.icons = {
      open:   this._createIconImage(MapController.ICON_PATHS.default),
      opened: this._createIconImage(MapController.ICON_PATHS.opened),
      closed: this._createIconImage(MapController.ICON_PATHS.closed),
    }
  },
  
  _createIconImage: function (path) {
    var image = new Image();
    image.src = path;
    
    var info = {
      image: image,
      offset: {x: 0, y: 0},
      mask: []
    }
    image.representedObject = info;
    
    if (image.complete) {
      this._setupIcon(info, 2);
    }
    else {
      image.addEventListener("load", this, false);
      image.addEventListener("error", this, false);
    }
    
    return info;
  },
  
  _handleIconImageLoad: function (event) {
    event.target.removeEventListener("load", this, false);
    event.target.removeEventListener("error", this, false);
    // TODO: handle load failure
    if (event.type === "load") {
      this._setupIcon(event.target.representedObject);
    }
    
    if (this._iconsReady() && this._waitingToUpdate) {
      this.update();
    }
  },
  
  _setupIcon: function (icon) {
    icon.offset.x = -Math.floor(icon.image.width / 2);
    icon.offset.y = 1 - icon.image.height;
    
    // make the interaction mask
    var workCanvas = document.createElement("canvas");
    workCanvas.width = icon.image.width;
    workCanvas.height = icon.image.height;
    var workCtx = workCanvas.getContext("2d");
    workCtx.drawImage(icon.image, 0, 0);
    var iconData = workCtx.getImageData(0, 0, icon.image.width, icon.image.height).data;
    var rowLength = icon.image.width;
    
    var resolution = this.interactionResolution || 1;
    for (var i = 3, len = iconData.length; i < len; i += 4) {
      if (iconData[i] > 128) {
        var pixel = (i - 3) / 4;
        var y = Math.floor(pixel / rowLength);
        var x = pixel % rowLength;
        if (y % resolution === 0 && x % resolution === 0) {
          // note: an array of points is *much* faster than a tree structure to iterate through
          // could potentially save memory by saving a single number (256 * y + x)
          icon.mask.push({x: x, y: y});
        }
      }
    }
  },
  
  _iconsReady: function () {
    return this.icons.open.image.complete && this.icons.opened.image.complete && this.icons.closed.image.complete;
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
    // Join and sort latitudinally
    this._allRequests = this._closedRequests.concat(this._openedRequests, this._openRequests).sort(function (a, b) {
      return b.lat - a.lat;
    });
    var requests = this.dataSource.requests;
    
    if (this.useCanvas) {
      if (!this._iconsReady()) {
        this._waitingToUpdate = true;
        return;
      }
      
      // var start = Date.now();
      this.canvasTiles.redraw();
      // var time = Date.now() - start;
      // this.renderInfo = this.renderInfo || { renders: 0, total: 0, totalPer: 0, records: []};
      // this.renderInfo.renders += 1;
      // this.renderInfo.total += time;
      // this.renderInfo.totalPer += time / this._allRequests.length;
      // console.log("AVERAGE RENDER TIME PER FEATURE: ", this.renderInfo.totalPer / this.renderInfo.renders);
    }
    else {
      // TODO: be more efficient! (use layer groups?)
      this._clearMarkers();
      this._addedMarkers = 0;
        
      if (~this.dataSource.filterConditions.states.indexOf("closed")) {
        requests.closed.forEach(this._addMarkerForRequest("closed", this._mapped), this);
      }
      if (~this.dataSource.filterConditions.states.indexOf("opened")) {
        requests.opened.forEach(this._addMarkerForRequest("opened", this._mapped), this);
      }
      if (~this.dataSource.filterConditions.states.indexOf("open")) {
        requests.open.forEach(this._addMarkerForRequest("open", this._mapped), this);
      }
    }
    
    this.updateMapCenterZoom();
  },
  
  drawTile: function (canvas, tilePoint, zoom) {
    // console.log("Rendering tilepoint: ", tilePoint.x, tilePoint.y, zoom);
    // console.log(zoom, "" + tilePoint);
    // var point = [39.280937459834, -76.6113239094375];
    var ctx = canvas.getContext('2d');
    // ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.clearRect(0, 0, 256, 256);
    // var sc = Math.pow(2, zoom);
    
    var tilePixelPoint = tilePoint.multiplyBy(256);
    
    if (!this._allRequests) {
      return;
    }
    
    var tileKey = tilePoint.toString();
    this._createEmptyFeatureTile(tileKey);
    this._allRequests.forEach(function (request, index) {
      var icon = this.icons[request.statusType];
      var point = this.map.project(new L.LatLng(request.lat, request.long))._round()._subtract(tilePixelPoint);
      if (point.x > -15 && point.x < 270 && point.y > -41 && point.y < 296) {
        ctx.drawImage(icon.image, point.x + icon.offset.x, point.y + icon.offset.y);
        this._setFeatureAtPoint(tileKey, point, icon, request, index);
      }
    }, this);
  },
  
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
  
  _setFeatureAtPoint: function (tilePoint, featurePoint, icon, feature, featureIndex) {
    // WARNING: This method is HOT. Measure performance thoroughly before making changes.
    
    // No need to do any checks here; _createEmptyFeatureTile() must always be run first
    var featureMap = this._featureMap[tilePoint];
    
    var resolution = this.interactionResolution || 1;
    
    var offsetX = featurePoint.x + icon.offset.x;
    var offsetY = featurePoint.y + icon.offset.y;
    // rectify offsets to interaction resolution
    offsetX = offsetX - (offsetX % resolution);
    offsetY = offsetY - (offsetY % resolution);
    var mask = icon.mask;
    // speediest looping
    var i = mask.length;
    while (i-- > 0) {
      var point = mask[i];
      var x = point.x + offsetX;
      var y = point.y + offsetY;
      // a tree structure for the map is very slow
      // making a key via (x + "," + y) is faster
      // a single number is fastest! (in V8)
      featureMap[y * 256 + x] = feature;
    }
  },
  
  _getFeatureAtPoint: function (tilePoint, featurePoint) {
    if (!featurePoint) {
      var point = tilePoint;
      tilePoint = new L.Point(Math.floor(point.x / 256), Math.floor(point.y / 256));
      featurePoint = new L.Point(point.x % 256, point.y % 256);
    }
    
    if (!this._featureMap) {
      this._featureMap = {};
    }
    
    var feature = null;
    var tile = this._featureMap[tilePoint];
    if (tile) {
      var resolution = this.interactionResolution || 1;
      var x = featurePoint.x - (featurePoint.x % resolution);
      var y = featurePoint.y - (featurePoint.y % resolution);
      feature = tile[y * 256 + x];
    }
    return feature;
  },
  
  _createEmptyFeatureTile: function (tilePoint) {
    this._featureMap[tilePoint] = {};
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
    if (event.target.nodeName === "IMG") {
      this._handleIconImageLoad(event);
    }
    else if (event.type === "mousemove") {
      // FIXME: use map drag events; don't look into private stuff that might change
      var dragging = this.map.dragging._draggable._moving;
      if (!dragging) {
        // FIXME: getBoundingClientRect() will explode horribly in many places
        var mapBounds = this.map._container.getBoundingClientRect();
        var layerPoint = new L.Point(event.pageX - mapBounds.left, event.pageY - mapBounds.top);
        var mapPoint = this.map._initialTopLeftPoint.add(layerPoint);
        var feature = this._getFeatureAtPoint(mapPoint);
        this.map._container.style.cursor = feature ? "pointer" : "default";
      }
      
    }
    else if (event.type === "click") {
      // console.log(event.layerPoint.x, event.layerPoint.y);
      // console.log(this.map._initialTopLeftPoint.x, this.map._initialTopLeftPoint.y, " / ", this.map._initialTopLeftPoint.x / 256, this.map._initialTopLeftPoint.y / 256);
      
      var mapPoint = this.map._initialTopLeftPoint.add(event.layerPoint);
      var tile = new L.Point(Math.floor(mapPoint.x / 256), Math.floor(mapPoint.y / 256));
      var position = new L.Point(mapPoint.x % 256, mapPoint.y % 256);
      // console.log("Tile: " + tile + ", point: " + position);
      console.log(this._getFeatureAtPoint(mapPoint));
    }
  }
};