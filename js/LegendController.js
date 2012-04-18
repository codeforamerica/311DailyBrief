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
    
    // Iterate over our Statuses / HTML ELements
    $.each(this.htmlElements, function(status, elementId) {
      // update number of requests in Legend
      var requestsCount = self.dataSource.requests[status].length;
      $(elementId).find('span.value').html(requestsCount);
      
      // update whether the status is "active"
      // if (self.dataSource.filterConditions.states[status] === true) {
      //   $(elementId).addClass('active');
      // }
      // else {
      //   $(elementId).removeClass('active');
      // }
    });
  },
};
