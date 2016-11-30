app.directive('fieldNested', function($rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'components/field/field-nested.tpl.html',
    scope: {
      field: '=',
      fid: '=',
      mdl: '='
    },
    link: function(scope) {
      scope.triggerHelp = function(field) {
        $rootScope.$broadcast('help-trigger', field);
      };
    }
  };
});