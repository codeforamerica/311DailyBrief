/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var MediaController = function () {
};

MediaController.prototype = {
  constructor: MediaController,
  
  dataSource: null, /* points to DailyBriefingController */
  cycleStarted: false,
  update: function () {

    console.log('MediaController update called');

    var self = this, selStatuses = this.dataSource.filterBar.statusSelector.getValue();

    this.mediaList = [];

    if (!selStatuses){
      selStatuses = ['open','opened','closed'];
    }

    for (var j = 0; j < selStatuses.length; j++){
      var reqs = this.dataSource.requests[selStatuses[j]];
      for (var i = 0;i < reqs.length; i++){
        if (reqs[i].media_url){
          this.mediaList.push(reqs[i].media_url)
        }
      }
    }

    var mediaEl = $('#medialist'), mediaList = mediaEl.find('div.imgcontainer'), ml = this.mediaList;

    mediaList.empty();

    $.each(ml, function(idx, itm) {
      if (idx < 100){
        mediaList.append('<img src="'+itm+'"/>');
      }
    });

    this.cycle();

  },
  cycle: function(){
    if (!this.cycleStarted){
      this.cycleStarted = true;
      var me = this;
      cycleMedia = function(){
        $('#medialist').find('div.imgcontainer').delay(5000).animate({
          left: '-' + (185 * me.currentSlide)
        }, undefined, function() {
          if (me.currentSlide < 100 - 1) {
            me.currentSlide++;
            cycleMedia();
          } else {
            $('#medialist').find('div.imgcontainer').css({
              'left': 0
            });
            me.currentSlide = 0;
            cycleMedia();
          }
        });
      }
      cycleMedia();
    }
  }
};
