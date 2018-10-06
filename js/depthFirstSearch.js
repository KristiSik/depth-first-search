var nodes = [];
var edges = [];
var depthFirstEdges = [];	//array of selected edges in DepthFirstSearch algorithm
class Node{
	constructor(name) {
		this.name = name;
		this.isTaken = false;
		this.edges = [];
	}

	pushEdge(edge) {
		edges.push(edge);
	}

	getEdge() {
		return this.edges;
	}
};
class Edge{
	constructor(number) {
		this.number = number;
		this.visited = false;
		this.startNode;
		this.endNode;
	}
};

//set start node in headNode
//run method DepthFirstSearch
//to execute algorithm
function executeDFS(rootNodeName) {
	var node = nodes.filter(n => n.name == rootNodeName)[0];
	node.visited = true;
	depthFirstSearch(node);
}

//recursin method
//finish when all nodes are visited
function depthFirstSearch(head) {
	for(var edge of head.edges) {
		if(edge.isTaken == true)
			continue;
		if(edge.endNode.visited==true && edge.startNode.visited==true)
			continue;
		else{
			edge.isTaken = true;
			edge.endNode.visited = true;
			edge.startNode.visited = true;
			depthFirstEdges.push(edge);
			// console.log(edge.number+": "+edge.startNode.name+"-"+edge.endNode.name);
			depthFirstSearch(edge.endNode);
			depthFirstSearch(edge.startNode);
		}
	}
}

function addEdgeToArray(edgeNumber, startNodeName, endNodeName) {
	var edge = new Edge(edgeNumber);
	var startNode = nodes.filter(node => node.name == startNodeName)[0];
	var endNode = nodes.filter(node=>node.name == endNodeName)[0];
	if(startNode === undefined) {
		startNode = new Node(startNodeName);
		nodes.push(startNode);
	}
	if(endNode === undefined) {
		endNode = new Node(endNodeName);
		nodes.push(endNode);
	}
	startNode.edges.push(edge);
	endNode.edges.push(edge);
	edge.startNode = startNode;
	edge.endNode = endNode;
	edges.push(edge);
}

//read data-array and fill array of nodes and edges
function fillData(data) {
	edges = [];
	nodes = [];
	depthFirstEdges = [];
	for(var i = 0; i<data.length; i++) {
		addEdgeToArray(i+1, data[i][0], data[i][1]);
	}
}

function printNodes() {
	for(var node of nodes) {
		console.log(node.name + ":");
		for(var edge of node.edges) {
			console.log("   " + edge.number);
		}
	}
}

function printEdges() {
	for(var edge of edges) {
		console.log(edge.number+" : "+edge.startNode.name+"-"+edge.endNode.name);
	}
}