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

    config: null,

    render: function(done) {
      var tmpl = app.fetchTemplate(this.template);

      // Set the template contents
      this.$el.html(tmpl());
      Config = this.config;
      dbc = new DailyBriefingController();

    }
  });

  Dashboard.Model = Backbone.Model.extend({});
  Dashboard.Collection = Backbone.Model.extend({});

  return Dashboard;
});
