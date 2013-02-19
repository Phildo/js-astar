var MAX_SCORE = 99999999;
var AStarGraph = function(identifier, calculateH, calculateGFromNodeToNode)
{
  var self = this;
  this.identifier = identifier;
  
  var AStarNode = function(content, identifier)
  {
    this.identifier = identifier;
    this.content = content;
    
    if(this.content !== null && typeof this.content.ASNodeMap === 'undefined')
    {
      Object.defineProperty(this.content, "ASNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
    
    //"To" = away from self (from this node TO another node)
    //"From" = toward self (FROM another node to this node)
    var availableToNeighbors = new LinkedList("NODE_"+identifier+"_AVAILABLE_TO_NEIGHBORS");
    var closedToNeighbors = new LinkedList("NODE_"+identifier+"_CLOSED_TO_NEIGHBORS");
    var fromNeighbors = new LinkedList("NODE_"+identifier+"_FROM_NEIGHBORS"); //neighbors from which this node is accessible
  
    this.informNeighborsOfClosing = function()
    {
      availableToNeighbors.performMemberFunction('learnOfClosingNode',this);
    };
    this.learnOfClosingNode = function(node)
    {
      availableToNeighbors.moveMemberToList(node, closedToNeighbors);
    };
  
    this.tryToAddNeighborsToPathAndOpenThem = function(openNodes)
    {
      var i = availableToNeighbors.getIterator();
      var n;
      while(n = i.next())
        n.tryToBeAddedToPathAndOpened(this, openNodes);
    };
    this.tryToBeAddedToPathAndOpened = function(node, openNodes)
    {
      var g = calculateGFromNodeToNode(node.content, node.g, this.content);
      if(g < this.g)
      {
        this.parent = node;
        if(this.g != MAX_SCORE) //it has already been added to openNodes before
          openNodes.remove(this);
        this.g = g;
        this.content.ASTAR_STATE_g_ness = this.g;
        this.content.ASTAR_STATE_opened = true;
        openNodes.add(this);
      }
    };
    this.getPath = function(list)
    {
      list[list.length] = this;
      this.content.ASTAR_STATE_ispath = true;
      if(this.parent) return this.parent.getPath(list);
      else return list;
    };
  
    this.beConnectedFrom = function(node)
    {
      fromNeighbors.add(node);
    };
    this.connectTo = function(node)
    {
      availableToNeighbors.add(node);
      node.beConnectedFrom(this);
    };
    this.beDisconnectedFrom = function(node)
    {
      fromNeighbors.remove(node);
    };
    this.disconnectTo = function(node)
    {
      availableToNeighbors.remove(node);
      node.beDisconnectedFrom(this);
    };
    
    this.reset = function()
    {
      this.parent = null;
      this.isStart = false;
      this.isEnd = false;
      this.h = MAX_SCORE;
      this.g = MAX_SCORE;
      var m;
      while(m = closedToNeighbors.firstMember())
        closedToNeighbors.moveMemberToList(m, availableToNeighbors);
    };
    
    //No functional purpose for these variables. Just used to communicate the state for anyone interested.
    this.resetASTAR_STATE = function()
    {
      this.content.ASTAR_STATE_closed = false;
      this.content.ASTAR_STATE_opened = false;
      this.content.ASTAR_STATE_ispath = false;
      this.content.ASTAR_STATE_h_ness = MAX_SCORE;
      this.content.ASTAR_STATE_g_ness = MAX_SCORE;
    }
    this.reset();
  };
  //calculateH = function(node, goalNode) { return 1; };
  this.calculateH = calculateH;
  //calculateGFromNodeToNode = function(nodeA, g, nodeB) { return g+1; };
  this.calculateGFromNodeToNode = calculateGFromNodeToNode;
  AStarNode.prototype.evaluate = function() { return this.g + this.h; };
  
  
  var nodes = new LinkedList("MAP_"+identifier);
  
  //PUBLIC FUNCTIONS
  this.add = function(content, identifier)
  {
    var tmpNode = new AStarNode(content, identifier);
    tmpNode.content.ASNodeMap[self.identifier] = tmpNode;
    nodes.add(tmpNode);
  };
  
  this.connectNodeToNode = function(contentA, contentB)
  {
    contentA.ASNodeMap[self.identifier].connectTo(contentB.ASNodeMap[self.identifier]);
  };
  
  this.disconnectNodeToNode = function(contentA, contentB)
  {
    contentA.ASNodeMap[self.identifier].disconnectTo(contentB.ASNodeMap[self.identifier]);
  };
  
  this.resetNodes = function()
  {
    nodes.performMemberFunction("reset", null);
  };
  
  this.resetNodesASTAR_STATE = function()
  {
    nodes.performMemberFunction("resetASTAR_STATE", null);
  };
  
  this.calculateHs = function(goalNode)
  {
    var i = nodes.getIterator();
    var n;
    while(n = i.next())
    {
      n.h = this.calculateH(n.content, goalNode.content);
      n.content.ASTAR_STATE_h_ness = n.h;
    }
  };

  this.getBestPath = function(startContent, endContent)
  {
    this.resetNodesASTAR_STATE();
    var startNode = startContent.ASNodeMap[self.identifier];
    var endNode = endContent.ASNodeMap[self.identifier];
    startNode.isStart = true;
    startNode.g = 0;
    endNode.isEnd = true;
    this.calculateHs(endNode);
    var bestPath = [];
  
    var closeNode = function(node)
    {
      if(node.isEnd)
        return node.getPath(bestPath);
        
      node.informNeighborsOfClosing();
      node.content.ASTAR_STATE_closed = true;
      node.tryToAddNeighborsToPathAndOpenThem(openNodes);
      return null;
    };

    var openNodes = new BinaryTree(self.identifier+"_OPEN_NODES");
    openNodes.add(startNode);
  
    var n;
    var path = null;
    
    while((n = openNodes.popSmallest()) && !path)
      path = closeNode(n);
      
    this.resetNodes();
    return path;
  };

  this.getBestStep = function(startContent, endContent)
  {
    var step = {"content":null};
    var path = this.getBestPath(startContent, endContent)
    if(path && path.length >= 2)
      step = path[path.length-2];
    return step.content;
  };
};
