/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var WordsController = function () {
  this.wordCache = {};
  this.wordExclude = ['the','this','you','in','and','am','an','all','are','as','at','be','by','am','an','all','apt','ar','arc','av','to','street','of','on','out','thi','it','st','for','ave','up','from','odd','no','not','ha','even','when','with','can','there','that','wa','been','both','need','have','we','more','here','th','since','do','block','side','corner','please','my','but','off','lot','one','two','or','back','time','city','over','left','rear','front','down','day','week','behind','blk','bu','so','now','their','last','seen','new','because','her','his','just','still','go','ago','several','rd','same','hr','md','come','near','if','who','than','several'];
};

WordsController.prototype = {
  constructor: WordsController,
  
  dataSource: null, /* points to DailyBriefingController */
  
  update: function () {

    this.wordCache = {};

    //console.log('WordsController update called');

    var self = this, selStatuses = this.dataSource.filterBar.statusSelector.getValue();

    if (!selStatuses){
      selStatuses = ['open','opened','closed'];
    }

    for (var j = 0; j < selStatuses.length; j++){
      var reqs = this.dataSource.requests[selStatuses[j]];
      for (var i = 0;i < reqs.length; i++){
        if (reqs[i].description){
          var descWords = reqs[i].description.toLowerCase().split(' ');
          for (var k = 0; k < descWords.length; k++){
            var word = descWords[k].trim().replace(/[^a-zA-Z]+/g,'').singularize();
            if (word && word.length > 1){
              if (this.wordCache[word]){
                this.wordCache[word] = this.wordCache[word] + 1;
              }else{
                this.wordCache[word] = 1;
              }
            }
          }
        }
      }
    }

    this.wordCacheArray = [];

    var wordEl = $('#wordlist'), wordList = wordEl.find('ol'), wc = this.wordCache, wca = this.wordCacheArray;

    for (word in wc){
      if (this.wordExclude.indexOf(word) === -1){
        wca.push([word, wc[word]]);
      }
    }

    wca.sort(function(a,b){
      return b[1] - a[1];
    });

    wordList.empty();

    $.each(wca, function(idx, itm) {
      if (idx < 25){
        wordList.append('<li>'+itm[0]+' <span>('+itm[1]+')</span></li>');
      }
    });
  }
};
