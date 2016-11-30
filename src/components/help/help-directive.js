app.directive('help', function() {
  return {
    templateUrl: 'components/help/help.tpl.html',
    link: function($scope) {
      $scope.$on('help-trigger', function(e, field) {
        // var component;
        // angular.forEach($scope.schema.components, function(value, key) {
        //   if (value.id === helpId) {
        //     component = value;
        //   }
        // });

        // $scope.field = component.description;
        $scope.field = field;
      });
    }
  };
});