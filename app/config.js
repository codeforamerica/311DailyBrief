// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file
  deps: ["main"],

  paths: {
    // JavaScript folders
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",

    // Libraries
    jquery: "../assets/js/libs/jquery",
    lodash: "../assets/js/libs/lodash",
    backbone: "../assets/js/libs/backbone",
    configbaltimore: "../assets/js/libs/config.baltimore",
    configbloomington: "../assets/js/libs/config.bloomington",
    configboston: "../assets/js/libs/config.boston",
    utils: "../assets/js/libs/utils",
    datetools: "../assets/js/libs/datetools",
    eventmanager: "../assets/js/libs/eventmanager",
    threeoneoneapi: "../assets/js/libs/threeoneoneapi",
    multiselector: "../assets/js/libs/multiselector",
    filterbarcontroller: "../assets/js/libs/filterbarcontroller",
    headerbarcontroller: "../assets/js/libs/headerbarcontroller",
    legendcontroller: "../assets/js/libs/legendcontroller",
    mapcontroller: "../assets/js/libs/mapcontroller",
    mapmarkerrenderer: "../assets/js/libs/mapcontroller.markerrenderer",
    mapcanvasrenderer: "../assets/js/libs/mapcontroller.canvasrenderer",
    dailybriefingcontroller: "../assets/js/libs/dailybriefingcontroller"
  },

  shim: {
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },
    utils: {
      exports: "Utils"
    },
    eventmanager: {
      exports: "eventManager"
    },
    dailybriefingcontroller: {
      deps: ["backbone", 
             "utils", 
             "eventmanager", 
             "datetools",
             "legendcontroller",
             "configbaltimore",
             "mapcontroller",
             "mapcanvasrenderer",
             "mapmarkerrenderer",
             "filterbarcontroller",
             "threeoneoneapi",
             "headerbarcontroller",
             "multiselector"],
      exports: "DailyBriefingController"
    },
    datetools: {
      exports: "dateTools"
    },
    legendcontroller: {
      exports: "LegendController"
    },
    configbaltimore: {
      // default
      exports: "Config"
    },
    configbloomington: {
      exports: "ConfigBloomington"
    },
    configboston: {
      exports: "ConfigBoston"
    },
    mapcontroller: {
      exports: "MapController"
    },
    mapcanvasrenderer: {
      deps: ["mapcontroller"],
      exports: "MapController.CanvasRenderer"
    },
    mapmarkerrenderer: {
      deps: ["mapcontroller"],
      exports: "MapController.MarkerRenderer"
    },
    filterbarcontroller: {
      exports: "FilterBarController"
    },
    threeoneoneapi: {
      exports: "ThreeOneOneApi"
    },
    headerbarcontroller: {
      exports: "HeaderBarController"
    },
    multiselector: {
      exports: "MultiSelector"
    }
  }
});
