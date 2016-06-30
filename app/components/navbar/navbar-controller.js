app.controller('NavbarCtrl', function($rootScope, $scope, $location, Breadcrumb) {
  $scope.fdp = 'http://145.100.59.120:8082/fdp/';

  $scope.edit = function() {
    Breadcrumb.showRepository($scope.fdp);
  };
});