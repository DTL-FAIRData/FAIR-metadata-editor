from rdflib import Graph
from rdflib.namespace import RDFS, DCTERMS
import json

if __name__ == '__main__':
    g = Graph()
    g.parse(location = 'http://purl.org/NET/rdflicense/', format = 'turtle')
    
    data = []

    for s,p,o in g:
        if p == RDFS.label:
            label = o
            version = g.value(subject = s, predicate = DCTERMS.hasVersion)
            if version and version not in o:
                label = o + ' ' + version

            data.append({'url': s, 'label': label})

    with open('resources/license.json', 'w') as out:
        json.dump(data, out)