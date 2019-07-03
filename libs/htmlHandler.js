// Arguments:
// div (the element itself)
// init: {x, y, width, height, name, group} (all optional)
function FloatDivCtrl(div, init = {}) {
  this.div = div;
  this.rectangle = {
    x: init.x ? init.x : 0,
    y: init.x ? init.x : 0,
    width: init.x ? init.x : 0,
    height: init.x ? init.x : 0
  };
  this.text = init.text ? init.text : '';
}

FloatDivCtrl.prototype.start = function(x, y, width, height) {
  this.move(x, y);
  this.resize(width, height);
  this.willShow(true);
}

FloatDivCtrl.prototype.textChange = function(newText) {
  this.text = newText;
}

FloatDivCtrl.prototype.move = function(x, y) {
   this.div.style.left = (x+8) + 'px';
   this.div.style.top  = (y+8) + 'px';
   this.rectangle.x = x;
   this.rectangle.y = y;
}

FloatDivCtrl.prototype.resize = function(width, height) {
   this.div.style.width  = width  + 'px';
   this.div.style.height = height + 'px';
   this.rectangle.width = width;
   this.rectangle.height = height;
}

FloatDivCtrl.prototype.isInDiv = function(x, y) {
  return utils.containsPoint(this.rectangle, event.x, event.y);
}

FloatDivCtrl.prototype.willShow = function(isShown) {
   this.div.style.display = isShown ? 'inline' : 'none';
}

FloatDivCtrl.prototype.end = function() {
  this.move(0, 0);
  this.resize(0, 0);
  this.willShow(false);
}
