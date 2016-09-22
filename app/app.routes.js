app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/catalog', {
      templateUrl: 'catalog/catalog.html',
      controller: 'CatalogCtrl'
    })
    .when('/dataset', {
      templateUrl: 'dataset/dataset.html',
      controller: 'DatasetCtrl'
    })
    .when('/distribution', {
      templateUrl: 'distribution/distribution.html',
      controller: 'DistributionCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});