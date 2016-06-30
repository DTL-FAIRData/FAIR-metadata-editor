app.service('FDP', function($q, $http) {
  return {
    //
    parseDocument: function (uri) {
      var defer = $q.defer();

      var parser = N3.Parser();
      var triples = [];
      parser.parse(function(error, triple, prefix) {
        if (triple) {triples.push(triple);}
      });

      $http.get(uri).then(function(response) {
        parser.addChunk(response.data);
        parser.end();
        defer.resolve(triples);
      }, function(response) {
        defer.reject(response.data);
      });

      return defer.promise;
    },
    //
    getRepository: function(uri) {
      var deferred = $q.defer();
      this.getRepositoryTriples(uri).then(function(triples) {
        var catalogs = triples.filter(function(triple) {
          return triple.predicate === 'http://www.w3.org/ns/ldp#contains';
        }).map(function(triple) {
          return triple.object;
        });
        deferred.resolve(catalogs);
      });
      return deferred.promise;
    },
    getRepositoryTriples: function(uri) {
      var deferred = $q.defer();
      this.parseDocument(uri).then(function(triples) {
        deferred.resolve(triples);
      }, function(response) { console.log(response); });
      return deferred.promise;
    },
    getCatalog: function(uri) {
      var deferred = $q.defer();
      this.getCatalogTriples(uri).then(function(triples){
        var datasets = triples.filter(function(triple) {
          return triple.predicate === 'http://www.w3.org/ns/dcat#dataset';
        }).map(function(triple) {
          return triple.object;
        });
        deferred.resolve(datasets);
      });
      return deferred.promise;
    },
    getCatalogTriples: function(uri) {
      var deferred = $q.defer();
      this.parseDocument(uri).then(function(triples) {
        deferred.resolve(triples);
      }, function(response) { console.log(response); });
      return deferred.promise;
    },
    getDataset: function(uri) {
      var deferred = $q.defer();
      this.getDatasetTriples(uri).then(function(triples){
        var distributions = triples.filter(function(triple) {
          return triple.predicate === 'http://www.w3.org/ns/dcat#distribution';
        }).map(function(triple) {
          return triple.object;
        });
        deferred.resolve(distributions);
      });
      return deferred.promise;
    },
    getDatasetTriples: function(uri) {
      var deferred = $q.defer();
      this.parseDocument(uri).then(function(triples) {
        deferred.resolve(triples);
      }, function(response) { console.log(response); });
      return deferred.promise;
    },
    getDistributionTriples: function(uri) {
      var deferred = $q.defer();
      this.parseDocument(uri).then(function(triples) {
        deferred.resolve(triples);
      }, function(response) { console.log(response); });
      return deferred.promise;
    },

    // helper functions
    getDisplayLabel: function(uri) {
      var defer = $q.defer();
      this.parseDocument(uri).then(function(triples) {
        var triple = triples.find(function(triple) {
          return triple.predicate === 'http://www.w3.org/2000/01/rdf-schema#label';
        });

        if (triple) {
          defer.resolve(triple.object);
        } else {
          defer.reject();
        }
      });
      return defer.promise;
    }
  };
});