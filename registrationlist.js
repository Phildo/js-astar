var RegistrationList = function(identifier)
{
  var self = this;
  this.identifier = identifier;

  //Be careful with this iterator... (I've gotta clean up this code a bit...)
  var iterator = {};
  iterator.node = self.head;
  iterator.next = function()
  {
    return node.next.content;
  };
  self.getIterator = function()
  {
    iterator.node = self.head;
    return iterator;
  };

  var RNode = function(content)
  {
    var node = this;
    node.prev = null;
    node.next = null;
    node.content = content;

    if(node.content !== null && typeof node.content.RNodeMap === 'undefined')
    {
      Object.defineProperty(node.content, "RNodeMap", {
        enumerable:false,
        configurable:true,
        writable:true,
        value:{}
      });
    }
  };

  this.head = new RNode(null);
  this.tail = new RNode(null);
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
      node.content.RNodeMap[self.identifier] = node;
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
      delete node.content.RNodeMap[self.identifier];
    }

    return node;
  };

  self.register = function(content)
  {
    self.insertNodeAfter(new RNode(content), self.head);
  };

  self.unregister = function(content)
  {
    self.removeNode(content.RNodeMap[self.identifier]);
  };

  self.moveMemberToList = function(content, list)
  {
    list.insertNodeAfter(self.removeNode(content.RNodeMap[self.identifier]), list.head);
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

  self.empty = function()
  {
    var m;
    while(m = self.firstMember())
      self.unregister(m);
  };
};

RegistrationList.prototype.toString = function()
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

var PrioritizedRegistrationList = function(identifier, priorities)
{
  var self = this;
  this.identifier = identifier;
  this.priorities = [];
  for(var i = 0; i < priorities; i++)
    this.priorities[i] = new RegistrationList(identifier+"_PRIORITY_"+i);

  self.register = function(content, priority)
  {
    this.priorities[priority].register(content);
  };

  self.unregister = function(content, priority)
  {
    this.priorities[priority].unregister(content);
  };

  self.moveMemberToList = function(content, priority, list)
  {
    this.priorities[priority].moveMemberToList(content, list);
  };

  self.moveMemberToPrioritizedList = function(content, priority, list, priority)
  {
    this.priorities[priority].unregister(content);
    list.register(content, priority);
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
    return this.priorities[i].firstMember();
  };

  self.empty = function()
  {
    for(var i = 0; i < this.priorities.length; i++)
      this.priorities[i].empty();
  };
};

PrioritizedRegistrationList.prototype.toString = function()
{
  var str = "";
  for(var i = 0; i < this.priorities.length; i++)
    str += this.priorities[i].toString()+",";
  return str;
};

var RecycleRegistrationList = function(identifier, generateFunc, refreshFunc)
{
  var self = this;
  this.identifier = identifier;
  var active = new RegistrationList("RECYCLE_"+identifier+"_ACTIVE");
  var inactive = new RegistrationList("RECYCLE_"+identifier+"_INACTIVE");

  self.generate = generateFunc;
  self.refresh = refreshFunc;

  self.get = function()
  {
    var m;
    if(m = inactive.firstMember())
      inactive.unregister(m);
    else
      m = self.generate();
    self.refresh(m);
    return m;
  };

  self.add = function(m)
  {
    active.register(m);
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

  self.empty = function()
  {
    var m;
    while(m = self.firstMember())
      self.retire(m);
  };
};
