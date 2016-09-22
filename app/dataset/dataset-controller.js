app.controller('DatasetCtrl', function($scope, $http, Output) {
  $http.get('dataset.schema.json').then(function(response) {
    $scope.datasetSchema = response.data;
  });

  $scope.datasetForm = [
    '*',
    { type: 'submit', title: 'Save' }
  ];

  $scope.model = {};

  var example = {
    title: 'Example dataset',
    identifier: 'A011',
    issued: '',
    modified: '',
    hasVersion: '1.0',
    description: 'This is an example dataset',
    publisher: 'http://www.dtls.nl',
    language: 'en',
    license: 'http://purl.org/NET/rdflicense/MIT1.0',
    rights: 'some rights',
    label: 'Example dataset',
    distribution: ['distribution-turtle', 'distribution-html'],
    theme: '',
    contactPoint: 'info@example.com',
    keyword: 'FAIR, Example, Dataset',
    landingPage: 'http://example.com/dataset/index.html'
  };

  $scope.example = function() {
    $scope.model = example;
  };

  $scope.onSubmit = function() {
    Output.write($scope.model, $scope.datasetSchema, 'dcat:Dataset')
      .then(function(result) {
        $scope.output = result;
      });
  };
});