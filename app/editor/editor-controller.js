app.controller('EditorCtrl', function($rootScope, $scope, FDP) {
  $rootScope.$on('display', function(event, args) {
    FDP.parseDocument(args.uri).then(function(triples) {
      $scope.triples = triples;
    });
  });
});