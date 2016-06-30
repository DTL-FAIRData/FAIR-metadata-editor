app.directive('fdpBreadcrumb', function() {
  return {
    restrict: 'E',
    templateUrl: 'components/breadcrumb/breadcrumb.html',
    controller: function($scope, FDP) {
      $scope.stack = [];

      $scope.$on('display', function(event, args) {
        if (args.type === 'repo') {
          $scope.activeRepo = {
            uri: args.uri
          };
          FDP.getDisplayLabel(args.uri).then(function(label) {
            $scope.activeRepo.label = label;
          });
          FDP.getRepository(args.uri).then(function(children) {
            $scope.activeRepo.children = children.map(function(child) {
              return {uri: child, type: 'catalog'};
            });
          });

          $scope.activeCatalog = undefined;
          $scope.activeDataset = undefined;
          $scope.activeDistribution = undefined;
        } else if (args.type === 'catalog') {
          $scope.activeCatalog = {
            uri: args.uri
          };
          FDP.getDisplayLabel(args.uri).then(function(label) {
            $scope.activeCatalog.label = label;
          });
          FDP.getCatalog(args.uri).then(function(children) {
            $scope.activeCatalog.children = children.map(function(child) {
              return {uri: child, type: 'dataset'};
            });
          });

          $scope.activeDataset = undefined;
          $scope.activeDistribution = undefined;
        } else if (args.type === 'dataset') {
          $scope.activeDataset = {
            uri: args.uri
          };
          FDP.getDisplayLabel(args.uri).then(function(label) {
            $scope.activeDataset.label = label;
          });
          FDP.getDataset(args.uri).then(function(children) {
            $scope.activeDataset.children = children.map(function(child) {
              return {uri: child, type: 'distribution'};
            });
          });
          
          $scope.activeDistribution = undefined;
        } else if (args.type === 'distribution') {
          $scope.activeDistribution = {
            uri: args.uri
          };
          FDP.getDisplayLabel(args.uri).then(function(label) {
            $scope.activeDistribution.label = label;
          });
        }

        FDP.getDisplayLabel(args.uri).then(function(label) {
          $scope.stack.push({uri: args.uri, label: label});
        }, function() {
          console.log('failed to get display label');
        });
      });
    }
  };
});