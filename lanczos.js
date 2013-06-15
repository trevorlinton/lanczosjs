function ResizeLanczos(img, dw, lobes) {
	var canvasObj = document.createElement("canvas");
	canvasObj.width = img.width;
	canvasObj.height = img.height;
	var canvasCtx = canvasObj.getContext("2d");
	canvasCtx.drawImage(img,0,0);
	
	var obj = {
		src:canvasCtx.getImageData(0,0,canvasObj.width,canvasObj.height),
		dst:canvasCtx.createImageData(dw,Math.round(canvasObj.height*dw/canvasObj.width)),
		lanczos:function(x) {
			if (x > lobes) return 0;
			x *= Math.PI;
			if (Math.abs(x) < 1e-16) return 1;
			var xx = x / lobes;
			return Math.sin(x) * Math.sin(xx) / x / xx;
		},
		ratio:canvasObj.width / dw,
		rcp_ratio:2 / (canvasObj.width / dw),
		range2:Math.ceil((canvasObj.width / dw) * lobes / 2),
		cacheLanc:{},
		center:{},
		icenter:{},
		process:function(self, u) {
			self.center.x = (u + 0.5) * self.ratio;
			self.icenter.x = Math.floor(self.center.x);
			for (var v = 0; v < self.dst.height; v++) {
				self.center.y = (v + 0.5) * self.ratio;
				self.icenter.y = Math.floor(self.center.y);
				var a=0, r=0, g=0, b=0, z=0;
				for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
					if (i < 0 || i >= self.src.width) continue;
					var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
					if (!self.cacheLanc[f_x]) self.cacheLanc[f_x] = {};
					for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
						if (j < 0 || j >= self.src.height) continue;
						var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
						if (self.cacheLanc[f_x][f_y] == undefined) self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
						z += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y];
						r += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4];
						g += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 1];
						b += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 2];
						a += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 3];
					}
				}
				self.dst.data[(v * self.dst.width + u) * 4] = r / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 1] = g / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 2] = b / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 3] = a / z;
			}
			if (++u < self.dst.width) return self.process(self, u);
			else return self.dst;
		}
	};
	return obj.process(obj,0);
}