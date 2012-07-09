L.Control.Center = L.Class.extend({
	onAdd: function (map) {
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-center');

		this._centerButton = this._createButton(
			'Center', 'leaflet-control-center', this._resetMap, this._map);

		this._container.appendChild(this._centerButton);
	},

	getContainer: function () {
		return this._container;
	},

	getPosition: function () {
		return L.Control.Position.TOP_LEFT;
	},
    _resetMap: function(){
        this.setView(new L.LatLng(Config.center[0], Config.center[1]), 
                     (Config.zoom || 13));
    },

	_createButton: function (title, className, fn, context) {
		var link = document.createElement('a');
		link.href = '#';
		link.title = title;
		link.className = className;

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(link);
		}
		L.DomEvent.addListener(link, 'click', L.DomEvent.preventDefault);
		L.DomEvent.addListener(link, 'click', fn, context);

		return link;
	}
});