app.controller('HomeCtrl', function($scope, $http) {
  $http.get('schema.json').then(function(response) {
    $scope.schema = response.data;
  });
  $http.get('catalog.json').then(function(response) {
    $scope.catschema = response.data;
  });
  $http.get('dataset.json').then(function(response) {
    $scope.dsschema = response.data;
  });

  $scope.mymodel = {
    "http://purl.org/dc/terms/title": "my example title",
    "http://purl.org/dc/terms/publisher": ["http://dtls.nl", "http://lumc.nl/"]
  };
  $scope.mycatmodel = {};
  $scope.mydsmodel = {};

  $scope.debug = function() {
    console.log($scope.mymodel);
    console.log($scope.schema);
  };
});