var dateTools = {
  ONE_DAY: 24 * 60 * 60 * 1000,
  
  today: function today () {
    return this.dayForDate(new Date());
  },
  
  yesterday: function yesterday () {
    return this.subtract(this.today(), this.ONE_DAY);
  },
  
  subtract: function (date, ms) {
    // TODO: support more than just milliseconds?
    return new Date(date - ms);
  },
  
  dayForDate: function dayForDate (date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  },
  
  // TODO: really ought to have an ISO date string here, since in-browser stuff is too new to rely on
  simpleDateString: function (date) {
    var month = date.getUTCMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }
    var dayOfMonth = date.getUTCDate();
    if (dayOfMonth < 10) {
      dayOfMonth = "0" + dayOfMonth;
    }
    return date.getUTCFullYear() + "-" + month + "-" + dayOfMonth;
  },

  todaysDateString: function () {
	  var today = new Date();
	  var dayNames = new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
	  var monthNames = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
	  return dayNames[today.getDay()] + " " + monthNames[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
  }
};


