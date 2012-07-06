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
      _.bindAll(this, "_captureTrackingInfo");
      this.config = options.config;

      return this.render();
    },

    render: function() {
      var tmpl = app.fetchTemplate(this.template);
      this.$el.html(tmpl());
      Config = this.config;

      return this;
    },

    events: {
      "click input[type=button]": "_captureTrackingInfo"
    },

    initDailyBriefingController: function() {
      dbc = new DailyBriefingController();
    },

    _captureTrackingInfo: function(e) {
      // use tracking module to send event data back to server
      console.log(e);
    }
  });

  Dashboard.Model = Backbone.Model.extend({});
  Dashboard.Collection = Backbone.Model.extend({});

  return Dashboard;
});
