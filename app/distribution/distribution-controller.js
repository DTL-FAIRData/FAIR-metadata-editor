app.controller('DistributionCtrl', function($scope, $http, Output) {
  $http.get('distribution.schema.json').then(function(response) {
    $scope.distributionSchema = response.data;
  });

  $scope.distributionForm = [
    '*',
    { type: 'submit', title: 'Save' }
  ];

  $scope.model = {};

  var example = {
    title: 'Example distribution',
    identifier: 'A111',
    issued: '',
    modified: '',
    hasVersion: '1.0',
    description: 'This is an example distribution',
    publisher: 'http://www.dtls.nl',
    language: 'en',
    license: 'http://purl.org/NET/rdflicense/MIT1.0',
    rights: 'some rights',
    label: 'Example distribution',
    accessURL: '',
    downloadURL: 'http://dev.rdf.biosemantics.org/examples/distribution.ttl',
    mediaType: 'text/turtle',
    format: 'turtle',
    byteSize: '42'
  };

  $scope.example = function() {
    $scope.model = example;
  };

  $scope.onSubmit = function() {
    Output.write($scope.model, $scope.distributionSchema, 'dcat:Distribution')
      .then(function(result) {
        $scope.output = result;
      });
  };
});