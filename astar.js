var MAX_SCORE = 999999999;
var Node = function(id)
{
  this.id = id;
  //"To" = away (from this node TO another node)
  //"From" = toward (FROM another node to this node)
  var availableToNeighbors = new RegistrationList("NODE_"+id+"_AVAILABLE_TO_NEIGHBORS");
  var closedToNeighbors = new RegistrationList("NODE_"+id+"_CLOSED_TO_NEIGHBORS");
  var fromNeighbors = new RegistrationList("NODE_"+id+"_FROM_NEIGHBORS"); //neighbors from which this node is accessible

  this.informNeighborsOfClosing = function()
  {
    var i = availableToNeighbors.getIterator();
    while(n = i.getNext())
      n.learnOfClosingNode(this);
  };
  this.learnOfClosingNode = function(node)
  {
    availableToNeighbors.moveMemberToList(node, closedToNeighbors);
  };

  this.tryToAddNeighborsToPath = function(openNodes)
  {
    var i = availableToNeighbors.getIterator();
    var n;
    while(n = i.getNext())
      n.tryToBeAddedToPath(this, openNodes);
  };
  this.tryToBeAddedToPath = function(node, openNodes)
  {
    var s;
    if((s = this.h + this.calculateGFrom(node)) < score)
    {
      this.parent = node;
      if(this.score != MAX_SCORE)
        openNodes.remove(this);
      this.score = s;
      console.log("tried adding:"+this.id+" score:"+this.score);
      openNodes.add(this);
    }
  };

  this.beConnectedFrom = function(node)
  {
    fromNeighbors.register(node);
  };
  this.connectTo = function(node)
  {
    availableToNeighbors.register(node);
    node.beConnectedFrom(this);
  };
  this.beDisconnectedFrom = function(node)
  {
    fromNeighbors.unregister(node);
  };
  this.disconnectTo = function(node)
  {
    availableToNeighbors.unregister(node);
    closedToNeighbors.unregister(node);
    node.beDisconnectedFrom(this);
  };
  
  this.h = 0;
  this.g = 0;
  this.calculateH = function() { this.h = 0; }; //overwrite me
  this.calculateGTo = function(node) { return node.calculateGFrom(this); };
  this.calculateGFrom = function(node) { return node.g+0; }; //overwrite me
  this.evaluate = function() { return this.score; };

  this.reset = function()
  {
    this.score = MAX_SCORE;
    this.parent = null;
    this.isStart = false;
    this.isEnd = false;
    var m;
    while(m = closedToNeighbors.firstMember())
      closedToNeighbors.moveMemberToList(m, availableToNeighbors);
  };
  this.reset();
};

var Map = function(id)
{
  var nodes = new RegistrationList("MAP_"+id);

  this.constructGrid = function(width, height)
  {
    console.log("constructing grid:"+width+"x"+height);
    nodes.empty();
    var pos = [];
    var tmpNode;
    for(var i = 0; i < width; i++)
    {
      pos[i] = [];
      for(var j = 0; j < height; j++)
      {
        tmpNode = new Node(i+"_"+j);
        pos[i][j] = tmpNode;
        nodes.register(tmpNode);
      }
    }
    for(var i = 0; i < width; i++)
    {
      for(var j = 0; j < height; j++)
      {
        console.log("connecting:"+i+","+j);
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
  
  var resetNodes = function()
  {
    nodes.performMemberFunction(reset);
  };
};

var aStarTraverse = function(map, startNode, endNode)
{
  startNode.isStart = true;
  endNode.isEnd = true;

  var closeNode = function(node)
  {
    console.log("closing node:"+node.id);
    node.informNeighborsOfClosing();
    node.closed = true;
    node.tryToAddNeighborsToPath(openNodes);
    openNodes.remove(node);
  };

  var openNodes = new BinaryTree("OPEN_NODES");
  startNode.score = 0;
  openNodes.add(startNode);

  var n;
  while(n = openNodes.popSmallest())
    closeNode(n);
};
