/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var LegendController = function () {
	// Update the displayed boundary title
  $('#legend-info').find('h1').html(Config.title);
  $('#legend-info').find('p').html(Config.description);
};

LegendController.prototype = {
  constructor: LegendController,
  
  dataSource: null, /* points to DailyBriefingController */
  
  // Map of status states -> html element Ids
  htmlElements: {
    'open': '#legend-open',
    'opened': '#legend-newly-opened',
    'closed': '#legend-newly-closed',
  },
  
  update: function () {

    console.log('LegendController update called');

    var self = this;
    
    var rangeString = dateTools.rangeToString(self.dataSource.filterConditions.dateRange);
    
    // Iterate over our Statuses / HTML ELements
    $.each(this.htmlElements, function(status, elementId) {
      // update number of requests in Legend
      var requestsCount = self.dataSource.requests[status].length;
      $(elementId).find('span.value').html(requestsCount);
      
      // update whether the status is "active"
      if (self._isInList(status, self.dataSource.filterConditions.states)) {
        $(elementId).addClass('active');
      }
      else {
        $(elementId).removeClass('active');
      }
      
      // Update the displayed boundary title
      // No need to change the "All Open" title since it's dateless
      switch (status) {
        case 'opened':
          $(elementId).find('h1').html('Opened ' + rangeString);
          break;
        case 'closed':
          $(elementId).find('h1').html('Closed ' + rangeString);
          break;
        case 'open':
        default:
          // do nothing
          break;
      }
      
    });
  },
  _isInList: function(needle, list) {
    // TODO: do something better?
    for (var i=0; i < list.length; i++) {      
      if (list[i] == needle) {
        return true
      }
    }
    return false;
  }
};
