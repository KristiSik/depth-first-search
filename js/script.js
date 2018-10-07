var gId = 1;
var selectRootNodeMode = false;
var firstClickAfterDFS = false;
var DFSDisplayMode = false;
var rootNode;
var cy = cytoscape({
    container: document.getElementById('cy'),
    zoom: 1.5,
    minZoom: 0.5,
    maxZoom: 10,
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
        selector: '.visited-node',
        style: {
            'background-color': '#ffca00'
        }
        },
        {
        selector: '.selected-edge-red',
        style: {
            'width': 4,
            'line-color': '#f44242',
            'transition-property': 'line-color',
            'transition-duration': '0.5s'
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

cy.on("tap", function(event) {
    if (DFSDisplayMode) {
        return;
    }
    if (firstClickAfterDFS) {
        firstClickAfterDFS = false;
        uncolorElements();
    }
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
    if (event.target[0] && !selectRootNodeMode) {
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
            var currentEdge = cy.edges()
            .filter(edge => (edge.source().id() == depthFirstEdges[i].startNode.name && edge.target().id() == depthFirstEdges[i].endNode.name) || (edge.source().id() == depthFirstEdges[i].endNode.name && edge.target().id() == depthFirstEdges[i].startNode.name))[0];
            currentEdge.addClass("selected-edge-red");
            if (currentEdge.source().hasClass("visited-node") || currentEdge.source().hasClass("root-node")) {
                if (!currentEdge.target().hasClass("root-node")) {
                    currentEdge.target().addClass("visited-node");
                }
            } else {
                if (!currentEdge.source().hasClass("root-node")) {
                    currentEdge.source().addClass("visited-node");
                }
            }
            setTimeout(tick, 1000);
        } else {
            DFSDisplayMode = false;
            enableButtons();
            selectRootNodeMode = false;
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

function uncolorElements() {
    cy.edges().removeClass("selected-edge-red");
    cy.nodes().removeClass("visited-node").removeClass("root-node");
}

$(document).on("click", ".select-first-node-btn", function() {
    if (cy.edges().length == 0) {
        $('.mini.modal').modal('show');
        return;
    }
    uncolorElements();
    selectRootNodeMode = true;
    disableButtons();
});

function selectRootNode(node) {
    if (node.incomers().length + node.outgoers().length == 0) {
        return;
    }
    node.addClass("root-node");
    rootNode = node;
    var data = [];
    $(this).attr("disabled", "true");
    cy.edges().forEach(edge => {
        data.push([edge.source().id(), edge.target().id()]);
    });
    firstClickAfterDFS = true;
    DFSDisplayMode = true;
    fillData(data);
    executeDFS(rootNode.id());
    displayDFS();
}

$(".settings-btn").on("click", function() {
    $(".ui.sidebar").sidebar("show");
});

$(".clear-all-btn").on("click", function() {
    clearAll();
});

function disableButtons() {
    $(".select-first-node-btn").attr("disabled", "true");
    $(".clear-all-btn").attr("disabled", "true");
    $(".file-btn").attr("disabled", "true");
}

function enableButtons() {
    $(".select-first-node-btn").removeAttr("disabled");
    $(".clear-all-btn").removeAttr("disabled");
    $(".file-btn").removeAttr("disabled");
}

function clearAll() {
    cy.elements().remove();
    gId = 1;
}

$(".import-btn").change(function(){
    var reader = new FileReader();
    reader.onload = function(event) {
        cy.json(JSON.parse(event.target.result));
        uncolorElements();
        gId = parseInt(cy.nodes().reduce(function(prev, current) {
            return (prev && (prev.id() > current.id())) ? prev : current;
        }).id()) + 1;
    };
    reader.readAsBinaryString(document.getElementById("uploadFile").files[0]);
});

$(".export-btn").on("click", function() {
    var a = document.createElement('a');
    a.href = 'data:' + "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cy.json()));
    a.download = 'graph.json';
    a.innerHTML = 'download JSON';
    a.click();
    a.remove();
});

$('.dropdown')
  .dropdown({
    transition: 'drop'
  })
;