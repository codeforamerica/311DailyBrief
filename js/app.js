
var CLOUDMADE_API_KEY = "26e35a6581ee4ffdba8ff3fcaec8496e";
var MONGOHQ_API_KEY = "o1rmgd84919ezzq9da58";

var icons = {
	blue: "images/marker_blue.png",
	green: "images/marker_green.png",
	gray: "images/marker_gray.png"
};

var mongohqUrl = function (db, collection, query, args) {
	var url = "https://api.mongohq.com/databases/" + db + "/collections/" + collection + "/documents?";
	args._apikey = MONGOHQ_API_KEY;
	args.limit = args.limit || 100;
	args.skip = args.skip || 0;
	if (query) {
		args.q = query;
	}
	for (var key in args) {
		url += encodeURIComponent(key) + "=" + encodeURIComponent((typeof(args[key]) === "object" ? JSON.stringify(args[key]) : args[key]));
	}
	return url;
};

// TODO: really need a good suite of date utilities
var simpleDateString = function (date) {
	var month = date.getUTCMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}
	var dayOfMonth = date.getUTCDate();
	if (dayOfMonth < 10) {
		dayOfMonth = "0" + dayOfMonth;
	}
	return date.getUTCFullYear() + "-" + month + "-" + dayOfMonth;
};

var yesterday = function () {
	var date = today();
	date.setUTCDate(date.getUTCDate() - 1);
	return date;
};

var today = function () {
	var date = new Date();
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

$(function () {
	var map = new L.Map("map");
	var cloudmade = new L.TileLayer("http://{s}.tile.cloudmade.com/" + CLOUDMADE_API_KEY + "/997/256/{z}/{x}/{y}.png", {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		maxZoom: 18
	});
	
	map.addLayer(cloudmade)
	   .setView(new L.LatLng(39.2903848, -76.61218930000001), 13);
	
	var requests = {};
	
	// FIXME: if the "opened yesterday" query completes before the "closed yesterday" query, 
	// we might get some open-colored icons that should be closed-colored
	$.ajax({
		// can't use the nice mongohqUrl function because of the double quote issue :(
		url: "https://api.mongohq.com/databases/chicago/collections/requests/documents?_apikey=" + MONGOHQ_API_KEY + "&limit=1000&skip=0&q={\"requested_datetime\": {$gte: \"" + simpleDateString(yesterday()) + "\"\", $lt: \"" + simpleDateString(today()) + "\"}}&sort={requested_datetime: 1}",
		dataType: "jsonp",
		success: function (data) {
			console.log(arguments);
			for (var i = data.length; i--;) {
				var request = data[i];
				if (!requests[request.service_request_id]) {
					requests[request.service_request_id] = request;
					var marker = new L.Marker(new L.LatLng(request.lat, request.long), {icon: new L.Icon(icons.green)});
					marker.bindPopup(request.service_name + 
					                 "<p>" + request.address + "</p>" +
					                 "<p>" + request.description + "</p>" +
					                 "<p>Created: " + request.requested_datetime + "</p>" + 
					                 (request.status === "closed" ? "(Closed)" : ""));
					map.addLayer(marker);
				}
			}
		},
		error: function () {
			console.error("Failure getting requests!");
			alert("Failure getting requests!");
		}
	});
	
	$.ajax({
		// can't use the nice mongohqUrl function because of the double quote issue :(
		url: "https://api.mongohq.com/databases/chicago/collections/requests/documents?_apikey=" + MONGOHQ_API_KEY + "&limit=1000&skip=0&q={\"status\": \"closed\", \"updated_datetime\": {$gte: \"" + simpleDateString(yesterday()) + "\"\", $lt: \"" + simpleDateString(today()) + "\"}}&sort={updated_datetime: 1}",
		dataType: "jsonp",
		success: function (data) {
			console.log(arguments);
			for (var i = data.length; i--;) {
				var request = data[i];
				if (!requests[request.service_request_id]) {
					requests[request.service_request_id] = request;
					var marker = new L.Marker(new L.LatLng(request.lat, request.long), {icon: new L.Icon(icons.gray)});
					marker.bindPopup(request.service_name + 
					                 "<p>" + request.address + "</p>" +
					                 "<p>" + request.description + "</p>" +
					                 "<p>Created: " + request.requested_datetime + "</p>"+ 
					                 (request.status === "closed" ? "(Closed)" : ""));
					map.addLayer(marker);
				}
			}
		},
		error: function () {
			console.error("Failure getting requests!");
			alert("Failure getting requests!");
		}
	});
	
	return;
	
	$.ajax({
		url: "https://api.mongohq.com/databases/chicago/collections/requests/documents?_apikey=" + MONGOHQ_API_KEY + "&limit=100&skip=0&q=%7Bstatus:%20%22open%22%7D",
		dataType: "jsonp",
		success: function (data) {
			console.log(arguments);
			for (var i = data.length; i--;) {
				var request = data[i];
				if (!requests[request.service_request_id]) {
					requests[request.service_request_id] = request;
					var marker = new L.Marker(new L.LatLng(request.lat, request.long), {icon: new L.Icon(icons.blue)});
					marker.bindPopup(request.service_name + 
					                 "<p>" + request.address + "</p>" +
					                 "<p>" + request.description + "</p>" +
					                 "<p>Created: " + request.requested_datetime + "</p>");
					map.addLayer(marker);
				}
			}
		},
		error: function () {
			console.error("Failure getting requests!");
			alert("Failure getting requests!");
		}
	});
});