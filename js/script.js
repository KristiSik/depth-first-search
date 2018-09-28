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
            'label': 'data(id)',
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
        selector: '.selected-edge-blue',
        style: {
            'width': 4,
            'line-color': 'blue'
        }
        }
    ],
    layout: {
        name: 'grid',
        rows: 1
    }
});

var selectedToConnect = cy.collection();

cy.on("click", function(event){
    if (!event.target[0]) {
        if (selectedToConnect.length == 0) {
            addNode(event.position);
        } else {
            selectedToConnect[0].removeClass("selected-node");
            selectedToConnect = cy.collection();
        }
    } else if (event.target[0]) {
        if (selectRootNodeMode) {
            selectRootNode(event.target[0]);
            return;
        }
        addNodeToSelected(event.target[0]);
        if (selectedToConnect.length == 2) {
            if (!nodesAreConnected()) {
                addEdge();
            }
            selectedToConnect[0].removeClass("selected-node");
            selectedToConnect = cy.collection();
        } else {
            event.target[0].addClass("selected-node");
        }
    }
});

cy.on("cxttap", function(event){
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

function t() {
    var i = 0;
    setTimeout(function tick(){
        if (i < cy.edges().length) {
            cy.edges()[i].addClass("selected-edge-blue");
            setTimeout(tick, 1000);
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

function addEdge() {
    cy.add({
        group: "edges",
        data: { source: selectedToConnect[0].id(), target: selectedToConnect[1].id() }
    });
}

$(document).on("click", ".select-first-node-btn", function(){
    selectRootNodeMode = true;
    $(this).attr("disabled", "true");
});

function selectRootNode(node) {
    rootNode = node;
    selectRootNodeMode = false;
    $(".select-first-node-btn").removeClass("select-first-node-btn").addClass("start-dfs-btn").html("Start DFS").removeAttr("disabled");
}

$(document).on("click", ".start-dfs-btn", function(){
    alert("ok");
});