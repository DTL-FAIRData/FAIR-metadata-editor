app.directive('field', function($rootScope, $http) {
  return {
    restrict: 'E',
    templateUrl: 'components/field/field.tpl.html',
    scope: {
      fid: '=',
      field: '=',
      mymodel: '=',
      schema: '='
    },
    link: function(scope) {
      // testing for nested field collapse
      scope.toggleCollapse = function() {
        scope.nestedcollapse = !scope.nestedcollapse;
      };

      scope.triggerHelp = function(field) {
        $rootScope.$broadcast('help-trigger', field);
      };

      scope.isDisabled = function(field) {
        if (field.alternative) {
          var component = scope.schema.components[field.alternative];
          return scope.mymodel[component.url] && (scope.mymodel[component.url] !== '' || scope.mymodel[component.url] != []);
        }
        return false;
      };

      scope.remove = function(field, index) {
        field.splice(index, 1);
      };

      scope.add = function() {
        if (!scope.mymodel[scope.field.url]) {
          scope.mymodel[scope.field.url] = [];
        }
        scope.mymodel[scope.field.url].push('');
      };

      scope.getResults = function(field, $viewValue) {
        if (field.autocomplete.api) {
          var api = field.autocomplete.api;
          var params = api.params || {};
          params[api.inputparam] = $viewValue;

          return $http.get(api.endpoint, {
            params: params
          }).then(function(response) {
            var root = response.data[api.response.root];
            var props = api.response.props;

            var results = [];

            angular.forEach(root, function(value) {
              var result = {};

              angular.forEach(value, function(v, k) {
                if (props[k]) {
                  result[props[k]] = v;
                }
              });

              results.push(result);
            });

            return results;
          }, function(response) {
            console.log('error', response); // TODO handle this in ui
          });
        }
      };
      scope.selectResult = function($item, field, $index) {
        scope.mymodel[field.url][$index] = $item.url;
      };

      // scope.languages = [];
      // $http.get('languages.json').then(function(response) {
      //   angular.forEach(response.data, function(lang) {
      //     scope.languages.push({
      //       label: lang,
      //       url: 'http://id.loc.gov/vocabulary/iso639-1/' + lang
      //     });
      //   });
      // });

      // scope.selectLanguage = function($item, field, $index) {
      //   scope.mymodel[field.url][$index] = $item.url;
      // };
    }
  };
});