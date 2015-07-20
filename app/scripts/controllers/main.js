'use strict';

/**
 * @ngdoc function
 * @name photomapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the photomapApp
 */
angular.module('photomapApp')
  .controller('MainCtrl', function ($scope, $rootScope, ApiWrapper, $routeParams, AccessToken, $location) {

	$rootScope.albums = null;
	$rootScope.photos = null;

    $scope.services = ApiWrapper.list();
    // style="background-image:url('http://maps.googleapis.com/maps/api/staticmap?center=Salzburg,+Austria&zoom=9&scale=2&size=640x640&maptype=roadmap&format=png&visual_refresh=true&style=saturation:-20|lightness:90'); background-size: cover; background-position: 50% 50%;"
    var token = AccessToken.set();
    if(token && token.state && $routeParams.access_token){
    	$location.url('/album/' + token.state);
    }

    $scope.dropped = function(){
    	console.log("files dropped");
    	$location.url('/map/local/dropped');
    	$scope.$apply();
        /*var reader = new FileReader();
        reader.onloadend = (function(theFile) {
            return function(e) {
              var jpeg = new JpegMeta.JpegFile(atob(e.target.result.replace(/^.*?,/,'')), theFile)
              var img = new Image;
              img.src = e.target.result;
              $scope.album.photos.push({
                  'id': jpeg.filename.name,
                  'latitude': parseFloat(jpeg.gps.latitude.value),
                  'longitude': parseFloat(jpeg.gps.longitude.value),
                  'icon': 'images/maps/dot_red.png',
                  'content':{
                      'title': jpeg.filename.name,
                      'time': jpeg.filename.lastModified,
                      'image': e.target.result,
                      'thumbnail': e.target.result,
                  }
              });
            };
          })(f);
        reader.readAsDataURL(f);*/
    };

  }).directive('dropzone', function(localFiles) {
    return {
        restrict : 'A',
        link: function (scope, elem) {
            var fileInput = angular.element('<input type="file" style="display: none" multiple />');
            elem.append(fileInput);
            elem.get(0).addEventListener('dragover', function(evt) {          
                elem.addClass('drag-hover');
                evt.dataTransfer.dropEffect = 'link';
                evt.preventDefault();
            });
            elem.get(0).addEventListener('dragleave', function(evt) {
                elem.removeClass('drag-hover');                
            });
            elem.get(0).addEventListener('drop', function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                elem.removeClass('drag-hover');   
                localFiles.files = evt.dataTransfer.files;  
                scope.dropped();
                /*for(var i = 0; i < evt.dataTransfer.files.length; i++){
                    (function(file){
                        scope.dropped(file);
                    }(evt.dataTransfer.files[i]));
                }*/  
            });
            elem.get(0).addEventListener('click', function(evt) {
                fileInput.trigger('click');
            });
            fileInput.get(0).addEventListener('change', function(evt) {
            	localFiles.files = evt.target.files;  
                scope.dropped();
                /*for(var i = 0; i < evt.target.files.length; i++){
                    (function(file){
                        scope.dropped(file);
                    }(evt.target.files[i]));
                }*/
            });
        }
    };
});
