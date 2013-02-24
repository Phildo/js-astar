var Graph = function(identifier)
{
  this.identifier = identifier;
  
  var GraphNode = function(content, identifier)
  {
    this.identifier = identifier;
    this.content = content;
    
    if(this.content !== null && typeof this.content.GNodeMap === 'undefined')
    {
      Object.defineProperty(this.content, "GNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
    
    //"To" = away from self (from this node TO another node)
    this.toNeighbors = new LinkedList("NODE_"+identifier+"_TO_NEIGHBORS");
    
    this.thingsToBeNotifiedUponConnection = new LinkedList("NODE_"+identifier+"_TTBNUC");
    this.thingsToBeNotifiedUponDisconnection = new LinkedList("NODE_"+identifier+"_TTBNUD");
  };
  GraphNode.prototype.connectTo    = function(gnode) { this.toNeighbors.add(gnode);    this.thingsToBeNotifiedUponConnection.performMemberFunction("graphIsConnectingTo",gnode);       };
  GraphNode.prototype.disconnectTo = function(gnode) { this.toNeighbors.remove(gnode); this.thingsToBeNotifiedUponDisconnection.performMemberFunction("graphIsDisconnectingTo",gnode); };
    
  var gnodes = new LinkedList("GRAPH_"+identifier+"_NODES");
  
  this.add = function(content, identifier)
  {
    var tmpgNode = new GraphNode(content, identifier);
    tmpgNode.content.GNodeMap[this.identifier] = tmpgNode;
    gnodes.add(tmpgNode);
  };
  
  this.connectNodeToNode = function(contentA, contentB)
  {
    contentA.GNodeMap[this.identifier].connectTo(contentB.GNodeMap[this.identifier]);
  };
  this.disconnectNodeToNode = function(contentA, contentB)
  {
    contentA.GNodeMap[this.identifier].disconnectTo(contentB.GNodeMap[this.identifier]);
  };
};
