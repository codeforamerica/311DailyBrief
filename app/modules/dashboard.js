define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",
  "dailybriefingcontroller"
],

function(app, Backbone, DailyBriefingController) {

  var Dashboard = app.module();
  var dbc = null;

  Dashboard.Views.Main = Backbone.View.extend({
    template: "app/templates/dashboard",

    initialize: function(options) {
      Config = options.config;
      return this.render();
    },

    render: function() {
      var tmpl = app.fetchTemplate(this.template);
      this.$el.html(tmpl());
      return this;
    },

    events: {
      "click input[type=checkbox]": "_captureTrackingInfo"
      // XXX: Need to update multiselector so id scheme is used that allows
      // for tracking, this is too crazy
      //"click li": "_captureTrackingInfo"
    },

    initDailyBriefingController: function() {
      dbc = new DailyBriefingController();
    },

    _captureTrackingInfo: function(e) {
      trackObj = {
        "baseURI": e.currentTarget.baseURI,
        "innerHTML": e.currentTarget.parentElement.innerHTML,
        "innerText": e.currentTarget.parentElement.innerText,
        "outerHTML": e.currentTarget.parentElement.outerHTML,
        "textContent": e.currentTarget.parentElement.textContent,
        "type": e.type,
        "timeStamp": e.timeStamp,
        "screenX": e.screenX,
        "screenY": e.screenY,
        "pageX": e.pageX,
        "pageY": e.pageY
      };
      dbc.post(trackObj, "tracking");
    }
  });

  Dashboard.Collection = Backbone.Model.extend({});
  Dashboard.DbcMonitor = Backbone.Model.extend({});

  return Dashboard;
});
