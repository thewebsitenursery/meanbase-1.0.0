'use strict';

angular.module('meanbaseApp')
  .controller('ExtensionsCtrl', function ($modal, $scope, endpoints, FileUploader, $cookieStore, toastr, $rootScope, api) {
    $scope.$parent.pageTitle = 'Extensions';

    if ($cookieStore.get('token')) {
      var uploader = $scope.uploader = new FileUploader({
          url: '/api/extension/upload',
          headers: {
            'Authorization': 'Bearer ' + $cookieStore.get('token')
          },
          autoUpload: true
      });
    }

    api.extensions.find({}).success(function(response) {
      $scope.extensions = response;
      for (var i = 0; i < $scope.extensions.length; i++) {
        if (!$scope.extensions[i].screenshot) {
          console.log('this');
          $scope.extensions[i].screenshot = 'http://placehold.it/500x200';
        }
      }
    });


    uploader.onCompleteAll = function(e) {
      uploader.clearQueue();
    };

    uploader.onSuccessItem = function() {
      $rootScope.$emit('cms.extensionUploaded');
      toastr.success('Extension successfully uploaded! Refreshing page to compile code.');
    };

    uploader.onErrorItem = function(item, response, status, headers) {
      toastr.error("Could not upload extension. " + status + ": " + response);
    };

    $scope.deleteExtension = function(extension) {
      if(extension._id) {
        var sure = window.confirm('Are you sure you want to delete this extension?');
        if(sure) {
          api.extensions.delete({folderName: extension.folderName}).then(function(response) {
            toastr.success('Deleted ' + extension.name + ' extension.');
            $scope.extensions.splice($scope.extensions.indexOf(extension), 1);
          });
        }
      }
    };

    $scope.toggleEnabled = function(extension) {
      extension.active = !extension.active;
      if(extension._id) {
        api.extensions.update({_id: extension._id}, {active: extension.active}).then(function(response) {
          toastr.clear();
          if(!extension.active) {
            toastr.warning('"' + extension.name + '" will not longer be useable in your site.')
          } else {
            toastr.success('"' + extension.name + '" can now be used across your site.');
          }
        });
      }
    };

  });
