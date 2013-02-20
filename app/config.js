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
    inflection: "../assets/js/libs/inflection",
    lodash: "../assets/js/libs/lodash",
    backbone: "../assets/js/libs/backbone",
    configbaltimore: "../assets/js/libs/config.baltimore",
    configbloomington: "../assets/js/libs/config.bloomington",
    configboston: "../assets/js/libs/config.boston",
    configboston1: "../assets/js/libs/config.boston1",
    configboston2: "../assets/js/libs/config.boston2",
    configboston3: "../assets/js/libs/config.boston3",
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
    wordscontroller: "../assets/js/libs/wordscontroller",
    dailybriefingcontroller: "../assets/js/libs/dailybriefingcontroller",
    controlcenter: "../assets/js/libs/Control.Center"
  },

  shim: {
    backbone: {
      deps: ["lodash", "jquery", "inflection"],
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
             "wordscontroller",
             "multiselector",
             "controlcenter"],
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
    configboston1: {
      exports: "ConfigBoston1"
    },
    configboston2: {
      exports: "ConfigBoston2"
    },
    configboston3: {
      exports: "ConfigBoston3"
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
    },
    wordscontroller: {
      exports: "WordsController"
    }
  }
});
