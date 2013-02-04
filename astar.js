var Node = function()
{
  var toNeighbors = [];

  this.connectTo = function(node)
  {
    toNeighbors[toNeighbors.length] = node;
  };
  this.disconnectTo = function(node)
  {
    for(var i = 0; i < toNeighbors.length; i++)
    {
      if(toNeighbors[i] == node)
        toNeighbors.splice(i,1);
    }
  };

  this.h = 0;
  this.calculateH = function() { this.h = 0; }; //overwrite me
  this.calculateGTo = function(node) { return node.calculateGFrom(this); };
  this.calculateGFrom = function(node) { return 0; }; //overwrite me

  this.reset = function()
  {
    this.score = 9999999999;
    this.parent = null;
    this.opened = false;
    this.closed = false;
    this.isStart = false;
    this.isEnd = false;
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

  var closeNode = function(node)
  {

  };
};
