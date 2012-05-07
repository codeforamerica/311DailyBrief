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