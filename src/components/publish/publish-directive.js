app.directive('publish', function() {
  return {
    restrict: 'E',
    templateUrl: 'components/publish/publish.tpl.html',
    controller: function($scope, $http) {
      $scope.publish = function(endpoint) {
        if (!endpoint) {
          return;
        }

        $scope.publishing = true;

        console.log('publishing metadata to', endpoint);
        console.log('fdp metadata of type', $scope.path);

        var data = '<http://example.com> a <http://example.com/Example> .';

        $http.post(endpoint, data, {
          headers: {
            'Content-Type': 'text/turtle'
          }
        }).then(function(response) {
          $scope.publishing = false;
        }, function(response) {
          console.log('error publishing', response);
          $scope.publishing = false;
        });
      };
    }
  };
});