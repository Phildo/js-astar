var MAX_SCORE = 999999999;
var Node = function(id)
{
  var availableNeighbors = new RegistrationList("NODE_"+id+"_AVAILABLE_NEIGHBORS");
  var closedNeighbors = new RegistrationList("NODE_"+id+"_CLOSED_NEIGHBORS");
  var approachingNeighbors = new RegistrationList("NODE_"+id+"_APPROACHING_NEIGHBORS");

  this.informNeighborsOfClosing()
  {
    availableNeighbors.performMemberFunction("informOfClosing", this);
  };
  this.beInformedOfClosing(node)
  {
    availableNeighbors.moveMemberToList(node, closedNeighbors);
  };
  var nodeAndOpenNodes = {"node":this,"openNodes":null}; //the whole 'nodeAndOpenNodes' object is a repurcussion of using a "registrationlist" when I really should just be using a normal linked list with an iterator
  this.tryToAddNeighborsToPath(openNodes)
  {
    nodeAndOpenNodes.openNodes = openNodes;
    availableNeighbors.performMemberFunction("tryToBeAddedToPath", nodeAndOpenNodes);
  };
  this.tryToBeAddedToPath(nodeAndOpenNodesObj)
  {
    if((var s = this.h + this.calculateGFrom(nodeAndOpenNodesObj.node)) < score)
    {
      this.parent = nodeAndOpenNodesObj.node;
      if(this.score != MAX_SCORE)
        nodeAndOpenNodesObj.openNodes.remove(this);
      this.score = s;
      nodeAndOpenNodesObj.openNodes.add(this);
    }
  };

  this.beConnectedFrom = function(node)
  {
    approachingNeighbors.register(node);
  };
  this.connectTo = function(node)
  {
    availableNeighbors.register(node);
    node.beConnectedFrom(this);
  };
  this.beDisconnectedFrom = function(node)
  {
    approachingNeighbors.unregister(node);
  };
  this.disconnectTo = function(node)
  {
    availableNeighbors.unregister(node);
    closedNeighbors.unregister(node);
    node.beDisconnectedFrom(this);
  };

  this.h = 0;
  this.calculateH = function() { this.h = 0; }; //overwrite me
  this.calculateGTo = function(node) { return node.calculateGFrom(this); };
  this.calculateGFrom = function(node) { return 0; }; //overwrite me

  this.reset = function()
  {
    this.score = MAX_SCORE;
    this.parent = null;
    this.opened = false;
    this.closed = false;
    this.isStart = false;
    this.isEnd = false;
    var m;
    while(m = closedNeighbors.firstMember())
      closedNeighbors.moveMemberToList(m, availableNeighbors);
  };
  this.reset();
};

var Map = function(id)
{
  var nodes = new RegistrationList("MAP_"+id);

  var connect = function(node1, node2)
  {
    node1.connectTo(node2);
    node2.connectTo(node1);
  };

  var constructGrid = function(width, height)
  {
    nodes.empty();
    var pos = [];
    var tmpNode;
    for(var i = 0; i < width; i++)
    {
      pos[i] = [];
      for(var j = 0; j < width; j++)
      {
        tmpNode = new Node();
        pos[i][j] = tmpNode;
        nodes.register(tmpNode);
      }
    }
    for(var i = 0; i < width; i++)
    {
      for(var j = 0; j < height; j++)
      {
        if(i-1 >= 0)
          pos[i][j].connectTo(pos[i-1][j]);
        if(i+1 < width)
          pos[i][j].connectTo(pos[i+1][j]);
        if(j-1 >= 0)
          pos[i][j].connectTo(pos[i][j-1]);
        if(j+1 < height)
          pos[i][j].connectTo(pos[i][j+1]);
      }
    }
    return pos;
  };
};

var aStarTraverse = function(map, startNode, endNode)
{
  startNode.isStart = true;
  endNode.isEnd = true;

  var openNodes = new BinaryTree("OPEN_NODES");
  startNode.score = 0;
  openNodes.add(startNode);
  closeNode(startNode);

  var n;
  while(n = openNodes.popLeastMember())
    closeNode(n);

  var closeNode = function(node)
  {
    node.informNeighborsOfClosing();
    node.closed = true;
    node.tryToAddNeighborsToPath(openNodes);
    openNodes.remove(node);
  };
};
