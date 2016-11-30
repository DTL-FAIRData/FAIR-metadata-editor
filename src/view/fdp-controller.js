app.controller('ViewFdpCtrl', function($scope, $http, $routeParams) {
  $scope.mapping = {
    fdp: {
      link: 'http://www.re3data.org/schema/3-0#dataCatalog',
      child: 'catalog'
    },
    catalog: {
      link: 'http://www.w3.org/ns/dcat#dataset',
      child: 'dataset'
    },
    dataset: {
      link: 'http://www.w3.org/ns/dcat#distribution',
      child: 'distribution'
    },
    distribution: {
    }
  };

  var schemas = {};

  // preload schemas
  $http.get('schema.json').then(function(response) {
    schemas.fdp = response.data;
  }).then(function() {
    return $http.get('catalog.json').then(function(response) {
      schemas.catalog = response.data;
    });
  }).then(function() {
    return $http.get('dataset.json').then(function(response) {
      schemas.dataset = response.data;
    });
  }).then(function() {
    return $http.get('distribution.json').then(function(response) {
      schemas.distribution = response.data;
    });
  }).then(function() {
    $scope.layer = $routeParams.layer || 'fdp';
    $scope.schema = schemas[$scope.layer];
  });

  $scope.endpoint = "http://dev-vm.fair-dtls.surf-hosted.nl:8082/fdp";

  $scope.load = function(url, layer) {
    // reset the model
    $scope.mymodel = {};
    // set the correct schema
    $scope.schema = schemas[layer];
    $scope.layer = layer;

    $http.get(url).then(function(response) {
      var parser = N3.Parser();

      parser.parse(response.data, function(error, triple) {
        if (error) {
          console.log(error);
        }

        if (triple) {
          var component;
          angular.forEach($scope.schema.components, function(v, k) {
            if (v.url === triple.predicate) {
              component = v;
            }
          });

          if (component) {
            $scope.$apply(function() {
              var value = N3.Util.isLiteral(triple.object) ? N3.Util.getLiteralValue(triple.object) : triple.object;

              if (component.multiple === true) {
                if (!$scope.mymodel[triple.predicate]) {
                  $scope.mymodel[triple.predicate] = [];
                }
                $scope.mymodel[triple.predicate].push(value);
              } else {
                $scope.mymodel[triple.predicate] = value;
              }
            });
          }
        }
      });
    });
  };

  $scope.breadcrumb = [];
  $scope.crumb = undefined;
  var things = {fdp: 0, catalog: 1, dataset: 2, distribution: 3};
  var sgniht = {0:'fdp', 1: 'catalog', 2: 'dataset', 3: 'distribution'};

  $scope.loadEndpoint = function(endpoint) {
    $scope.load(endpoint, 'fdp');
    $scope.breadcrumb.push({ name: 'FDP', url: endpoint });
    $scope.crumb = 0;
  };

  $scope.loadChild = function(value) {
    var child = $scope.mapping[$scope.layer].child;
    $scope.load(value, child);
    $scope.breadcrumb.push({ name: child, url: value });
    
    $scope.crumb = things[child];
  };

  $scope.doCrumb = function(crumb, index) {
    if (index === $scope.crumb) {
      console.log('do nothing?');
    } else if (index > $scope.crumb) {
      console.log('replace things? and go to', crumb.url);
    } else if (index < $scope.crumb) {
      console.log('set things inactive? and go to', crumb.url);
      $scope.breadcrumb.splice(index + 1);

      $scope.load(crumb.url, sgniht[index]);
    }
  };
});