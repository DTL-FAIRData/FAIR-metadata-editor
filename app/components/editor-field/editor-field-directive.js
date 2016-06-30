app.directive('editorField', function() {
  var N3Util = N3.Util;
  var NS_NOT_FOUND = 'NOT-FOUND';

  return {
    restrict: 'E',
    templateUrl: 'components/editor-field/editor-field.html',
    scope: {
      triple: '=',
      fid: '='
    },
    controller: function($scope, Resolver) {
      var p = $scope.triple.predicate;
      var rp = Resolver.resolvePrefix(p);

      rp.then(function(data) {
        $scope.predicate = data;
      }, function(data) {
        $scope.predicate = data;
      });

      var o = $scope.triple.object;

      if (N3Util.isLiteral(o)) {
        $scope.value = N3Util.getLiteralValue(o);

        var lang = N3Util.getLiteralLanguage(o);
        if (lang) {
          $scope.lang = lang;
        }
      } else {
        // handle object as URI
        $scope.value = o;
      }
    }
  };
});