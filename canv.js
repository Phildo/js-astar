//Simple package to create a canvas with 'standardized' variables for its canvas and context
var Canv = function(width, height)
{
  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('width',width);
  this.canvas.setAttribute('height',height);
  this.context = this.canvas.getContext('2d');

  this.context.imageSmoothingEnabled = false;
  this.context.webkitImageSmoothingEnabled = false;
}
