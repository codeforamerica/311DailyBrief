var HeaderBarController = function () {
	this.setDate();
};

HeaderBarController.prototype = {
	constructor: HeaderBarController, 
	setDate: function () {
		$("#todays_date").text(dateTools.todaysDateString);
	}
};
