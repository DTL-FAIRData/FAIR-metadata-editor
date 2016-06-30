app.service('Resolver', function($q, localStorageService, $http) {
  return {
    getSeparatorIndex: function(url) {
      var hash = url.lastIndexOf('#');
      if (hash === -1) {
        var slash = url.lastIndexOf('/');
        //TODO handle urls ending with a slash
        return slash;
      }
      return hash;
    },
    getLocalnameIndex: function(url) {
      return this.getSeparatorIndex(url) + 1;
    },
    resolvePrefix: function(url) {
      var deferred = $q.defer();

      var localnameIndex = this.getLocalnameIndex(url);
      var localname = url.substr(localnameIndex);
      var namespace = url.substr(0, localnameIndex);

      var result = {
        localname: localname,
        namespace: namespace
      };

      var cached = localStorageService.get(namespace);
      if (cached) {
        if (cached !== 'not-found') {
          result.prefix = cached;
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
      } else {
        $http.get('http://prefix.cc/reverse', {
          params: {
            uri: namespace,
            format: 'json'
          }
        }).then(function(response) {
          var prefix = Object.keys(response.data)[0];
          localStorageService.set(namespace, prefix);
          
          result.prefix = prefix;
          deferred.resolve(result);
        }, function(response) {
          localStorageService.set(namespace, 'not-found');
          deferred.reject(result);
        });
      }
      return deferred.promise;
    }
  };
});