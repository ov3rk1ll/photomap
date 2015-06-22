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
  }).
  run(function ($rootScope, $location, $window) {
    $rootScope.getMenuClass = function(path, match) {
      match = (typeof match === 'undefined') ? false : match;
      var compare = match ? $location.path() : $location.path().substr(0, path.length);
      if (compare === path) {
        return 'active';
      } else {
        return '';
      }
    };
    $rootScope.$on('$routeChangeSuccess', function(){
        $window.ga('send', 'pageview', $location.path());
    });
  })
  .factory('localFiles', function(){
    return {};
  });
