function ImageV2(ctx, path) {
  this.img = new Image();
  this.img.src = path;
  this.ctx = ctx;
}

ImageV2.prototype.drawImage = function (center, size){
  ctx.translate(center.x, center.y);
  ctx.drawImage(this.img, -size.x/1.6, -size.x/1.6);
  ctx.translate(-center.x, -center.y);
}
