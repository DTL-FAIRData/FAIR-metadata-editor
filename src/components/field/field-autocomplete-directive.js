app.directive('fieldAutocomplete', function($rootScope, $http, $filter) {
  return {
    restrict: 'E',
    templateUrl: 'components/field/field-autocomplete.tpl.html',
    scope: {
      field: '=',
      fid: '=',
      mdl: '='
    },
    link: function(scope) {
      scope.getResults = function(field, $viewValue) {
        if (field.autocomplete.api) {
          var api = field.autocomplete.api;
          var params = api.params || {};

          if (api.inputparam) {
            params[api.inputparam] = $viewValue;
          }

          return $http.get(api.endpoint, {
            params: params
          }).then(function(response) {
            var root = response.data[api.response.root] || response.data;
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

        if (field.autocomplete.source) {
          return $http.get(field.autocomplete.source).then(function(response) {
            return $filter('filter')(response.data, $filter('lowercase')($viewValue));
          }, function(response) {
            console.log('error', response);
          });
        }

        if (field.autocomplete.data) {
          return field.autocomplete.data;
        }
      };

      scope.selectResult = function($item, field, $index) {
        // scope.mymodel[field.url][$index] = $item.url;
        scope.mdl = $item.url;
      };
    }
  };
});