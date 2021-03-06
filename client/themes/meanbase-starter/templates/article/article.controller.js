'use strict';

angular.module('meanbaseApp')
  .controller('ArticleCtrl', function ($scope, endpoints, $rootScope, $timeout, $http, api) {
  	$scope.sucessfulSend = false;
  	// Everything needs to be wrapped in a timeout
  	$timeout(function() {

  		api.approvedComments.find({url: $rootScope.page.url}).then(function(response) {
  			$scope.comments = response.data;
  		});

  		$scope.submitComment = function() {
  			var valid = validateComment($scope.comment);
  			if(valid) {
  				api.comments.create($scope.comment).then(function(response) {
  					$scope.comment = {};
  					$scope.sucessfulSend = true;
  					$timeout(function() { $scope.sucessfulSend = false; }, 2000);
	  			});
  			}
  		};

  		function validateComment(comment) {
  			console.log();
  			if(comment && $rootScope.page) {

  				// If someone tries to set comment to already approved this will unset it
  				// Validation is also done server side
  				if(comment.approved) { comment.approved = null; }

  				// Add forward slash if missing from page url
  				if($rootScope.page.url) {
  					if($rootScope.page.url.charAt(0) !== '/') {
  						$rootScope.page.url = '/' + $rootScope.page.url;
  					}
  				}
  				comment.url = $rootScope.page.url;

  				return true;
  			}
  			return false;
  		}

  	});
  });
