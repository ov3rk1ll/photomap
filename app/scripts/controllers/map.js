'use strict';

/**
 * @ngdoc function
 * @name photomapApp.controller:AlbumCtrl
 * @description
 * # AlbumCtrl
 * Controller of the photomapApp
 */
angular.module('photomapApp')
  .controller('MapCtrl', function ($scope, AccessToken, $http, uiGmapGoogleMapApi, $rootScope, $routeParams, ApiWrapper, localFiles) {
    $scope.photos = [];
    $scope.progress = 100;
    $scope.map = { fit: true, center: { latitude: 59, longitude: 18 }, zoom: 8,
        options: {panControl: false, rotateControl: false, scaleControl: false, streetViewControl: false, zoomControl: false},
        events: {
            tilesloaded: function (map) {
                $scope.$apply(function () {
                    $scope.maps = map;
                });
            },
            drag: function (map) {
                $scope.updateLine();
            },
            zoom_changed: function (map) {
                $scope.updateLine();
            },
            center_changed: function (map) {
                $scope.updateLine();
            }
        }
    };

    var dataURItoBlob = function(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);

      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], {type: mimeString});
    };

    $scope.photosDone = 0;

    $scope.readPhoto = function(f){
        var reader = new FileReader();
        reader.onloadend = (function(theFile) {
            return function(e) {
              var jpeg = new JpegMeta.JpegFile(atob(e.target.result.replace(/^.*?,/,'')), theFile)
              var img = new Image;
              img.src = e.target.result;
              if(jpeg.gps.GPSDateStamp.value != '0000:00:00'){
                var blob = dataURItoBlob(e.target.result);
                var dataUrl = window.URL.createObjectURL(blob);
                $scope.photos.push({
                  'id': jpeg.filename.name,
                  'latitude': parseFloat(jpeg.gps.latitude.value),
                  'longitude': parseFloat(jpeg.gps.longitude.value),
                  'icon': 'images/maps/dot_red.png',
                  'content':{
                      'title': jpeg.filename.name,
                      'time': jpeg.filename.lastModified,
                      'image': dataUrl,
                      'thumbnail': dataUrl,
                  }
                });
                $rootScope.photos.count = $scope.photos.length;
              }
              $scope.photosDone++;
              if($scope.photosDone == localFiles.files.length){ // Done with loading
                $rootScope.photos.title = 'Local';
                $scope.progress = 100;
              } else {
                $rootScope.photos.title = 'Local ' + $scope.photosDone + "/" + localFiles.files.length;
                $scope.progress = parseInt(($scope.photosDone / localFiles.files.length) * 100);
              }
              console.log($scope.progress);
              $scope.$apply();
            };
          })(f);
        reader.readAsDataURL(f);
    }

    uiGmapGoogleMapApi.then(function(maps) {     
        var param = $routeParams.albumid.split('-');
        if($routeParams.provider == "local"){
            $rootScope.photos = {
                'title': 'Local ' + $scope.photosDone + "/" + localFiles.files.length,
                'count': 0,
            }; 
            $scope.progress = 0;
            $scope.photos = [];
            for(var i = 0; i < localFiles.files.length; i++){
                (function(file){
                    $scope.readPhoto(file);
                }(localFiles.files[i]));
            }
        } else {
            $scope.myPromise = ApiWrapper.get($routeParams.provider).getPhotos(AccessToken.set().access_token, $routeParams.albumid).then(
                function(data){
                    $rootScope.photos = {
                        'title': data.title,
                        'count': data.photos.length,
                    }; 
                    $scope.photos = data.photos;
                }
            );
        }
    });    
    
    $scope.windowOptions = {
        show: false
    };

    $scope.onClick = function(data) {
        var model = data.model ? data.model : data;
        $scope.windowOptions.show = true;
        $scope.windowOptions.coords = {'latitude': model.latitude, 'longitude': model.longitude};
        $scope.windowOptions.content = model.content;
        $scope.map.zoom = 16;
        $scope.map.center = $scope.windowOptions.coords;
    };

    $scope.closeClick = function() {
        $scope.windowOptions.show = false;
    };
    
    $scope.hoverState = function($event, model, state){
        // find index
        $scope.map.target = state ? $($event.target) : null;
        $scope.map.fit = false;
        $scope.map.center;
        for(var p in $scope.photos){
            if($scope.photos[p].id == model.id){      
                $scope.map.current = state ? $scope.photos[p] : null;

                $scope.photos[p].icon = state ? 'images/maps/dot_green.png' : 'images/maps/dot_red.png';

                //$scope.map.center = state ? { latitude: $scope.photos[p].latitude, longitude: $scope.photos[p].longitude } : $scope.map.current;
                //$scope.map.center = { latitude: $scope.photos[p].latitude, longitude: $scope.photos[p].longitude };
                $scope.updateLine();
                break;
            }
        }
    }

    $scope.updateLine = function(){
        if($scope.map.current == null || $scope.map.target == null){
            $('.line').remove();
            return;
        }

        var scale = Math.pow(2, $scope.maps.getZoom());
        var nw = new google.maps.LatLng(
            $scope.maps.getBounds().getNorthEast().lat(),
            $scope.maps.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = $scope.maps.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = $scope.maps.getProjection().fromLatLngToPoint(new google.maps.LatLng($scope.map.current.latitude, $scope.map.current.longitude));
        var pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );       

        $scope.createLine(
            pixelOffset.x,
            pixelOffset.y - 7,
            $scope.map.target.offset().left + $scope.map.target.outerWidth(true) / 2,
            $scope.map.target.offset().top + $scope.map.target.outerHeight(true) / 2
        );
                
    }

    $scope.createLine = function (x1,y1, x2,y2){
        var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate('+angle+'deg)';

        $('.line').remove();

        var line = $('<div>')
            .appendTo('body')
            .addClass('line')
            .css({
              'position': 'absolute',
              'transform': transform
            })
            .width(length)
            .offset({left: x1, top: y1});

        return line;
    }
});
