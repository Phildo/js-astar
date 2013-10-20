js-astar
========

Javascript implementation of A* search. Works for one/two-way connections in graphs. Calculates path, and only recalculates when the graph changes, or the goal changes. See 'index.html' for example of what it can do, and simple_example.html for a commented simple example of using the API.

API
========

You will need to include 4 files (could all be minified into one in the future... sorry)

    <script type='text/javascript' src='linkedlist.js'></script> //linked list is used by binary tree and graph
    <script type='text/javascript' src='binarytree.js'></script> //binary tree is used by traverser
    <script type='text/javascript' src='graph.js'></script> //graph is used by traverser
    <script type='text/javascript' src='traverser.js'></script>

Create the Graph
========

js-astar works for arbitrary graphs, and you can structure your node objects however you'd like.

First, create a graph object:

    var g = new Graph("IDENTIFIER");

The graph constructor is passed a string identifier. You are responsible for keeping this unique among graphs. The purpose of this is to allow for re-use of nodes in multiple graphs without conflict. (If you only have 1 graph, the string is arbitrary.)

Next, you need to create your node objects. You are in complete control over the content/structure of the nodes.

    //Note- this code has nothing to do with js-astar; it is simply an illustration of creation of arbitrary nodes.
    var nodes = [];
    for(var i = 0; i < 10; i++)
      nodes.push({"myProperty":"whatever","id":Math.random(),"name":"banana_"+i});

Once you have your node objects, you need to add them to the graph

    for(var i = 0; i < nodes.length; i++)
      g.add(nodes[i]);

Now, you must tell the graph which nodes are connected

    g.connectNodeToNode(nodes[0],nodes[1]);
    g.connectNodeToNode(nodes[1],nodes[2]);
    g.connectNodeToNode(nodes[1],nodes[3]);
    g.connectNodeToNode(nodes[1],nodes[4]);
    g.connectNodeToNode(nodes[4],nodes[5]);
    g.connectNodeToNode(nodes[5],nodes[0]);
    g.connectNodeToNode(nodes[5],nodes[6]);
    g.connectNodeToNode(nodes[5],nodes[7]);
    g.connectNodeToNode(nodes[5],nodes[8]);
    g.connectNodeToNode(nodes[7],nodes[8]);
    g.connectNodeToNode(nodes[8],nodes[9]);

*You may notice that a bit of information that is missing is the cost of the edges- this is intentionally left out until the next step to allow for traversals that don't use edge cost in the traditional way.

Set Up the Tuning Algorithms
========

Set up the H function:

    //This function should return the H value for a node, given the goalNode
    //Note- the name is arbitrary, but its signature is not
    var calculateHFromNodeToNode = function(node, goalNode)
    {
      //'node' is the node that will be assigned the H value returned from this function,
      //'goalNode' is the node the A* algorithm is seeking

      //If your graph was a grid, you might simply use the 'manhattan distance' between the two nodes, assuming the 'x' and 'y' properties of a node represent its position (NOTE- again, you would be responsible for constructing the grid appropriately were this the case; in the example above, we did NOT create such a grid, nor do our nodes have the x and y properties, so this would not be appropriate)
      //  return Math.abs(goalNode.x-node.x)+Math.abs(goalNode.y-node.y);

      //Simply return 0 to devolve to djikstra's algorithm.
      return 0;
    }

Set up the G function:

    //This function should return the cost to get to nodeB, given nodeA and the cost to get to nodeA
    //Again- the name is arbitrary, but the signature is not
    //This is where the equivalence of edge-weights comes in.
    var calculateGFromNodeToNode = function(nodeA, g, nodeB)
    {
      //If you have nodes that have a weight to move onto them (ie, mountains cost +5 while plains cost +2), you'd have:
      //  return g+nodeB.cost;

      //If you have a traditional graph where node->node edges have a defined cost, you might query a data structure to return such a cost:
      //  return g+getEdgeCostFromNodeToNode(nodeA,nodeB);

      //If all weights are '1', you would simply have:
      return g+1;
    }

Make the Traversal
========

You will use the traverser to query for the optimal path, one step at a time. 

Create the traverser by passing in all the objects we just set up. Here you will also give it a unique string to allow for multipile simultaneous traversals of the same graph not interfering.

    var traverser = new AStarTraverser(map, calculateHFromNodeToNode, calculateGFromNodeToNode, "TestTraverser");

To query for a path, pass in the start and the goal node, and you will be returned the optimal next step (as a node). 

    var step = traverser.getBestNextStep(start,goal);

The traverser is smart enough to know not to recalculate everything so long as the goal hasn't changed. To get subsequent steps, your code could look like this:

    var step = start;
    while(step != end && (step = traverser.getBestNextStep(step,end)))
      //Take the next step

If something outside of the knowledge of the traverser potentially invalidates the path (an edge breaks, a node was added, a connection was made, etc...), you are responsible for alerting the traverser. This will force a recalculation of the best path.

    traverser.invalidatePath();


