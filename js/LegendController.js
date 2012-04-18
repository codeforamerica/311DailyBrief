var LegendController = function () {
	
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
    });
    
    // Update the displayed boundary title
     // RIGHT HERE ->
  
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
