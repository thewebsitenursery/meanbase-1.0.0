'use strict';

// This directive uses the slug passed in to get the appropriate images and display them in a slider

angular.module('extensions')
  .directive('extensibleAreasExtension', function (endpoints, $rootScope) {
    return {
      templateUrl: 'extensions/extensible-areas-extension/extensible-areas-extension.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      	scope.foreverRepeatError = false;
      	scope.extension.config = scope.extension.config || {};
      	if(scope.extension.config.extensionArea === scope.areaName) {
      		scope.extension.config.extensionArea = '';
      	}
      }
    };
  });