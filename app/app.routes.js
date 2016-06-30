app.config(function($routeProvider){
  $routeProvider.when('/', {
    templateUrl: 'editor/editor.html',
    controller: 'EditorCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
});