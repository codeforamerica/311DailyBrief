/**
 * Quick 'n diry event management that we will hopefully get rid of
 */

/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var eventManager = {
  dispatchEvent: function (source, eventName, data) {
    var subscribers = this._subscriptionsFor(eventName);
    var event = {
      type: eventName,
      target: source,
      data: data
    };
    
    for (var i = 0, len = subscribers.length; i < len; i++) {
      var subscriber = subscribers[i].subscriber;
      var context = subscriber;
      var handler = subscriber.handleEvent;
      if (typeof(subscriber) === "function") {
        handler = subscriber;
        context = subscribers[i].context;
      }
      if (subscriber !== source && handler && (subscribers[i].source == undefined || subscribers[i].source === source)) {
        handler.call(context, event);
      }
    }
  },
  
  subscribe: function (eventName, subscriber, source) {
    var subscribers = this._subscriptionsFor(eventName);
    // don't add if it would be a dupe
    for (var i = 0, len = subscribers.length; i < len; i++) {
      if (subscribers[i].source === source && subscribers[i] === subscriber) {
        return false;
      }
    }
    subscribers.push({source: source, subscriber: subscriber});
    return true;
  },
  
  unsubscribe: function (eventName, subscriber, source) {
    var subscribers = this._subscriptionsFor(eventName);
    for (var i = 0, len = subscribers.length; i < len; i++) {
      if (subscribers[i].source === source && subscribers[i] === subscriber) {
        subscribers.splice(i, 1);
        return true;
      }
    }
    return false;
  },
  
  /**
   * Add event dispatch capabilities to a class 
   */
  mix: function (mixInto) {
    Utils.extend(mixInto, this._dispatcher);
  },
  
  _subscriptionsFor: function (eventName) {
    var result = this._subscriptions[eventName];
    if (!result) {
      result = this._subscriptions[eventName] = [];
    }
    return result;
  },
  
  _subscriptions: {},
  
  // methods for objects that can dispatch
  _dispatcher: {
    dispatchEvent: function (eventName, data) {
      eventManager.dispatchEvent(this, eventName, data);
    },
    
    subscribe: function (eventName, subscriber) {
      eventManager.subscribe(eventName, subscriber, this);
    },
    
    unsubscribe: function (eventName, subscriber) {
      eventManager.unsubscribe(eventName, subscriber, this);
    }
  }
};
