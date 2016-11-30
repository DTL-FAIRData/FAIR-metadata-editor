var app = angular.module('app', ['ngRoute', 'ngSanitize', 'templates', 'ui.bootstrap']);
app.config(["$routeProvider", function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/edit/:layer?', {
      templateUrl: 'template/fdp.html',
      controller: 'TplFdpCtrl'
    })
    .when('/view', {
      templateUrl: 'view/fdp.html',
      controller: 'ViewFdpCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);
app.controller('HomeCtrl', ["$scope", "$http", function($scope, $http) {
  $http.get('schema.json').then(function(response) {
    $scope.schema = response.data;
  });
  $http.get('catalog.json').then(function(response) {
    $scope.catschema = response.data;
  });
  $http.get('dataset.json').then(function(response) {
    $scope.dsschema = response.data;
  });

  $scope.mymodel = {
    "http://purl.org/dc/terms/title": "my example title",
    "http://purl.org/dc/terms/publisher": ["http://dtls.nl", "http://lumc.nl/"]
  };
  $scope.mycatmodel = {};
  $scope.mydsmodel = {};

  $scope.debug = function() {
    console.log($scope.mymodel);
    console.log($scope.schema);
  };
}]);
app.controller('TplFdpCtrl', ["$scope", "$routeParams", "$http", "$q", "$rootScope", function($scope, $routeParams, $http, $q, $rootScope) {
  var mapping = {
    fdp: 'schema.json',
    catalog: 'catalog.json',
    dataset: 'dataset.json',
    distrib: 'distribution.json'
  };

  var layer = $routeParams.layer || 'fdp';
  $scope.path = layer;

  // store state
  $rootScope.models = $rootScope.models || {};
  $rootScope.state = $rootScope.state || {};

  $scope.$watch('showOptionals', function() {
    $rootScope.state.showOptionals = $scope.showOptionals;
  });
  $scope.$watch('showGenerated', function() {
    $rootScope.state.showGenerated = $scope.showGenerated;
  });

  $http.get(mapping[layer]).then(function(response) {
    $scope.schema = response.data;
  }).then(function() {
    if (!$rootScope.models[layer]) {
      $rootScope.models[layer] = $scope.mymodel = {};

      angular.forEach($scope.schema.components, function(component) {
        if (component.multiple) {
          $scope.mymodel[component.url] = [''];
        }
        if (component.nested) {
          $scope.mymodel[component.url] = {};
        }
      });

      $scope.mymodel['http://rdf.biosemantics.org/ontologies/fdp-o#metadataIssued'] = new Date();
    } else {
      $scope.mymodel = $rootScope.models[layer];
    }
  });

  $scope.showOptionals = $rootScope.state.showOptionals || false;
  $scope.showGenerated = $rootScope.state.showGenerated || false;

  // $scope.testSelected = function(value) {
  //   console.log('selected ' + value + ' ??');
  //   return value;
  // };

  // $scope.languages = [];
  // $http.get('languages.json').then(function(response) {
  //   angular.forEach(response.data, function(lang) {
  //     $scope.languages.push({
  //       label: lang,
  //       url: 'http://id.loc.gov/vocabulary/iso639-1/' + lang
  //     });
  //   });
  // });

  // $scope.selectLanguage = function($item,$model,$label) {
  //   console.log($item, $model, $label);
  // };
}]);
app.controller('ViewFdpCtrl', ["$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
  $scope.mapping = {
    fdp: {
      link: 'http://www.re3data.org/schema/3-0#dataCatalog',
      child: 'catalog'
    },
    catalog: {
      link: 'http://www.w3.org/ns/dcat#dataset',
      child: 'dataset'
    },
    dataset: {
      link: 'http://www.w3.org/ns/dcat#distribution',
      child: 'distribution'
    },
    distribution: {
    }
  };

  var schemas = {};

  // preload schemas
  $http.get('schema.json').then(function(response) {
    schemas.fdp = response.data;
  }).then(function() {
    return $http.get('catalog.json').then(function(response) {
      schemas.catalog = response.data;
    });
  }).then(function() {
    return $http.get('dataset.json').then(function(response) {
      schemas.dataset = response.data;
    });
  }).then(function() {
    return $http.get('distribution.json').then(function(response) {
      schemas.distribution = response.data;
    });
  }).then(function() {
    $scope.layer = $routeParams.layer || 'fdp';
    $scope.schema = schemas[$scope.layer];
  });

  $scope.endpoint = "http://dev-vm.fair-dtls.surf-hosted.nl:8082/fdp";

  $scope.load = function(url, layer) {
    // reset the model
    $scope.mymodel = {};
    // set the correct schema
    $scope.schema = schemas[layer];
    $scope.layer = layer;

    $http.get(url).then(function(response) {
      var parser = N3.Parser();

      parser.parse(response.data, function(error, triple) {
        if (error) {
          console.log(error);
        }

        if (triple) {
          var component;
          angular.forEach($scope.schema.components, function(v, k) {
            if (v.url === triple.predicate) {
              component = v;
            }
          });

          if (component) {
            $scope.$apply(function() {
              var value = N3.Util.isLiteral(triple.object) ? N3.Util.getLiteralValue(triple.object) : triple.object;

              if (component.multiple === true) {
                if (!$scope.mymodel[triple.predicate]) {
                  $scope.mymodel[triple.predicate] = [];
                }
                $scope.mymodel[triple.predicate].push(value);
              } else {
                $scope.mymodel[triple.predicate] = value;
              }
            });
          }
        }
      });
    });
  };

  $scope.breadcrumb = [];
  $scope.crumb = undefined;
  var things = {fdp: 0, catalog: 1, dataset: 2, distribution: 3};
  var sgniht = {0:'fdp', 1: 'catalog', 2: 'dataset', 3: 'distribution'};

  $scope.loadEndpoint = function(endpoint) {
    $scope.load(endpoint, 'fdp');
    $scope.breadcrumb.push({ name: 'FDP', url: endpoint });
    $scope.crumb = 0;
  };

  $scope.loadChild = function(value) {
    var child = $scope.mapping[$scope.layer].child;
    $scope.load(value, child);
    $scope.breadcrumb.push({ name: child, url: value });
    
    $scope.crumb = things[child];
  };

  $scope.doCrumb = function(crumb, index) {
    if (index === $scope.crumb) {
      console.log('do nothing?');
    } else if (index > $scope.crumb) {
      console.log('replace things? and go to', crumb.url);
    } else if (index < $scope.crumb) {
      console.log('set things inactive? and go to', crumb.url);
      $scope.breadcrumb.splice(index + 1);

      $scope.load(crumb.url, sgniht[index]);
    }
  };
}]);
app.directive('fieldAutocomplete', ["$rootScope", "$http", "$filter", function($rootScope, $http, $filter) {
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
}]);
app.directive('field', ["$rootScope", "$http", function($rootScope, $http) {
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
}]);
angular.module('templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('home/home.html','<h1>Viewer</h1>\n<p>The viewer lets you view an existing FAIR datapoint in a nice form.</p>\n\n<h1>Editor</h1>\n<p>The editor lets you create FAIR datapoint metadata in a nice template.</p>');
$templateCache.put('template/fdp.html','<div class="row">\n    <ul class="nav nav-tabs">\n        <li>&nbsp;</li>\n        <li ng-class="{active: path==\'fdp\'}"><a href="#/edit?layer=fdp">Datapoint</a></li>\n        <li ng-class="{active: path==\'catalog\'}"><a href="#/edit?layer=catalog">Catalog</a></li>\n        <li ng-class="{active: path==\'dataset\'}"><a href="#/edit?layer=dataset">Dataset</a></li>\n        <li ng-class="{active: path==\'distrib\'}"><a href="#/edit?layer=distrib">Distribution</a></li>\n    </ul>\n</div>\n\n<div class="row">\n    <div class="col-md-6">\n        <div class="pull-right">\n            <a href ng-click="showOptionals=!showOptionals">\n                <span ng-if="showOptionals">Hide</span><span ng-if="!showOptionals">Show</span>&nbsp;optionals\n            </a>\n            <br>\n            <a href ng-click="showGenerated=!showGenerated">\n                <span ng-if="showGenerated">Hide</span><span ng-if="!showGenerated">Show</span>&nbsp;generated fields\n            </a>\n        </div>\n\n        <h1>{{schema.title}}</h1>\n\n        <form class="form-horizontal" name="form">\n            <field ng-repeat="(id,field) in schema.components"\n                fid="id"\n                field="field"\n                mymodel="mymodel"\n                schema="schema"\n                ng-if="showGenerated || !field.generated"\n                ng-show="field.required || showOptionals">\n            </field>\n        </form>\n    </div>\n    <div class="col-md-6">\n        <uib-tabset active="active">\n            <uib-tab heading="Preview">\n                <preview ng-if="schema"></preview>\n            </uib-tab>\n            <uib-tab heading="Help">\n                <help></help>\n            </uib-tab>\n        </uib-tabset>\n    </div>\n</div>');
$templateCache.put('view/fdp.html','<div class="row">\n    <div class="col-md-3 col-md-offset-1">\n        <input type="url" class="form-control" ng-model="endpoint" placeholder="Enter your FAIR datapoint location">\n    </div>\n    <div class="col-md-1">\n        <button type="submit" class="btn btn-primary" ng-click="loadEndpoint(endpoint)">View</button>\n    </div>\n</div>\n\n<div class="row">\n    <div class="col-md-12">\n        <hr>\n    </div>\n</div>\n\n<div class="row">\n    <div class="col-md-6">\n        <ol class="breadcrumb">\n            <li ng-repeat="crumb in breadcrumb track by $index">\n                <a href ng-click="doCrumb(crumb, $index)">{{crumb.name}}</a>\n            </li>\n        </ol>\n    </div>\n</div>\n\n<div class="row">\n    <div class="col-md-6">\n        <form class="form-horizontal">\n            <!-- <field ng-repeat="field in schema.components"\n                field="field"\n                mymodel="mymodel">\n            </field> -->\n            <div ng-repeat="field in schema.components" class="form-group">\n                <label class="col-sm-2 control-label">{{field.name}}</label>\n\n                <div class="col-sm-10">\n\n                    <p ng-if="!field.multiple" class="form-control-static">{{mymodel[field.url]}}</p>\n                    \n                    <div ng-if="field.multiple" class="row" ng-repeat="value in mymodel[field.url] track by $index">\n                        \n                        <div ng-if="mapping[layer].link == field.url" class="col-md-12">\n                            <a href ng-click="loadChild(value)">{{value}}&nbsp;<span class="glyphicon glyphicon-link"></span></a>\n                        </div>\n\n                        <div ng-if="mapping[layer].link != field.url" class="col-md-12">\n                            <p class="form-control-static">\n                                {{value}}\n                            </p>\n                        </div>\n                    \n                    </div>\n\n                </div>\n            </div>\n        </form>\n    </div>\n</div>');
$templateCache.put('components/field/field-autocomplete.tpl.html','<input class="form-control has-feedback"\n    ng-attr-type="{{field.type}}"\n    ng-attr-id="{{fid}}"\n    ng-model="mdl"\n    ng-focus="triggerhelp(field)"\n\n    uib-typeahead="result.label for result in getResults(field, $viewValue)"\n    typeahead-loading="resourceLoading"\n    typeahead-wait-ms="200"\n    typeahead-min-length="2"\n    typeahead-on-select="selectResult($item, field, $index)"/>\n\n<span ng-show="resourceLoading"\n    class="form-control-feedback spinner">\n</span>');
$templateCache.put('components/field/field-nested.tpl.html','<label ng-attr-for="{{fid}}"\n    class="col-md-2 col-md-offset-1 control-label">\n    {{field.name}}\n</label>\n\n<div class="col-md-8">\n    <input\n        class="form-control"\n        ng-attr-name="{{fid}}"\n        ng-attr-type="{{field.type}}"\n        ng-model="mdl[field.url]"\n        ng-focus="triggerHelp(field)"\n        ng-required="field.required"/>\n\n    <a href ng-attr-data-target="{{\'#\' + fid + \'-desc\'}}" data-toggle="collapse">\n        <span class="glyphicon glyphicon-info-sign"></span>\n    </a>\n\n    <div class="collapse" ng-attr-id="{{fid + \'-desc\'}}">\n        <div class="well">{{field.description}}</div>\n    </div>\n</div>');
$templateCache.put('components/field/field.tpl.html','<div class="form-group">\n    <label ng-attr-for="{{fid}}"\n        class="col-sm-2 control-label">\n        <span ng-class="{\'optional-control-label\':!field.required, \'generated-control-label\':field.generated}">{{field.name}}</span>\n    </label>\n\n    <div class="col-sm-10">\n        <input ng-if="!field.multiple && !field.autocomplete && !field.nested"\n            class="form-control"\n            ng-attr-name="{{fid}}"\n            ng-attr-type="{{field.type}}"\n            ng-attr-id="{{fid}}"\n            ng-model="mymodel[field.url]"\n            ng-focus="triggerHelp(field)"\n            ng-required="field.required"\n            ng-disabled="isDisabled(field)"/>\n\n        <input ng-if="field.nested"\n            class="form-control"\n            ng-attr-name="{{fid}}"\n            ng-attr-type="{{field.type}}"\n            ng-attr-id="{{fid}}"\n            ng-focus="triggerHelp(field)"\n            ng-required="field.required"\n            ng-model="mymodel[field.url].url"/>\n\n        <field-autocomplete\n            ng-if="!field.multiple && field.autocomplete"\n            field="field"\n            fid="fid"\n            mdl="mymodel[field.url]">\n        </field-autocomplete>\n\n        <div ng-if="field.multiple"\n                class="row"\n                ng-repeat="value in mymodel[field.url] track by $index">\n            <div class="col-md-11">\n                <input ng-if="field.autocomplete === undefined"\n                    class="form-control"\n                    ng-attr-type="{{field.type}}"\n                    ng-attr-id="{{fid + \'-\' + $index}}"\n                    ng-model="mymodel[field.url][$index]"\n                    ng-focus="triggerHelp(field)"/>\n                \n                <field-autocomplete\n                    ng-if="field.autocomplete !== undefined"\n                    field="field"\n                    fid="fid + \'-\' + $index"\n                    mdl="mymodel[field.url][$index]">\n                </field-autocomplete>\n                \n                <span ng-if="!$last">&nbsp;</span>\n            </div>\n\n            <div class="col-md-1">\n                <a href ng-click="remove(mymodel[field.url], $index)">\n                    <span class="glyphicon glyphicon-minus-sign"></span>\n                </a>\n            </div>\n        </div>\n\n        <a ng-if="field.multiple" href ng-click="add()">\n            <span class="glyphicon glyphicon-plus-sign"></span>\n        </a>\n        \n        <a href ng-attr-data-target="{{\'#\' + fid + \'-desc\'}}" data-toggle="collapse">\n            <span class="glyphicon glyphicon-info-sign"></span>\n        </a>\n\n        <a ng-if="field.nested" href ng-click="toggleCollapse()">\n            <span ng-class="{glyphicon:true, \'glyphicon-collapse-down\':!nestedcollapse, \'glyphicon-collapse-up\':nestedcollapse}"></span>\n        </a>\n\n        <div class="collapse" ng-attr-id="{{fid + \'-desc\'}}">\n            <div class="well">{{field.description}}</div>\n        </div>\n    </div>\n\n    <div class="row" ng-repeat="(id,fld) in field.nested.components">\n        <field-nested\n            ng-show="nestedcollapse"\n            field="fld"\n            fid="id"\n            mdl="mymodel[field.url]">\n        </field-nested>\n    </div>\n</div>');
$templateCache.put('components/help/help.tpl.html','<span ng-if="!field">Select a field to see more information</span>\n\n<div ng-if="field.description">\n    <h4>Description</h4>\n    <p>{{field.description}}</p>\n</div>\n\n<div ng-if="field.examples">\n    <h4>Examples</h4>\n    <p ng-repeat="example in field.examples">{{example}}</p>\n</div>');}]);
app.directive('fieldNested', ["$rootScope", function($rootScope) {
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
}]);
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