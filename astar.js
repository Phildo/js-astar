var MAX_SCORE = 999999999;
var AStarNode = function(id)
{
  this.id = id;
  //"To" = away from self (from this node TO another node)
  //"From" = toward self (FROM another node to this node)
  var availableToNeighbors = new RegistrationList("NODE_"+id+"_AVAILABLE_TO_NEIGHBORS");
  var closedToNeighbors = new RegistrationList("NODE_"+id+"_CLOSED_TO_NEIGHBORS");
  var fromNeighbors = new RegistrationList("NODE_"+id+"_FROM_NEIGHBORS"); //neighbors from which this node is accessible

  this.informNeighborsOfClosing = function()
  {
    var i = availableToNeighbors.getIterator();
    var n;
    while(n = i.next())
      n.learnOfClosingNode(this);
  };
  this.learnOfClosingNode = function(node)
  {
    availableToNeighbors.moveMemberToList(node, closedToNeighbors);
  };
  this.disallowPassage = function()
  {
    var i = fromNeighbors.getIterator();
    var n;
    var ns = [];
    while(n = i.next())
      ns[ns.length] = n;
    for(var k = 0; k < ns.length; k++)
      ns[k].disconnectTo(this);
  };

  this.tryToAddNeighborsToPath = function(openNodes)
  {
    var i = availableToNeighbors.getIterator();
    var n;
    var max = 100;
    while(n = i.next())
      n.tryToBeAddedToPath(this, openNodes);
  };
  this.tryToBeAddedToPath = function(node, openNodes)
  {
    var s;
    var g = this.calculateGFrom(node);
    if((s = this.h + g) < this.score)
    {
      this.parent = node;
      if(this.score != MAX_SCORE)
        openNodes.remove(this);
      this.score = s;
      this.g = g;
      openNodes.add(this);
    }
  };
  this.getPath = function(list)
  {
    list.register(this);
    if(this.parent) return this.parent.getPath(list);
    else return list;
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
    if(availableToNeighbors.hasMember(node))
      availableToNeighbors.unregister(node);
    if(closedToNeighbors.hasMember(node))
      closedToNeighbors.unregister(node);
    node.beDisconnectedFrom(this);
  };
  
  this.h = 0;
  this.g = 0;

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
AStarNode.prototype.calculateH = function(node) { this.h = 1; }; //overwrite me
AStarNode.prototype.calculateGTo = function(node) { return node.calculateGFrom(this); };
AStarNode.prototype.calculateGFrom = function(node) { return node.g+1; }; //overwrite me
AStarNode.prototype.evaluate = function() { return this.score; };

var Map = function(id)
{
  var nodes = new RegistrationList("MAP_"+id);

  this.constructGrid = function(width, height)
  {
    nodes.empty();
    var pos = [];
    var tmpNode;
    for(var i = 0; i < width; i++)
    {
      pos[i] = [];
      for(var j = 0; j < height; j++)
      {
        tmpNode = new AStarNode(i+"_"+j);
        tmpNode.content = {"x":i,"y":j,"height":0,"block":false};
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
    this.resetNodes();
    return pos;
  };
  
  this.resetNodes = function()
  {
    nodes.performMemberFunction("reset", null);
  };
  
  this.calculateHs = function(node)
  {
    nodes.performMemberFunction("calculateH", node);
  };

  this.getBestPath = function(startNode, endNode)
  {
    startNode.isStart = true;
    endNode.isEnd = true;
    this.calculateHs(endNode);
    var bestPath = new RegistrationList("BEST_PATH_"+startNode.id+"_"+endNode.id);
  
    var closeNode = function(node)
    {
      if(node.isEnd)
        return node.getPath(bestPath);
      else
      {
        node.informNeighborsOfClosing();
        node.closed = true;
        node.tryToAddNeighborsToPath(openNodes);
        return null;
      }
    };

    var openNodes = new BinaryTree("OPEN_NODES");
    startNode.score = 0;
    openNodes.add(startNode);
  
    var n;
    var path = null;
    while((n = openNodes.popSmallest()) && !path)
      path = closeNode(n);
      
    this.resetNodes();
    return path;
  };

  this.getBestStep = function(startNode, endNode)
  {
    var step = null;
    var path = this.getBestPath(startNode, endNode)
    if(path)
    {
      var i = path.getIterator();
      if(step = i.next()) step = i.next();
      path.empty();
    }
    return step;
  };
};
