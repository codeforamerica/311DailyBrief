/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var HeaderBarController = function () {
	this.setDate();
};

HeaderBarController.prototype = {
	constructor: HeaderBarController, 
	setDate: function () {
		$("#todays_date").text(dateTools.todaysDateString);
	}
};
