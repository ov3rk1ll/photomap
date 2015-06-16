'use strict';

/**
 * @ngdoc function
 * @name photomapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the photomapApp
 */
angular.module('photomapApp')
  .controller('AlbumCtrl', function ($scope, AccessToken, $rootScope, ApiWrapper, uiGmapGoogleMapApi, $routeParams) {  
    // check login and param for $routeParams.provider

    $scope.isLogin = AccessToken.set() != null;
    $scope.provider = $routeParams.provider;
    if($scope.isLogin){
        $rootScope.photos = null;
        $scope.myPromise = ApiWrapper.get($routeParams.provider).getAlbum(AccessToken.get().access_token).then(
            function(data){
                $scope.albums = data;
                $rootScope.albums = {
                    'title': $routeParams.provider,
                    'count': $scope.albums.length,
                }; 
            }
        );
        /*$scope.myPromise = $http.jsonp('https://picasaweb.google.com/data/feed/api/user/default', { params:
                {'callback': 'JSON_CALLBACK', 'alt': 'json-in-script', 'access_token': AccessToken.get().access_token}
            }).success(function(data){
                $scope.albums = [];
                for(var e in data.feed.entry){
                    var entry = data.feed.entry[e];
                    $scope.albums.push({
                        title: entry.title.$t,
                        url: entry.gphoto$user.$t + '-' + entry.gphoto$id.$t,
                        count: entry.gphoto$numphotos.$t,
                        author: entry.author[0].name.$t,
                        date: entry.gphoto$timestamp.$t,
                        image: entry.media$group.media$content[0].url
                    });
                }
            });*/
    }    
  });
