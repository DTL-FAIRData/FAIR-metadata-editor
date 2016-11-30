app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/edit/:layer?', {
      templateUrl: 'template/fdp.html',
      controller: 'TplFdpCtrl'
    })
    .when('/view', {
      templateUrl: 'view/fdp.html',
      controller: 'ViewFdpCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});