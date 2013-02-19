var BinaryTree = function(identifier)
{
  var self = this;
  this.identifier = identifier;

  var BNode = function(content)
  {
    var node = this;
    node.parent = null
    node.left = null;
    node.right = null;
    node.content = content;

    if(node.content !== null && typeof node.content.BNodeMap === 'undefined')
    {
      Object.defineProperty(node.content, "BNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
  };
  BNode.prototype.isALeaf = function() { return this.left == null && this.right == null; };
  BNode.prototype.isAHead = function() { return this.parent == null; };
  BNode.prototype.isLeftChild = function() { return this.parent.left == this; };
  BNode.prototype.numChildren = function() { var num = 0; if(this.left != null) num++; if(this.right != null) num++; return num; };

  self.head = null;

  var findGreatestChildNode = function(head)
  {
    if(!head) return null;
    var tmp;
    while(tmp = head.right)
      head = tmp;
    return head;
  };

  var findLeastChildNode = function(head)
  {
    if(!head) return null;
    var tmp;
    while(tmp = head.left)
      head = tmp;
    return head;
  };

  var insertNode = function(node)
  {
    node.content.BNodeMap[self.identifier] = node;

    if(!self.head) //I hate doing things like this...
    {
      self.head = node;
      return;
    }

    var parentNode = null;
    var tmpNode = self.head;
    var evaluation = node.content.evaluate();
    var tmpEvaluation = 0;
    var lastCheckWasLeft = false;
    //Non-recursive tree traversal
    while(tmpNode)
    {
      if(tmpNode) tmpEvaluation = tmpNode.content.evaluate();
      while(tmpNode && evaluation < tmpEvaluation)
      {
        parentNode = tmpNode;
        tmpNode = parentNode.left;
        if(tmpNode) tmpEvaluation = tmpNode.content.evaluate();
        lastCheckWasLeft = true;
      }
      if(tmpNode) tmpEvaluation = tmpNode.content.evaluate();
      while(tmpNode && evaluation >= tmpEvaluation)
      {
        parentNode = tmpNode;
        tmpNode = parentNode.right;
        if(tmpNode) tmpEvaluation = tmpNode.content.evaluate();
        lastCheckWasLeft = false;
      }
    }
    node.parent = parentNode;
    if(parentNode && lastCheckWasLeft)
      parentNode.left = node;
    if(parentNode && !lastCheckWasLeft)
        parentNode.right = node;
  };

  var moveContentToNode = function(fromNode, toNode) //overwrites toNode's content
  {
    toNode.content = fromNode.content;
    toNode.content.BNodeMap[self.identifier] = toNode;
    fromNode.content = null;
  };

  var removeNode = function(node) //turned out that a potentially recursive algorithm was just o(1)...? did I do something wrong?
  {
    delete node.content.BNodeMap[self.identifier];

    if(node.numChildren() == 2)
    {
      var newNodeToDelete = findGreatestChildNode(node.left);
      moveContentToNode(newNodeToDelete, node);
      node = newNodeToDelete;
    }

    var child = null;
    if(node.left != null) 
      child = node.left;
    else if(node.right != null)
      child = node.right;

    if(node.parent)
    {
      if(node.isLeftChild()) 
        node.parent.left = child;
      else
        node.parent.right = child;
    }

    if(child)
      child.parent = node.parent;
      
    if(!node.parent)
      self.head = child;
  
    return node;
  };

  self.add = function(content)
  {
    insertNode(new BNode(content));
  };
  
  self.remove = function(content)
  {
    removeNode(content.BNodeMap[self.identifier]);
  };

  self.popBiggest = function()
  {
    var n;
    if(n = findGreatestChildNode(self.head))
      return removeNode(n).content;
    return null;
  };

  self.popSmallest = function()
  {
    var n;
    if(n = findLeastChildNode(self.head))
      return removeNode(n).content;
    return null;
  };

  //recursive. sorry.
  var appendChildrenAndSelfContentToOrderedList = function(node, list)
  {
    if(!node) return;
    appendChildrenAndSelfContentToOrderedList(node.left, list);
    list[list.length] = node.content;
    appendChildrenAndSelfContentToOrderedList(node.right, list);
  };

  self.getOrderedList = function()
  {
    var list = [];
    appendChildrenAndSelfContentToOrderedList(self.head, list);
    return list;
  };
};
