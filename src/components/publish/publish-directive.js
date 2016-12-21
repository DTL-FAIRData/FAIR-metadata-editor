app.directive('publish', function() {
  return {
    restrict: 'E',
    templateUrl: 'components/publish/publish.tpl.html',
    controller: function($scope, $http, $q, RdfOutput) {
      $scope.endpoint = 'http://dev-vm.fair-dtls.surf-hosted.nl:8086/fdp';

      // parsing thing, temporary
      function localname(url) {
        var hash = url.lastIndexOf('#');
        if (hash === -1) {
          var slash = url.lastIndexOf('/');
          return url.substring(slash + 1);
        }
        return url.substring(hash + 1);
      }

      function getCatalogs(fdp) {
        var deferred = $q.defer();

        $http.get(fdp).then(function(response) {
          var catalogs = [];
          var parser = N3.Parser();
          parser.parse(response.data, function(error, triple) {
            if (error) {
              console.log(error);
              return;
            }
            if (triple) {
              if (triple.predicate === 'http://www.re3data.org/schema/3-0#dataCatalog') {
                catalogs.push({label: localname(triple.object), url: triple.object});
              }
            }
            if (!triple) {
              deferred.resolve(catalogs);
            }
          });
        }, function(response) {
          console.log('error retrieving catalogs', response);
          deferred.reject(response);
        });

        return deferred.promise;
      }

      function getDatasets(catalog) {
        var deferred = $q.defer();

        $http.get(catalog).then(function(response) {
          var datasets = [];
          var parser = N3.Parser();
          parser.parse(response.data, function(error, triple) {
            if (error) {
              console.log(error);
              return;
            }
            if (triple) {
              if (triple.predicate === 'http://www.w3.org/ns/dcat#dataset') {
                datasets.push({label: localname(triple.object), url: triple.object});
              }
            }
            if (!triple) {
              deferred.resolve(datasets);
            }
          });
        }, function(response) {
          console.log('error retrieving datasets', response);
          deferred.reject(response);
        });

        return deferred.promise;
      }

      if ($scope.path == 'dataset') {
        getCatalogs($scope.endpoint).then(function(catalogs) {
          $scope.catalogs = catalogs;
        });
      }
      if ($scope.path == 'distribution') {
        getCatalogs($scope.endpoint).then(function(catalogs) {
          $scope.catalogs = catalogs;
        });

        $scope.$watch('selectedCat', function() {
          console.log('selectedCat value changed', $scope.selectedCat);
          if ($scope.selectedCat) {
            getDatasets($scope.selectedCat).then(function(datasets) {
              $scope.datasets = datasets;
            });
          }
        });
      }
      // end parsing thing

      $scope.$watch('sel', function() {
        console.log('sel changed!', $scope.sel);
        if ($scope.sel) {
          getDatasets($scope.sel.url).then(function(datasets) {
            $scope.datasets = datasets;
          });
        }
      });

      $scope.publish = function(endpoint) {
        if (!endpoint) {
          return;
        }

        $scope.publishing = true;

        console.log('publishing metadata to', endpoint);
        console.log('fdp metadata of type', $scope.path);

        var data = RdfOutput.write($scope.schema, $scope.mymodel);
        var params = {};

        if ($scope.path === 'catalog') {
          params.catalogID = $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIdentifier']['http://purl.org/dc/terms/identifier'];
        }
        if ($scope.path === 'dataset') {
          endpoint = $scope.sel.url; // catalog url
          // resolve the dataset identifier
          params.datasetID = $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIdentifier']['http://purl.org/dc/terms/identifier'];
        }
        if ($scope.path == 'distribution') {
          endpoint = $scope.selds.url;
          params.distributionID = $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIdentifier']['http://purl.org/dc/terms/identifier'];
        }

        $http.post(endpoint, data, {
          params: params,
          headers: {
            'Content-Type': 'text/turtle'
          }
        }).then(function(response) {
          $scope.publishing = false;
          console.log('succes!', response);
          $scope.status = 'Posted metadata to ' + endpoint + '/' + $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIdentifier']['http://purl.org/dc/terms/identifier'];
        }, function(response) {
          console.log('error publishing', response);
          $scope.publishing = false;

          if (response.status >= 400 && response.status < 500) {
            $scope.status = 'Something was wrong with the metadata';
          } else if (response.status >= 500) {
            $scope.status = 'Something went wrong while posting the metadata';
          }
        });
      };
    }
  };
});