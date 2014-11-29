(function() {
  'use strict';
  var relvis = window.relvis = window.relvis || {};
  relvis.nodes = [];
  relvis.edges = [];
  var categories = { //{{{1
    authorInfo: ['creator', 'dbcaddi:hasCreatorDescription'],
    review: ['dbcaddi:hasReview', 'dbcaddi:hasAnalysis', 'dbcaddi:hasDescriptionFromPublisher', 'dbcaddi:discussedIn'],
    circular: ['subject'],
    structure: ['dbcaddi:isAnalysisOf', 'dbcaddi:isReviewOf', 'dbcbib:isPartOfManifestation', 'dbcaddi:isDescriptionFromPublisherOf', 'dbcaddi:discusses', 'dbcaddi:hasAdaptation', 'dbcaddi:isAdaptationOf', 'dbcaddi:isManuscriptOf', 'dbcaddi:hasManuscript', 'dbcaddi:continues', 'dbcaddi:continuedIn', 'dbcaddi:isSoundtrackOfMovie', 'dbcaddi:isSoundtrackOfGame', 'dbcaddi:hasSoundtrack', 'dbcaddi:isPartOfAlbum', 'dbcaddi:hasTrack']
  };
  //'dbcaddi:hasOnlineAccess', 'dbcaddi:hasSoundClip'

  relvis.addEventListener('data-update', relvis.throttle(300, function createGraph() { //{{{1

    var type = relvis.getType();
    var ids = relvis.getIds();

    var key;
    var nodeMap = {};
    var prevNodes, root, nodes, edges, i, rel, categoryMap, categoryNodes, property, node, categoryNodeList, j, id, children, k;
    var searchresults = 30;

    for (i = 0; i < ids.length; ++i) {
      id = ids[i];
      if (id.slice(0, 7) === 'search:') {
        children = relvis.getValues(id, 'results');
        if (children.length) {
          ids = id.slice(0, i).concat(children[0].slice(0, searchresults)).concat(ids.slice(i + 1));
          relvis.setIds(ids);
          return;
        }
      }
    }

    //{{{2 general graph generation
    prevNodes = {};
    relvis.nodes.forEach(function(node) {
      prevNodes[node.id] = node;
    });
    nodes = relvis.nodes = [];
    edges = relvis.edges = [];

    function createNode(node) {
      var prev = nodeMap[node.id] || prevNodes[node.id];
      if (prev) {
        for (var key in node) {
          if (node.hasOwnProperty(key)) {
            prev[key] = node[key];
          }
        }
        node = prev;
      }
      if (node.imgSrc === undefined) {
        node.imgSrc = relvis.getValues(node.id, 'cover')[0];
      }
      if (node.label === undefined || node.label === '...') {
        node.label = relvis.getValues(node.id, 'title')[0] || '...';
      }

      nodeMap[node.id] = node;
      return node;
    }

    //circular relations {{{2
    var traverseIds = [];
    var nextIds = {};
    var traverseDepth;

    function traverseGraph() {
      var ids, id, j, i, node, depth;
      ids = traverseIds;
      traverseIds = [];
      depth = traverseDepth[0];
      traverseDepth = traverseDepth.slice(1);
      if (typeof depth !== 'number') {
        return;
      }
      for (j = 0; j < ids.length; ++j) {
        id = ids[j];
        if (!nodeMap[id]) {
          relvis.log('error: expected id in nodemap', id);
        }
        node = nodeMap[id];
        var related = relvis.getValues(id, 'related');
        if (related.length) {
          related = related[0];
          var count = 0;
          for (i = 0; count < depth && i < related.length; ++i) {
            var branchId = related[i].id;
            if (!nodeMap[branchId]) {
              ++count;
              var branchNode = createNode({
                id: branchId,
                visible: true
              });
              traverseIds.push(branchId);
              edges.push({
                source: node,
                target: branchNode
              });
            }
          }
        }
      }
      traverseGraph();
    }

    //{{{2 external relations
    function createExternalRelations(id, group) {
      function createCategoryNodes() { // {{{3
        var i;
        categoryNodes = {};
        categoryMap = {};
        categoryNodeList = [];
        for (var category in categories) {
          if (categories.hasOwnProperty(category)) {
            categoryNodes[category] = createNode({
              id: 'category:' + category,
              label: category,
              type: 'category',
              visible: false
            });
            categoryNodeList.push(categoryNodes[category]);
            for (i = 0; i < categories[category].length; ++i) {
              categoryMap[categories[category][i]] = category;
            }
          }
        }
        categoryNodeList[0].fixedPosition = {
          x: 0,
          y: 0
        };
        categoryNodeList[1].fixedPosition = {
          x: 1,
          y: 0
        };
        categoryNodeList[2].fixedPosition = {
          x: 0,
          y: 1
        };
        categoryNodeList[3].fixedPosition = {
          x: 1,
          y: 1
        };
      }

      function createRelationNodes() { //{{{3
        Object.keys(categories).forEach(function(category) {
          categories[category].forEach(function(property) {
            relvis.getValues(id, property).forEach(function(value) {
              node = createNode({
                id: group + '-' + property + '-' + value,
                label: value,
                property: property,
                value: value,
                visible: true
              });
              if (node.label.trim().match(/^\d\d\d\d\d\d-[a-z]*:\d*$/)) {
                node.label = relvis.getValues(node.label, 'title')[0] || 'Loading...';
              }
              edges.push({
                source: categoryNodes[category],
                target: node
              });
              edges.push({
                source: root,
                target: node
              });
            });
          });
        });
      }

      function createRootNode() { //{{{3
        root = createNode({
          id: id,
          label: 'root',
          type: 'root',
          visible: true
        });
        root.imgSrc = relvis.getValues(id, 'cover')[0];
        root.label = relvis.getValues(id, 'title')[0] || '...';
      }

      createRootNode();
      createCategoryNodes();
      createRelationNodes();
    }
    //actual execution {{{2
    if (type === 'ext') { //{{{3
      if (relvis.d3force) {
        relvis.d3force.gravity(1);
      }
      for (i = 0; i < ids.length; ++i) {
        createExternalRelations(ids[i], ids);
        for (j = 0; j < i; ++j) {
          edges.push({
            source: nodeMap[ids[i]],
            target: nodeMap[ids[j]],
            type: 'collection'
          });
        }
      }
    } else if (type === 'cir') { //{{{3
      if (relvis.d3force) {
        relvis.d3force.gravity(0);
      }
      if (true) {
        if (ids.length <= 1) {
          traverseDepth = [9, 3];
        } else if (ids.length <= 2) {
          traverseDepth = [4, 3];
        } else if (ids.length <= 3) {
          traverseDepth = [3, 2];
        } else if (ids.length <= 7) {
          traverseDepth = [2, 2];
        } else if (ids.length <= 13) {
          traverseDepth = [3];
        } else if (ids.length <= 20) {
          traverseDepth = [2];
        } else {
          traverseDepth = [1];
        }
      } else {
        traverseDepth = [Math.ceil(13 / ids.length)];
        traverseDepth = [Math.ceil(19 / ids.length)];
      }

      for (i = 0; i < ids.length; ++i) {
        traverseIds.push(ids[i]);
        node = createNode({
          id: ids[i],
          type: 'primary',
          visible: true
        });
        for (j = 0; j < i; ++j) {
          edges.push({
            source: nodeMap[ids[i]],
            target: nodeMap[ids[j]],
            type: 'collection'
          });
        }
      }
      traverseGraph();
    } else if (type === 'str') { //{{{3
      if (relvis.d3force) {
        relvis.d3force.gravity(1);
      }
      var relations = ['creator', 'subject', 'type' /*, 'dbcaddi:isAnalysisOf', 'dbcaddi:isReviewOf', 'dbcbib:isPartOfManifestation', 'dbcaddi:isDescriptionFromPublisherOf', 'dbcaddi:discusses', 'dbcaddi:hasAdaptation', 'dbcaddi:isAdaptationOf', 'dbcaddi:isManuscriptOf', 'dbcaddi:hasManuscript', 'dbcaddi:continues', 'dbcaddi:continuedIn', 'dbcaddi:isSoundtrackOfMovie', 'dbcaddi:isSoundtrackOfGame', 'dbcaddi:hasSoundtrack', 'dbcaddi:isPartOfAlbum', 'dbcaddi:hasTrack'*/ ];
      for (i = 0; i < ids.length; ++i) {
        node = createNode({
          id: ids[i],
          type: 'primary',
          visible: true
        });
      }
      var relmap = {};
      for (i = 0; i < ids.length; ++i) {
        id = ids[i];
        for (j = 0; j < relations.length; ++j) {
          var relation = relations[j];
          var values = relvis.getValues(id, relation);
          for (k = 0; k < values.length; ++k) {
            var name = relation + '\u0000' + values[k];
            relmap[name] = (relmap[name] || 0) + 1;
          }
        }
      }
      var rellist = [];
      Object.keys(relmap).forEach(function(key) {
        if (relmap[key] > 1) {
          rellist.push({
            name: key.split('\u0000')[0],
            value: key.split('\u0000')[1],
            count: relmap[key]
          });
        }
      });
      rellist.sort(function(a, b) {
        return b.count - a.count;
      });
      rellist = rellist.slice(0, 20);
      for (i = 0; i < rellist.length; ++i) {
        rel = rellist[i];
        node = createNode({
          id: rel.name + rel.value,
          label: rel.value,
          type: 'category',
          subtype: rel.name,
          visible: true
        });
        for (j = 0; j < ids.length; ++j) {
          if (relvis.getValues(ids[j], rel.name).indexOf(rel.value) !== -1) {
            edges.push({
              source: node,
              target: nodeMap[ids[j]],
              type: 'category'
            });
          }
        }
      }
    }

    //{{{3 commit
    for (key in nodeMap) {
      if (nodeMap.hasOwnProperty(key)) {
        nodes.push(nodeMap[key]);
      }
    }

    relvis.layoutGraph();
    return {
      nodes: nodes,
      edges: edges
    };
  }));
})(); //{{{1
