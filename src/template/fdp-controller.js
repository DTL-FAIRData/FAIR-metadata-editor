app.controller('TplFdpCtrl', function($scope, $routeParams, $http, $q, $rootScope) {
  var mapping = {
    fdp: 'schema.json',
    catalog: 'catalog.json',
    dataset: 'dataset.json',
    distribution: 'distribution.json'
  };

  var layer = $routeParams.layer || 'fdp';
  $scope.path = layer;

  // store state
  $rootScope.models = $rootScope.models || {};
  $rootScope.state = $rootScope.state || {};

  $scope.$watch('showOptionals', function() {
    $rootScope.state.showOptionals = $scope.showOptionals;
  });
  $scope.$watch('showGenerated', function() {
    $rootScope.state.showGenerated = $scope.showGenerated;
  });

  $http.get(mapping[layer]).then(function(response) {
    $scope.schema = response.data;
  }).then(function() {
    if (!$rootScope.models[layer]) {
      $rootScope.models[layer] = $scope.mymodel = {};

      angular.forEach($scope.schema.components, function(component) {
        if (component.multiple) {
          $scope.mymodel[component.url] = [''];
        }
        if (component.nested) {
          $scope.mymodel[component.url] = {};
        }
      });

      $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIssued'] = new Date();
    } else {
      $scope.mymodel = $rootScope.models[layer];
    }
  });

  $scope.showOptionals = $rootScope.state.showOptionals || false;
  $scope.showGenerated = $rootScope.state.showGenerated || false;
  $scope.active = $rootScope.state.active || 0;

  $scope.selectTab = function($selectedIndex) {
    $rootScope.state.active = $selectedIndex;
  };
});