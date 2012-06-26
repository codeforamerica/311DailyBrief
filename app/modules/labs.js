define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone"
],

function(app, Backbone) {
  var Labs = app.module();

  Labs.Views.Main = Backbone.View.extend({
    template: "app/templates/labs",

    render: function(done) {
      var tmpl = app.fetchTemplate(this.template);

      // set the template contents
      this.$el.html(tmpl());
    }
  });

  Labs.Model = Backbone.Model.extend({});
  Labs.Collection = Backbone.Model.extend({});

  return Labs;
});
