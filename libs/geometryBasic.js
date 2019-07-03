// ---------- Algebra ----------

function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

function distanceVec2(point1, point2) {
  return Math.sqrt( Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) );
}
