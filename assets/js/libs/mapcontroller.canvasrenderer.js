/**
 * Canvas rendering support for MapController.
 **/

/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

MapController.CanvasRenderer = {
  // ---------------------- RENDERER METHODS -------------------------
  
  _initializeRenderer: function () {
    // adjust for an accuracy vs. drawing speed sweet spot (more accuracy makes drawing markers slower)
    // 1 == perfect accuracy, 2 == every other pixel, etc. Integers only, please!
    this.interactionResolution = 2;
    this._featureMap = {};
    this._initializeIcons();
    this._allRequests = [];
    this._markerPoolSize = Config.maxMarkers || 500;
    this._currentPopup = null;
    this._mapped = {}; // points that have been displayed on the map
  },
  
  _initializeMapRenderer: function () {
    var self = this;
    this.canvasTiles = new L.TileLayer.Canvas();
   
    // capture open popup as state saving mechanism so we can have
    // custom behavior of closing the open popup (and not opening
    // new popup) if user clicks on marker a second time 
    this.map.on("popupopen", function(e){
      self._currentPopup = e.popup;
    });

    this.canvasTiles.drawTile = function() { self.drawTile.apply(self, arguments); };
    
    this.map.addLayer(this.canvasTiles);
    
    // events
    this.map.on("click", this.handleEvent, this);
    // map has no mousemove events; only drag-related events ("move" is dragging)
    this.map._container.addEventListener("mousemove", this, false);
  },
  
  _updateRenderer: function () {

    // Join and sort latitudinally and honor max marker limit (aka _markerPoolSize)
    this._allRequests = this.dataSource.requests['open']
                                       .slice(1, this._markerPoolSize) 
                                       .concat(this.dataSource.requests['opened'], 
                                               this.dataSource.requests['closed'])
                                       .sort(function (a, b) {
      var latitudeDiff = b.lat - a.lat;
      if (latitudeDiff) {
        return latitudeDiff;
      }
      else if (a.statusType === "closed" || a.statusType === "opened" && b.statusType !== "closed") {
        return 1;
      }
      else {
        return -1;
      }
    });
    
    // Wait for icons to be ready for rendering
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
  },
  
  _handleEventRenderer: function (event) {
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

      var feature = this._getFeatureAtPoint(mapPoint);
      
      if (feature) {
        // create a standard popup
        // TODO: make it nicer.

        var width = (feature.media_url === "" ? 275 : 540);
        var popup = new L.Popup({
          offset: new L.Point(0, -41),
          maxWidth: width,
          minWidth: width
        });
        popup.setLatLng(new L.LatLng(feature.lat, feature.long));
        popup.setContent(this.popupForRequest(feature));
        // don't bother creating popup if one is already open
        // and the new popup would be the same
        if (this._currentPopup && this._currentPopup._content === popup._content) {
          this._currentPopup = null;
          return;
        }
        this.map.openPopup(popup);
      }
    }
  },
  
  
  // ---------------------- DRAWING -------------------------
  
  drawTile: function (canvas, tilePoint, zoom) {
    if (!this.dataSource)
      return;
    
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    
    var showTypes = {
      open: this.dataSource.filterConditions.states.indexOf("open") > -1,
      opened: this.dataSource.filterConditions.states.indexOf("opened") > -1,
      closed: this.dataSource.filterConditions.states.indexOf("closed") > -1
    };
    
    var tilePixelPoint = tilePoint.multiplyBy(256);
    var tileKey = tilePoint.toString();
    this._createEmptyFeatureTile(tileKey);
    this._allRequests.forEach(function (request, index) {
      if (showTypes[request.statusType]) {
        var icon = this.icons[request.statusType];
        var point = this.map.project(new L.LatLng(request.lat, request.long))._round()._subtract(tilePixelPoint);
        if (point.x > -15 && point.x < 270 && point.y > -41 && point.y < 296) {
          ctx.drawImage(icon.image, point.x + icon.offset.x, point.y + icon.offset.y);
          this._setFeatureAtPoint(tileKey, point, icon, request, index);
        }
      }
    }, this);
  },
  
  
  // ---------------------- FEATURE INTERACTION MANAGEMENT -------------------------
  
  _createEmptyFeatureTile: function (tilePoint) {
    this._featureMap[tilePoint] = {};
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
  
  
  // ---------------------- ICON MANAGEMENT -------------------------
  
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
};

