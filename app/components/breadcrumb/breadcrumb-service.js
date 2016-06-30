app.service('Breadcrumb', function($rootScope) {
  return {
    showRepository: function(uri) {
      $rootScope.$broadcast('display', {uri: uri, type: 'repo'});
    },
    showCatalog: function(uri) {
      $rootScope.$broadcast('display', {uri: uri, type: 'catalog'});
    },
    showDataset: function(uri) {
      $rootScope.$broadcast('display', {uri: uri, type: 'dataset'});
    },
    showDistribution: function(uri) {
      $rootScope.$broadcast('display', {uri: uri, type: 'distribution'});
    }
  };
});