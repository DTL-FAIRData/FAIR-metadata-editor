app.directive('preview', function(){
  return {
    template: '<pre ng-show="rdf">{{rdf}}</pre>',
    link: function(scope, element, attrs) {
      function writeRdf(subject, writer, schema, model, triples, subjectsOrdered) {
        if (!triples[subject]) {
          triples[subject] = [];
          subjectsOrdered.push(subject);
        }

        // nested components are visited but only add the type 
        if (subject !== undefined) {
          triples[subject].push({
            subject: subject,
            predicate: 'rdf:type',
            object: schema.type
          });
        }

        angular.forEach(schema.components, function(component) {
          var value = model[component.url];

          // this is dependant on the order, may need to look into this
          if (component.duplicate) {
            var dup = schema.components[component.duplicate];
            value = model[dup.url];
          }

          if (component.nested) {
            writeRdf(model[component.url].url, writer, component.nested, model[component.url], triples, subjectsOrdered);
            value = model[component.url].url;
          }

          if (value) {
            var values = angular.isArray(value) ? value : [value];

            angular.forEach(values, function(val) {
              if (val && val !== '') {
                if (component.type === 'text') {
                  val = '"' + val + '"';
                }

                triples[subject].push({
                  subject: subject,
                  predicate: component.url,
                  object: val
                });
              }
            });
          }
        });
      }

      scope.$watch('mymodel', function() {
        var writer = N3.Writer({
          prefixes: scope.schema.namespaces
        });

        var triples = {};
        var subjectsOrdered = [];
        writeRdf('', writer, scope.schema, scope.mymodel, triples, subjectsOrdered);

        angular.forEach(subjectsOrdered, function(subject) {
          angular.forEach(triples[subject], function(triple) {
            writer.addTriple(triple);
          });
        });

        writer.end(function(error, result) {
          if (error) {
            console.log('error generating rdf preview', error);
          } else {
            scope.rdf = result;
          }
        });
      }, true);
    }
  };
});