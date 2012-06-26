/* Copyright (C) 2012, Code for America
 * This is open source software, released under a standard 2-clause
 * BSD-style license; see the file LICENSE for details.
 */

var Utils = {
  extend: function (object, extensions) {
    if (object.prototype) {
      object = object.prototype;
    }
    for (var key in extensions) {
      if (!object[key]) {
        object[key] = extensions[key];
      }
    }
  }
};
