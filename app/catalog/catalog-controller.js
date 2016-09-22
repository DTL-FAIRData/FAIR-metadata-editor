app.controller('CatalogCtrl', function($scope, $http, Output) {
  $http.get('catalog.schema.json').then(function(response) {
    $scope.catalogSchema = response.data;
  });

  $scope.catalogForm = [
    '*',
    { type: 'submit', title: 'Save' }
  ];

  $scope.model = {};

  var example = {
    title: 'Example catalog',
    identifier: 'A001',
    issued: '',
    modified: '',
    hasVersion: '1.0',
    description: 'This is an example catalog',
    publisher: 'http://www.dtls.nl',
    language: 'en',
    license: 'http://purl.org/NET/rdflicense/MIT1.0',
    rights: 'some rights',
    label: 'Example catalog',
    homepage: 'http://example.com/catalog',
    dataset: ['foo-dataset', 'bar-dataset'],
    themeTaxonomy: ''
  };

  $scope.example = function() {
    $scope.model = example;
  };

  $scope.onSubmit = function() {
    Output.write($scope.model, $scope.catalogSchema, 'dcat:Catalog')
      .then(function(result) {
        $scope.output = result;
      });
  };
});