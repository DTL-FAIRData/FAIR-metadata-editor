app.directive('fdpBreadcrumbItem', function() {
  return {
    restrict: 'EA',
    templateUrl: 'components/breadcrumb/breadcrumb-item.html',
    scope: {
      item: '='
    },
    controller: function($scope, Breadcrumb) {
      $scope.show = function(child) {
        console.log('showing', child);
        if (child.type === 'catalog') {
          Breadcrumb.showCatalog(child.uri);
        } else if (child.type === 'dataset') {
          Breadcrumb.showDataset(child.uri);
        } else if (child.type === 'distribution') {
          Breadcrumb.showDistribution(child.uri);
        }
      };
    }
  };
});