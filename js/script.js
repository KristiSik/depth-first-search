var gId = 1;
var selectRootNodeMode = false;
var rootNode;
var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
        {
        selector: 'node',
        style: {
            'background-color': '#666',
            'label': 'data(id)'
        },
        },
        {
        selector: '.selected-node',
        style: {
            'background-color': 'red'
        },
        },
        {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
        }
        },
        {
        selector: '.selected-edge',
        style: {
            'width': 4,
            'line-color': 'orange'
        }
        },
        {
        selector: '.selected-edge-red',
        style: {
            'width': 4,
            'line-color': '#f44242'
        }
        },
        {
        selector: '.root-node',
        style: {
            'background-color': 'orange'
        },
        }
    ],
    layout: {
        name: 'grid',
        rows: 1
    }
});

var selectedToConnect = cy.collection();

cy.on("click", function(event) {
    if (!event.target[0]) {
        if (selectRootNodeMode) {
            return;
        }
        if (selectedToConnect.length == 0) {
            addNode(event.position);
        } else {
            selectedToConnect[0].removeClass("selected-node");
            selectedToConnect = cy.collection();
        }
    } else if (event.target[0]) {
        if (selectRootNodeMode) {
            if (event.target[0].group() == "nodes") {
                selectRootNode(event.target[0]);
            }
            return;
        }
        addNodeToSelected(event.target[0]);
        if (selectedToConnect.length == 2) {
            if (!nodesAreConnected()) {
                addEdgeToPlot();
            }
            selectedToConnect[0].removeClass("selected-node");
            selectedToConnect = cy.collection();
        } else {
            event.target[0].addClass("selected-node");
        }
    }
});

cy.on("cxttap", function(event) {
    if (event.target[0]) {
        event.target.remove();
    }
});

function nodesAreConnected() {
    if (selectedToConnect[0].edgesTo(selectedToConnect[1]).length || selectedToConnect[1].edgesTo(selectedToConnect[0]).length) {
        return true;
    };
    return false;
}

function displayDFS() {
    var i = 0;
    setTimeout(function tick() {
        if (i < depthFirstEdges.length) {
            cy.edges()
            .filter(edge => (edge.source().id() == depthFirstEdges[i].startNode.name && edge.target().id() == depthFirstEdges[i].endNode.name) || (edge.source().id() == depthFirstEdges[i].endNode.name && edge.target().id() == depthFirstEdges[i].startNode.name))[0]
            .addClass("selected-edge-red");
            setTimeout(tick, 1000);
        } else {
            $(".select-first-node-btn").removeAttr("disabled");
        }
        i++;
    }, 1000);
}

function addNode(position) {
    cy.add({
        group: "nodes",
        data: { id: gId++ },
        position: { x: position.x, y: position.y }
    });
}

function addNodeToSelected(node) {
    selectedToConnect = selectedToConnect.add(node);
}

function addEdgeToPlot() {
    cy.add({
        group: "edges",
        data: { source: selectedToConnect[0].id(), target: selectedToConnect[1].id() }
    });
}

function uncolorAllEdges() {
    cy.edges().removeClass("selected-edge-red");
}

$(document).on("click", ".select-first-node-btn", function() {
    if (cy.edges().length == 0) {
        alert("There is no edges.");
        return;
    }
    uncolorAllEdges();
    if (rootNode != null) {
        rootNode.removeClass("root-node");
    }
    selectRootNodeMode = true;
    $(this).attr("disabled", "true");
});

function selectRootNode(node) {
    node.addClass("root-node");
    rootNode = node;
    selectRootNodeMode = false;
    var data = [];
    $(this).attr("disabled", "true");
    cy.edges().forEach(edge => {
        data.push([edge.source().id(), edge.target().id()]);
    });
    fillData(data);
    executeDFS(rootNode.id());
    displayDFS();
}