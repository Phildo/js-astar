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
    while(n = i.next())
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
    var max = 100;
    while(n = i.next())
    {
      alert();
      n.tryToBeAddedToPath(this, openNodes);
    }
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
      
      //BS
      //this.draw();
      //END BS
      
      //console.log("  adding node "+this.id+" score:"+this.score);
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
  this.calculateH = function() { this.h = 100*(Math.abs(this.x-this.end.x) + Math.abs(this.y-this.end.y)); console.log(this.h); }; //overwrite me
  this.calculateGTo = function(node) { return node.calculateGFrom(this); };
  this.calculateGFrom = function(node) { return node.g+1; }; //overwrite me
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

  this.constructGrid = function(width, height, end, stage)
  {
    nodes.empty();
    var pos = [];
    var tmpNode;
    for(var i = 0; i < width; i++)
    {
      pos[i] = [];
      for(var j = 0; j < height; j++)
      {
        tmpNode = new Node(i+"_"+j);
        
        // THIS IS BS
        tmpNode.x = i;
        tmpNode.y = j;
        tmpNode.stage = stage;
        tmpNode.draw = function()
        {
          this.stage.fillStyle = "#"+Math.floor(this.score/20)+""+Math.floor(this.score/20)+""+Math.floor(this.score/20);
          this.stage.fillRect(this.x*20+2, this.y*20+2, 16, 16);
        }
        tmpNode.drawC = function()
        {
          this.stage.fillStyle = "#0"+Math.floor(this.score/20)+"F"+Math.floor(this.score/20)+"0"+Math.floor(this.score/20);
          this.stage.fillRect(this.x*20+2, this.y*20+2, 16, 16);
        }
        // END BS

        pos[i][j] = tmpNode;
        tmpNode.end = end;
        tmpNode.calculateH();
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
  
  this.resetNodes = function()
  {
    nodes.performMemberFunction("reset", null);
  };
};

var aStarTraverse = function(map, startNode, endNode, stage)
{
  alert(startNode.id + " " + endNode.id);
  map.resetNodes();
  startNode.isStart = true;
  endNode.isEnd = true;
  
  stage.fillStyle = "#FF0000";
  stage.fillRect(endNode.x*20+2, endNode.y*20+2, 16, 16);

  var closeNode = function(node)
  {
    console.log("closing node "+node.id);
    node.informNeighborsOfClosing();
    node.closed = true;
    node.tryToAddNeighborsToPath(openNodes);
    node.drawC();
  };

  var openNodes = new BinaryTree("OPEN_NODES");
  startNode.score = 0;
  openNodes.add(startNode);

  var n;
  while(n = openNodes.popSmallest())
    closeNode(n);
};
