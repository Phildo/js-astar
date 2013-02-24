var AStarTraverser = function(graph, calculateHFromNodeToNode, calculateGFromNodeToNode, identifier)
{
  var MAX_SCORE = 99999999;
  
  this.identifier = identifier;
  
  this.graph = graph;
  this.calculateHFromNodeToNode = calculateHFromNodeToNode; //calculateHFromNodeToNode = function(node, goalNode) { return 1; };
  this.calculateGFromNodeToNode = calculateGFromNodeToNode; //calculateGFromNodeToNode = function(nodeA, g, nodeB) { return g+1; };
  
  this.makeASTNodeFromGraphNodeIfNeeded = function(gnode)
  {
    if(typeof gnode.ASTNodeMap === 'undefined' || typeof gnode.ASTNodeMap[this.identifier] === 'undefined')
    {
      var tmpastNode = new ASTNode(gnode, gnode.identifier);
      tmpastNode.gnode.ASTNodeMap[this.identifier] = tmpastNode;
    }
  };
  
  var self = this;
  var ASTNode = function(gnode, identifier)
  {
    this.parentTraverser = self;
    this.identifier = identifier;
    this.gnode = gnode;
    
    if(typeof this.gnode.ASTNodeMap === 'undefined')
    {
      Object.defineProperty(this.gnode, "ASTNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
    
    this.availableToNeighbors = new LinkedList("NODE_"+this.identifier+"_AVAILABLE_TO_NEIGHBORS");
    this.closedToNeighbors = new LinkedList("NODE_"+this.identifier+"_CLOSED_TO_NEIGHBORS");
    
    this.gnode.thingsToBeNotifiedUponConnection.add(this);
    this.gnode.thingsToBeNotifiedUponDisconnection.add(this);
      
    self.astnodes.add(this);
    this.reset();
  };
  ASTNode.prototype.connectToGraphNodeNeighbors = function()
  {
    var i = this.gnode.toNeighbors.getIterator();
    var tmpastNode;
    var gnode;
    while(gnode = i.next())
      this.connectToGraphNode(gnode);
  };
  ASTNode.prototype.graphIsConnectingTo = function(gnode)
  {
    this.connectToGraphNode(gnode);
    this.parentTraverser.invalidatePath();
  };
  ASTNode.prototype.graphIsDisconnectingTo = function(gnode)
  {
    this.availableToNeighbors.remove(gnode.ASTNodeMap[this.parentTraverser.identifier]);
    this.parentTraverser.invalidatePath();
  };
  ASTNode.prototype.connectToGraphNode = function(gnode)
  { 
    this.parentTraverser.makeASTNodeFromGraphNodeIfNeeded(gnode);
    if(!this.availableToNeighbors.hasMember(gnode.ASTNodeMap[this.parentTraverser.identifier]) && !this.closedToNeighbors.hasMember(gnode.ASTNodeMap[this.parentTraverser.identifier]))
      this.availableToNeighbors.add(gnode.ASTNodeMap[this.parentTraverser.identifier]);
  };
  ASTNode.prototype.informNeighborsOfClosing = function()        { this.availableToNeighbors.performMemberFunction('learnOfClosingNode',this); };
  ASTNode.prototype.learnOfClosingNode       = function(astnode) { if(this.availableToNeighbors.hasMember(astnode))
                                                                      this.availableToNeighbors.moveMemberToList(astnode, this.closedToNeighbors); 
                                                                    else
                                                                      this.closedToNeighbors.add(astnode); };
  ASTNode.prototype.evaluate                 = function()        { return this.g + this.h; };
  
  ASTNode.prototype.tryToAddNeighborsToPathAndOpenThem = function(openNodes, goalastNode)
  {
    var i = this.availableToNeighbors.getIterator();
    var astnode;
    while(astnode = i.next())
      astnode.tryToBeAddedToPathAndOpened(this, openNodes, goalastNode);
  };
  ASTNode.prototype.tryToBeAddedToPathAndOpened = function(astnode, openNodes, goalastNode)
  {
    var g = calculateGFromNodeToNode(astnode.gnode.content, astnode.g, this.gnode.content);
    if(g < this.g)
    {
      this.parent = astnode;
      if(this.g != MAX_SCORE) openNodes.remove(this);
      else this.h = calculateHFromNodeToNode(this.gnode.content, goalastNode.gnode.content);
      this.g = g;
      openNodes.add(this);
    }
  };
  ASTNode.prototype.getPath = function(list)
  {
    list[list.length] = this;
    if(this.parent) return this.parent.getPath(list);
    else return list;
  };
  ASTNode.prototype.reset = function()
  {
    this.parent  = null;
    this.isStart = false;
    this.isEnd   = false;
    this.h       = MAX_SCORE;
    this.g       = MAX_SCORE;
    var m;
    while(m = this.closedToNeighbors.firstMember())
      this.closedToNeighbors.moveMemberToList(m, this.availableToNeighbors);
  };
  
  this.astnodes = new LinkedList("TRAVERSER_"+this.identifier+"_NODES");
  
  this.invalidatePath = function() { this.currentPath = null; };

  this.getBestPath = function(startContent, endContent)
  {
    console.log('gbp');
    var startNode = startContent.GNodeMap[this.graph.identifier].ASTNodeMap[this.identifier];
    startNode.connectToGraphNodeNeighbors();
    startNode.isStart = true;
    startNode.g = 0;
    
    var endNode  = endContent.GNodeMap[this.graph.identifier].ASTNodeMap[this.identifier];
    endNode.connectToGraphNodeNeighbors();
    endNode.isEnd = true;

    var bestPath = [];
    var openNodes = new BinaryTree(this.identifier+"_OPEN_NODES");
    openNodes.add(startNode);
  
    var closeNode = function(astnode)
    {
      if(astnode.isEnd)
        return astnode.getPath(bestPath);
        
      astnode.connectToGraphNodeNeighbors();
        
      astnode.informNeighborsOfClosing();
      astnode.tryToAddNeighborsToPathAndOpenThem(openNodes, endNode);
      return null;
    };
  
    var astnode;
    var path = null;
    while((astnode = openNodes.popSmallest()) && !path)
      path = closeNode(astnode);
      
    this.resetNodes();
    return path;
  };
  
  this.getBestNextStep = function(startContent, endContent)
  {
    this.makeASTNodeFromGraphNodeIfNeeded(startContent.GNodeMap[this.graph.identifier]);
    var startNode  = startContent.GNodeMap[this.graph.identifier].ASTNodeMap[this.identifier];
    
    this.makeASTNodeFromGraphNodeIfNeeded(endContent.GNodeMap[this.graph.identifier]);
    var endNode  = endContent.GNodeMap[this.graph.identifier].ASTNodeMap[this.identifier];

    //This is a bit over-complicated; I'm not sure if it really offers any optimization, but it gets the job done.
    if((this.currentPath == null || this.currentPath[0] != endNode || this.currentPath[this.currentPath.length-1] != startNode) && (!(this.currentPath = this.getBestPath(startContent, endContent)) || this.currentPath.length < 2))
        return (this.currentPath = null); // Yes, "=". not "==" or "===".
      
    this.currentPath.splice(this.currentPath.length-1,1);
    return this.currentPath[this.currentPath.length-1].gnode.content;
  };
  
  this.resetNodes = function()
  {
    this.astnodes.performMemberFunction("reset", null);
  };
};
