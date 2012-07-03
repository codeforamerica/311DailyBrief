/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var dateTools = {
  ONE_DAY: 24 * 60 * 60 * 1000,
  DAY_NAMES:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  DAY_NAMES_SHORT:["Sun","Mon","Tue","Wed","Thur","Fri","Sat"],
  MONTH_NAMES:["January","February","March","April","May","June","July","August","September","October","November","December"],
  MONTH_NAMES_SHORT:["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sept","Oct","Nov","Dec"],
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
	  return dateTools.DAY_NAMES[today.getDay()] + " " + dateTools.MONTH_NAMES[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
  },
  rangeToString: function(dateRange) {

    if (this.simpleDateString(dateRange.from) == this.simpleDateString(this.yesterday())) {
      return 'Yesterday';
    }
    else {
      return dateTools.DAY_NAMES_SHORT[dateRange.from.getDay()] + '&ndash;' + dateTools.DAY_NAMES_SHORT[dateRange.to.getDay()];
    }
  },
  //TODO: more generalize dateformat if we need many different formats, or grab a lib that does it better.
  formatDate: function(date){
    //Jun 7 2012 − 10:45am
    var meridiem = "am";
    var hours = date.getHours();
    if(hours >=12){
      meridiem = "pm";
      hours -= 12
    }
    if(hours == 0)
      hours =12;
    var mins = date.getMinutes();
    if(mins < 10)
        mins = "0"+mins;
    return dateTools.MONTH_NAMES_SHORT[date.getMonth()] + " " + date.getDate() + " " + " "+ date.getFullYear() + " " +
        hours + ":" + mins + " " + meridiem;
  },
  timeSpanString: function(date){
    var elapsedTime = ((new Date()).getTime() - date.getTime())/1000;
    var timeSpanString = "";        
    elapsedTime = (elapsedTime < 1) ? 1: elapsedTime;        
    if (Math.floor(elapsedTime) === 1){
      timeSpanString = "1 sec";
    }else if (elapsedTime < 59){
      timeSpanString = Math.floor(elapsedTime) + " secs";
    }else if (elapsedTime < 119){
      timeSpanString = "1 min";
    }else if (elapsedTime < 3599){
      timeSpanString = " " + Math.floor(elapsedTime / 60) + " mins";
    }else if (elapsedTime < 7199){
      timeSpanString = "1 hour";
    }else if (elapsedTime < 86399){
      timeSpanString = Math.floor(elapsedTime / 3600) + " hours";
    }else if (elapsedTime < 172799){
      timeSpanString = "1 day";
    }else if (elapsedTime < 2592000){
      timeSpanString = Math.floor(elapsedTime / 86400) + " days";
    }else if (elapsedTime < 5184000){
      timeSpanString = "1 month";
    }else if (elapsedTime < 77760000){
      timeSpanString = Math.floor(elapsedTime / 2592000) + " months";
    }else{
      timeSpanString = "over a year";
    }
    return timeSpanString;
  }
};


