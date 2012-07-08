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
      "click input[type=checkbox]": "_captureTrackingInfo"
    },

    initDailyBriefingController: function() {
      dbc = new DailyBriefingController();
    },

    _captureTrackingInfo: function(e) {
      // use tracking module to send event data back to server
      trackObj = {'currentTarget': {}};
      trackObj['currentTarget'].outerHTML = e.currentTarget.outerHTML;
      trackObj['currentTarget'].baseURI = e.currentTarget.baseURI;
      trackObj['currentTarget'].parentElement = e.currentTarget.parentElement;
      console.log(JSON.stringify(trackObj));
    }
  });

  Dashboard.Model = Backbone.Model.extend({});
  Dashboard.Collection = Backbone.Model.extend({});

  return Dashboard;
});
