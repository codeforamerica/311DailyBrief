/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var WordsController = function () {

  var self = this;

  self.htmlElements = {
    'main': '#wordlist',
    'fbarlink': '#wordlist_show',
    'tbarlink': '#wordlist > p > button'
  };

  self.wordCache = {};
  self.wordExclude = ['the','this','into','stop','they','you','full','take','before','in','and','am','an','all','are','as','at','be','by','am',
                      'an','all','apt','ar','arc','av','to','street','of','on','out','thi','it','st','for','ave','up','from','odd','no','not',
                      'ha','even','when','with','can','there','that','wa','been','both','need','have','we','more','here','th','since','do',
                      'block','side','corner','please','my','but','off','lot','one','two','or','back','time','city','over','left','rear','front',
                      'down','day','week','behind','blk','bu','so','now','their','last','seen','new','because','her','his','just','still','go',
                      'ago','several','rd','same','hr','md','come','near','if','who','than','several'];

  self.showHideButton = $(self.htmlElements.fbarlink);
  self.showHideButton.click(function(){
    self.handleEvent.apply(self, arguments)
  });

  self.hideButton = $(self.htmlElements.tbarlink);
  self.hideButton.click(function(){
    self.handleEvent.apply(self, arguments)
  });

};

WordsController.prototype = {
  constructor: WordsController,
  
  dataSource: null, /* points to DailyBriefingController */
  
  maxWordsDisplay: 10,
  wordHeight: 20,
  headerHeight: 65,

  update: function () {

    console.log('WordsController update called');

    var self = this, 
      selStatuses = self.dataSource.filterConditions.states,
      wordEl = $(self.htmlElements.main), 
      wordList = wordEl.find('ol'), 
      wc, 
      wca,
      j,
      reqs,
      secHeight;
    
    self.wordCache = {};

    if (!wordEl.hasClass('hidden')){

      for (j = 0; j < selStatuses.length; j++){
        reqs = self.dataSource.requests[selStatuses[j]];
        for (var i = 0;i < reqs.length; i++){
          if (reqs[i].description){
            var descWords = reqs[i].description.toLowerCase().split(' ');
            for (var k = 0; k < descWords.length; k++){
              var word = descWords[k].trim().replace(/[^a-zA-Z]+/g,'').singularize();
              if (word && word.length > 1){
                if (self.wordCache[word]){
                  self.wordCache[word] = self.wordCache[word] + 1;
                }else{
                  self.wordCache[word] = 1;
                }
              }
            }
          }
        }
      }

      self.wordCacheArray = [];

      wc = self.wordCache;
      wca = self.wordCacheArray;

      for (word in wc){
        if (self.wordExclude.indexOf(word) === -1){
          wca.push([word, wc[word]]);
        }
      }

      wca.sort(function(a,b){
        return b[1] - a[1];
      });

      wordList.empty();

      $.each(wca, function(idx, itm) {
        if (idx < self.maxWordsDisplay){
          wordList.append('<li>'+itm[0]+' <span>('+itm[1]+')</span></li>');
        }
      });

      secHeight = self.maxWordsDisplay * self.wordHeight + self.headerHeight;

      wordEl.css('height', secHeight+'px');

    }
    
  },
  handleEvent: function (event) {
    var self = this, 
      wordEl = $(self.htmlElements.main);
    if (event.target === this.showHideButton[0]) {
      if (wordEl.hasClass('hidden')){
        wordEl.removeClass('hidden');
      }else{
        wordEl.addClass('hidden');
      }
    } else if (event.target === this.hideButton[0]){
      wordEl.addClass('hidden');
    }
  }
};
