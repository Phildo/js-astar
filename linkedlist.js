var LinkedList = function(identifier)
{
  var self = this;
  this.identifier = identifier;

  var LLNode = function(content)
  {
    this.prev = null;
    this.next = null;
    this.content = content;

    if(this.content !== null && typeof this.content.LLNodeMap === 'undefined')
    {
      Object.defineProperty(this.content, "LLNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
  };

  this.head = new LLNode(null);
  this.tail = new LLNode(null);
  this.head.next = this.tail;
  this.tail.prev = this.head;

  //SHOULDN'T BE CALLED FROM ANYWHERE BUT WITHIN A LIST!! (only public so other lists can call it... )
  self.insertNodeAfter = function(node, prevNode)
  {
    node.prev = prevNode;
    node.next = prevNode.next;
    node.prev.next = node;
    node.next.prev = node;

    if(node.content !== null)
    {
      node.content.LLNodeMap[self.identifier] = node;
    }

    return node;
  };

  //SHOULDN'T BE CALLED FROM ANYWHERE BUT WITHIN A LIST!! (only public so other lists can call it... )
  self.removeNode = function(node)
  {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.next = null;
    node.prev = null;

    if(node.content !== null)
    {
      delete node.content.LLNodeMap[self.identifier];
    }

    return node;
  };

  self.add = function(content)
  {
    self.insertNodeAfter(new LLNode(content), self.head);
  };

  self.remove = function(content)
  {
    self.removeNode(content.LLNodeMap[self.identifier]);
  };

  self.moveMemberToList = function(content, list)
  {
    list.insertNodeAfter(self.removeNode(content.LLNodeMap[self.identifier]), list.head);
  };

  self.performMemberFunction = function(func, args)
  {
    var node = self.head;
    while(node.next != null)
    {
      node = node.next;
      if(node.prev.content !== null)
        node.prev.content[func](args);
    }
  };

  self.performOnMembers = function(func, args)
  {
    var node = self.head;
    while(node.next != null)
    {
      node = node.next;
      if(node.prev.content !== null)
        func(node.prev.content, args);
    }
  };

  self.firstMember = function()
  {
    return self.head.next.content;
  };

  self.hasMember = function(content)
  {
    return content.LLNodeMap[self.identifier];
  };

  self.empty = function()
  {
    var m;
    while(m = self.firstMember())
      self.remove(m);
  };
  
  var Iterator = function(){};
  Iterator.prototype.next = function()
  {
    this.node = this.node.next;
    return this.node.content;
  };
  self.getIterator = function()
  {
    var i = new Iterator();
    i.node = self.head;
    return i;
  };
};

LinkedList.prototype.toString = function()
{
  var str = "";
  var node = this.head;
  var i = 0;
  while(node.next != null)
  {
    node = node.next;
    if(node.content !== null)
      str += node.content.toString()+",";
  }
  return str;
};

var PrioritizedLinkedList = function(identifier, priorities)
{
  var self = this;
  this.identifier = identifier;
  this.priorities = [];
  for(var i = 0; i < priorities; i++)
    this.priorities[i] = new LinkedList(identifier+"_PRIORITY_"+i);

  self.add = function(content, priority)
  {
    this.priorities[priority].add(content);
  };

  self.remove = function(content, priority)
  {
    this.priorities[priority].remove(content);
  };

  self.moveMemberToList = function(content, priority, list)
  {
    this.priorities[priority].moveMemberToList(content, list);
  };

  self.moveMemberToPrioritizedList = function(content, priority, list, priority)
  {
    this.priorities[priority].remove(content);
    list.add(content, priority);
    //That's the fastest way I can think to do this one, unfortunately... :(
  };

  self.performMemberFunction = function(func, args)
  {
    for(var i = 0; i < this.priorities.length; i++)
      this.priorities[i].performMemberFunction(func, args);
  };

  self.performOnMembers = function(func, args)
  {
    for(var i = 0; i < this.priorities.length; i++)
      this.priorities[i].performOnMembers(func, args);
  };

  self.firstMember = function(priority)
  {
    return this.priorities[priority].firstMember();
  };

  self.hasMember = function(content, priority)
  {
    return this.priorities[priority].hasMember(content);
  };

  self.empty = function()
  {
    for(var i = 0; i < this.priorities.length; i++)
      this.priorities[i].empty();
  };
  
  var PIterator = function(){};
  PIterator.prototype.next = function()
  {
    var n;
    while(n = this.i.next())
    {
      if(n.content) return n.content;
      
      if(this.priority < this.priorities.length)
      {
        this.priority++;
        this.i = this.priorities[this.priority].getIterator();
      }
      else
        return null;
    }
  };
  self.getIterator = function()
  {
    var i = new PIterator();
    i.priority = 0;
    i.i = this.priorities[0].getIterator();
    return i;
  };
};

PrioritizedLinkedList.prototype.toString = function()
{
  var str = "";
  for(var i = 0; i < this.priorities.length; i++)
    str += this.priorities[i].toString()+",";
  return str;
};

var RecycleLinkedList = function(identifier, generateFunc, refreshFunc)
{
  var self = this;
  this.identifier = identifier;
  var active = new LinkedList("RECYCLE_"+identifier+"_ACTIVE");
  var inactive = new LinkedList("RECYCLE_"+identifier+"_INACTIVE");

  self.generate = generateFunc;
  self.refresh = refreshFunc;

  self.get = function()
  {
    var m;
    if(m = inactive.firstMember())
      inactive.remove(m);
    else
      m = self.generate();
    self.refresh(m);
    return m;
  };

  self.add = function(m)
  {
    active.add(m);
  };

  self.retire = function(m)
  {
    active.moveMemberToList(m, inactive);
  };

  self.performMemberFunction = function(func, args)
  {
    active.performMemberFunction(func, args);
  };

  self.performOnMembers = function(func, args)
  {
    active.performOnMembers(func, args);
  };

  self.firstMember = function()
  {
    return active.firstMember();
  };
  
  self.hasMember = function(content)
  {
    return active.hasMember(content);
  };

  self.empty = function()
  {
    var m;
    while(m = self.firstMember())
      self.retire(m);
  };

  self.getIterator = function()
  {
    return active.getIterator();
  };
};
