app.directive('preview', function(RdfOutput) {
  return {
    template: '<pre ng-show="rdf">{{rdf}}</pre>',
    link: function(scope) {
      scope.$watch('mymodel', function() {
        scope.rdf = RdfOutput.write(scope.schema, scope.mymodel);
      }, true);
    }
  };
});