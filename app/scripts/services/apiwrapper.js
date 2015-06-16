'use strict';

/**
 * @ngdoc service
 * @name photomapApp.ApiWrapper
 * @description
 * # ApiWrapper
 * Provider in the photomapApp.
 */
angular.module('photomapApp')
  .factory('ApiWrapper', function ($q, $http) {

    var provider = { };

    provider.google = {
      getAlbum: function(token){
        return $q(function(resolve, reject) {
          $http.jsonp('https://picasaweb.google.com/data/feed/api/user/default', { params:
              {'callback': 'JSON_CALLBACK', 'alt': 'json-in-script', 'access_token': token}
          }).success(function(data){
            var albums = [];
            for(var e in data.feed.entry){
              var entry = data.feed.entry[e];
              albums.push({
                  title: entry.title.$t,
                  url: entry.gphoto$user.$t + '-' + entry.gphoto$id.$t,
                  count: entry.gphoto$numphotos.$t,
                  author: entry.author[0].name.$t,
                  date: entry.gphoto$timestamp.$t,
                  image: entry.media$group.media$content[0].url
              });
            }
            resolve(albums);
          });
        });
      },
      getPhotos: function(token, albumId){
        return $q(function(resolve, reject) {
          var param = albumId.split('-');
          $http.jsonp('https://picasaweb.google.com/data/feed/api/user/' + param[0] + '/albumid/' + param[1],
            { params: {'callback': 'JSON_CALLBACK', 'alt': 'json-in-script', 'access_token': token } }
          ).success(function(data){
            var album = {
                'title': data.feed['title']['$t'],
                'photos': []
            };               
            for(var e in data.feed.entry){
              var entry = data.feed.entry[e];
              if(entry['georss$where']){
                var coords = entry['georss$where']['gml$Point']['gml$pos']['$t'].split(' ');
                try{
                  album.photos.push({
                      'id': entry['gphoto$id']['$t'],
                      'latitude': parseFloat(coords[0]),
                      'longitude': parseFloat(coords[1]),
                      'icon': 'images/maps/dot_red.png',
                      'content':{
                          'title': entry['title']['$t'],
                          'time': entry['exif$tags']['exif$time']['$t'],
                          'image': entry['content'].src,
                          'thumbnail': entry.media$group.media$thumbnail[0].url,
                      }
                  });
                }catch(ex){
                  console.log(entry['gphoto$id']['$t'] + ' failed with ' + ex);
                }
             }              
            }
            resolve(album);
          }); 
        });
      }
    };

    provider.facebook = {
      getAlbum: function(token){
        return $q(function(resolve, reject) {
          $http.jsonp('https://graph.facebook.com/v2.3/me/albums', { params:
              {'callback': 'JSON_CALLBACK', 'alt': 'json-in-script', 'access_token': token}
          }).success(function(data){
            var albums = [];
            for(var e in data.data){
              var entry = data.data[e];
              albums.push({
                  title: entry.name,
                  url: entry.id,
                  count: entry.count,
                  author: entry.from.name,
                  date: entry.updated_time,
                  image: 'https://graph.facebook.com/v2.3/' + entry.cover_photo + '/picture?access_token=' + token
              });
            }
            resolve(albums);
          });
        });
      },
      getPhotos: function(token, albumId){
         return $q(function(resolve, reject) {
          var param = albumId.split('-');
          $http.jsonp('https://graph.facebook.com/v2.3/' + albumId + '/photos',
            { params: {'with': 'location','callback': 'JSON_CALLBACK', 'alt': 'json-in-script', 'access_token': token } }
          ).success(function(data){
            var album = {
                'title': 'TODO',
                'photos': []
            };               
            for(var e in data.data){
              var entry = data.data[e];
              if(entry.place){
                try{
                  album.photos.push({
                      'id': entry.id,
                      'latitude': parseFloat(entry.place.location.latitude),
                      'longitude': parseFloat(entry.place.location.longitude),
                      'icon': 'images/maps/dot_red.png',
                      'content':{
                          'title': entry.name,
                          'time': entry.created_time,
                          'image': entry.picture,
                          'thumbnail': entry.picture,
                      }
                  });
                }catch(ex){
                  console.log(entry['gphoto$id']['$t'] + ' failed with ' + ex);
                }
             }              
            }
            resolve(album);
          }); 
         });
      }
    };
    

    return {
      list: function () { return {
          'google': {
            'url': 'https://accounts.google.com/o/oauth2/auth',
            'client': '707577585652-pp5ln39kak6l51u67eisikv4q3nftbhs.apps.googleusercontent.com',
            'scope': 'https://picasaweb.google.com/data/',
          },
          'facebook': {
            'url': 'https://www.facebook.com/dialog/oauth',
            'client': '1003686156322671',
            'scope': 'user_photos',
          },
          /*'flickr': {
            'url': null,
          },*/
        };
      },
      get: function (name) { return provider[name]; }
    };

  });
