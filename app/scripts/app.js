'use strict';

/**
 * @ngdoc overview
 * @name photomapApp
 * @description
 * # photomapApp
 *
 * Main module of the application.
 */
angular
  .module('photomapApp', [
    'ngRoute',
    'ngTouch',
    'ngStorage',
    'uiGmapgoogle-maps',
    'cgBusy',
    'afOAuth2'
  ])
  .config(function ($routeProvider, uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });

    $routeProvider    
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/:access_token?', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/album/:provider', {
        templateUrl: 'views/album.html',
        controller: 'AlbumCtrl'
      })
      .when('/map/:provider/:albumid', {
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).factory("localFiles", function(){
    return {};
  });
