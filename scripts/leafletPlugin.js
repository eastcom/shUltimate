/*
* Leaflet Heatmap Overlay
*
* Copyright (c) 2014, Patrick Wied (http://www.patrick-wied.at)
* Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
*/

// Leaflet < 0.8 compatibility
if (typeof L.Layer === 'undefined') {
  L.Layer = L.Class;
}

var HeatmapOverlay = L.Layer.extend({

  initialize: function (config) {
    this.cfg = config;
    this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
    this._data = [];
    this._max = 1;
    this._min = 0;
    this.cfg.container = this._el;
  },

  onAdd: function (map) {
    var size = map.getSize();

    this._map = map;

    this._width = size.x;
    this._height = size.y;

    this._el.style.width = size.x + 'px';
    this._el.style.height = size.y + 'px';

    this._resetOrigin();

    map.getPanes().overlayPane.appendChild(this._el);

    if (!this._heatmap) {
      this._heatmap = h337.create(this.cfg);
    } 

    // on zoom, reset origin
    map.on('viewreset', this._resetOrigin, this);
    // redraw whenever dragend
    map.on('dragend', this._draw, this);

    this._draw();
  },

  onRemove: function (map) {
    // remove layer's DOM elements and listeners
    map.getPanes().overlayPane.removeChild(this._el);

    map.off('viewreset', this._resetOrigin, this);
    map.off('dragend', this._draw, this);
  },
  _draw: function() {
    if (!this._map) { return; }
    
    var point = this._map.latLngToContainerPoint(this._origin);        

    // reposition the layer
    this._el.style[HeatmapOverlay.CSS_TRANSFORM] = 'translate(' +
      -Math.round(point.x) + 'px,' +
      -Math.round(point.y) + 'px)';

    this._update();
  },
  _update: function() {
    var bounds, zoom, scale;

    bounds = this._map.getBounds();
    zoom = this._map.getZoom();
    scale = Math.pow(2, zoom);

    if (this._data.length == 0) {
      return;
    }

    var generatedData = { max: this._max, min: this._min };
    var latLngPoints = [];
    var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
    var localMax = 0;
    var localMin = 0;
    var valueField = this.cfg.valueField;
    var len = this._data.length;
  
    while (len--) {
      var entry = this._data[len];
      var value = entry[valueField];
      var latlng = entry.latlng;


      // we don't wanna render points that are not even on the map ;-)
      if (!bounds.contains(latlng)) {
        continue;
      }
      // local max is the maximum within current bounds
      localMax = Math.max(value, localMax);
      localMin = Math.min(value, localMin);

      var point = this._map.latLngToContainerPoint(latlng);
      var latlngPoint = { x: Math.round(point.x), y: Math.round(point.y) };
      latlngPoint[valueField] = value;

      var radius;

      if (entry.radius) {
        radius = entry.radius * radiusMultiplier;
      } else {
        radius = (this.cfg.radius || 2) * radiusMultiplier;
      }
      latlngPoint.radius = radius;
      latLngPoints.push(latlngPoint);
    }
    if (this.cfg.useLocalExtrema) {
      generatedData.max = localMax;
      generatedData.min = localMin;
    }

    generatedData.data = latLngPoints;

    this._heatmap.setData(generatedData);
  },
  setData: function(data) {
    this._max = data.max || this._max;
    this._min = data.min || this._min;
    var latField = this.cfg.latField || 'lat';
    var lngField = this.cfg.lngField || 'lng';
    var valueField = this.cfg.valueField || 'value';
  
    // transform data to latlngs
    var data = data.data;
    var len = data.length;
    var d = [];
  
    while (len--) {
      var entry = data[len];
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      dataObj[valueField] = entry[valueField];
      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      d.push(dataObj);
    }
    this._data = d;
  
    this._draw();
  },
  // experimential... not ready.
  addData: function(pointOrArray) {
    if (pointOrArray.length > 0) {
      var len = pointOrArray.length;
      while(len--) {
        this.addData(pointOrArray[len]);
      }
    } else {
      var latField = this.cfg.latField || 'lat';
      var lngField = this.cfg.lngField || 'lng';
      var valueField = this.cfg.valueField || 'value';
      var entry = pointOrArray;
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      
      dataObj[valueField] = entry[valueField];
      this._max = Math.max(this._max, dataObj[valueField]);
      this._min = Math.min(this._min, dataObj[valueField]);

      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      this._data.push(dataObj);
      this._draw();
    }
  },
  _resetOrigin: function () {
    this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));
    this._draw();
  } 
});

HeatmapOverlay.CSS_TRANSFORM = (function() {
  var div = document.createElement('div');
  var props = [
  'transform',
  'WebkitTransform',
  'MozTransform',
  'OTransform',
  'msTransform'
  ];

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  return props[0];
})();/*
 Leaflet.draw, a plugin that adds drawing and editing tools to Leaflet powered maps.
 (c) 2012-2013, Jacob Toye, Smartrak

 https://github.com/Leaflet/Leaflet.draw
 http://leafletjs.com
 https://github.com/jacobtoye
 */
!function(t,e){L.drawVersion="0.2.4-dev",L.drawLocal={draw:{toolbar:{actions:{title:"Cancel drawing",text:"Cancel"},undo:{title:"Delete last point drawn",text:"Delete last point"},buttons:{polyline:"Draw a polyline",polygon:"Draw a polygon",rectangle:"Draw a rectangle",circle:"Draw a circle",marker:"Draw a marker"}},handlers:{circle:{tooltip:{start:"Click and drag to draw circle."}},marker:{tooltip:{start:"Click map to place marker."}},polygon:{tooltip:{start:"Click to start drawing shape.",cont:"Click to continue drawing shape.",end:"Click first point to close this shape."}},polyline:{error:"<strong>Error:</strong> shape edges cannot cross!",tooltip:{start:"Click to start drawing line.",cont:"Click to continue drawing line.",end:"Click last point to finish line."}},rectangle:{tooltip:{start:"Click and drag to draw rectangle."}},simpleshape:{tooltip:{end:"Release mouse to finish drawing."}}}},edit:{toolbar:{actions:{save:{title:"Save changes.",text:"Save"},cancel:{title:"Cancel editing, discards all changes.",text:"Cancel"}},buttons:{edit:"Edit layers.",editDisabled:"No layers to edit.",remove:"Delete layers.",removeDisabled:"No layers to delete."}},handlers:{edit:{tooltip:{text:"Drag handles, or marker to edit feature.",subtext:"Click cancel to undo changes."}},remove:{tooltip:{text:"Click on a feature to remove"}}}}},L.Draw={},L.Draw.Feature=L.Handler.extend({includes:L.Mixin.Events,initialize:function(t,e){this._map=t,this._container=t._container,this._overlayPane=t._panes.overlayPane,this._popupPane=t._panes.popupPane,e&&e.shapeOptions&&(e.shapeOptions=L.Util.extend({},this.options.shapeOptions,e.shapeOptions)),L.setOptions(this,e)},enable:function(){this._enabled||(this.fire("enabled",{handler:this.type}),this._map.fire("draw:drawstart",{layerType:this.type}),L.Handler.prototype.enable.call(this))},disable:function(){this._enabled&&(L.Handler.prototype.disable.call(this),this._map.fire("draw:drawstop",{layerType:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(L.DomUtil.disableTextSelection(),t.getContainer().focus(),this._tooltip=new L.Tooltip(this._map),L.DomEvent.on(this._container,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._tooltip.dispose(),this._tooltip=null,L.DomEvent.off(this._container,"keyup",this._cancelDrawing,this))},setOptions:function(t){L.setOptions(this,t)},_fireCreatedEvent:function(t){this._map.fire("draw:created",{layer:t,layerType:this.type})},_cancelDrawing:function(t){27===t.keyCode&&this.disable()}}),L.Draw.Polyline=L.Draw.Feature.extend({statics:{TYPE:"polyline"},Poly:L.Polyline,options:{allowIntersection:!0,repeatMode:!1,drawError:{color:"#b00b00",timeout:2500},icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"}),guidelineDistance:20,maxGuideLineLength:4e3,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0},metric:!0,showLength:!0,zIndexOffset:2e3},initialize:function(t,e){this.options.drawError.message=L.drawLocal.draw.handlers.polyline.error,e&&e.drawError&&(e.drawError=L.Util.extend({},this.options.drawError,e.drawError)),this.type=L.Draw.Polyline.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._tooltip.updateContent(this._getTooltipText()),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("mousedown",this._onMouseDown,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this).on("mouseup",this._onMouseUp,this).on("zoomend",this._onZoomEnd,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._clearHideErrorTimeout(),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._mouseMarker.off("mousedown",this._onMouseDown,this).off("mouseup",this._onMouseUp,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._clearGuides(),this._map.off("mousemove",this._onMouseMove,this).off("zoomend",this._onZoomEnd,this)},deleteLastVertex:function(){if(!(this._markers.length<=1)){var t=this._markers.pop(),e=this._poly,i=this._poly.spliceLatLngs(e.getLatLngs().length-1,1)[0];this._markerGroup.removeLayer(t),e.getLatLngs().length<2&&this._map.removeLayer(e),this._vertexChanged(i,!1)}},addVertex:function(t){var e=this._markers.length;return e>0&&!this.options.allowIntersection&&this._poly.newLatLngIntersects(t)?(this._showErrorTooltip(),void 0):(this._errorShown&&this._hideErrorTooltip(),this._markers.push(this._createMarker(t)),this._poly.addLatLng(t),2===this._poly.getLatLngs().length&&this._map.addLayer(this._poly),this._vertexChanged(t,!0),void 0)},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[0],!0);return!this.options.allowIntersection&&t||!this._shapeIsValid()?(this._showErrorTooltip(),void 0):(this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable(),void 0)},_shapeIsValid:function(){return!0},_onZoomEnd:function(){this._updateGuide()},_onMouseMove:function(t){var e=t.layerPoint,i=t.latlng;this._currentLatLng=i,this._updateTooltip(i),this._updateGuide(e),this._mouseMarker.setLatLng(i),L.DomEvent.preventDefault(t.originalEvent)},_vertexChanged:function(t,e){this._updateFinishHandler(),this._updateRunningMeasure(t,e),this._clearGuides(),this._updateTooltip()},_onMouseDown:function(t){var e=t.originalEvent;this._mouseDownOrigin=L.point(e.clientX,e.clientY)},_onMouseUp:function(e){if(this._mouseDownOrigin){var i=L.point(e.originalEvent.clientX,e.originalEvent.clientY).distanceTo(this._mouseDownOrigin);Math.abs(i)<9*(t.devicePixelRatio||1)&&this.addVertex(e.latlng)}this._mouseDownOrigin=null},_updateFinishHandler:function(){var t=this._markers.length;t>1&&this._markers[t-1].on("click",this._finishShape,this),t>2&&this._markers[t-2].off("click",this._finishShape,this)},_createMarker:function(t){var e=new L.Marker(t,{icon:this.options.icon,zIndexOffset:2*this.options.zIndexOffset});return this._markerGroup.addLayer(e),e},_updateGuide:function(t){var e=this._markers.length;e>0&&(t=t||this._map.latLngToLayerPoint(this._currentLatLng),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[e-1].getLatLng()),t))},_updateTooltip:function(t){var e=this._getTooltipText();t&&this._tooltip.updatePosition(t),this._errorShown||this._tooltip.updateContent(e)},_drawGuide:function(t,e){var i,o,a,s=Math.floor(Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))),r=this.options.guidelineDistance,n=this.options.maxGuideLineLength,l=s>n?s-n:r;for(this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._overlayPane));s>l;l+=this.options.guidelineDistance)i=l/s,o={x:Math.floor(t.x*(1-i)+i*e.x),y:Math.floor(t.y*(1-i)+i*e.y)},a=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),a.style.backgroundColor=this._errorShown?this.options.drawError.color:this.options.shapeOptions.color,L.DomUtil.setPosition(a,o)},_updateGuideColor:function(t){if(this._guidesContainer)for(var e=0,i=this._guidesContainer.childNodes.length;i>e;e++)this._guidesContainer.childNodes[e].style.backgroundColor=t},_clearGuides:function(){if(this._guidesContainer)for(;this._guidesContainer.firstChild;)this._guidesContainer.removeChild(this._guidesContainer.firstChild)},_getTooltipText:function(){var t,e,i=this.options.showLength;return 0===this._markers.length?t={text:L.drawLocal.draw.handlers.polyline.tooltip.start}:(e=i?this._getMeasurementString():"",t=1===this._markers.length?{text:L.drawLocal.draw.handlers.polyline.tooltip.cont,subtext:e}:{text:L.drawLocal.draw.handlers.polyline.tooltip.end,subtext:e}),t},_updateRunningMeasure:function(t,e){var i,o,a=this._markers.length;1===this._markers.length?this._measurementRunningTotal=0:(i=a-(e?2:1),o=t.distanceTo(this._markers[i].getLatLng()),this._measurementRunningTotal+=o*(e?1:-1))},_getMeasurementString:function(){var t,e=this._currentLatLng,i=this._markers[this._markers.length-1].getLatLng();return t=this._measurementRunningTotal+e.distanceTo(i),L.GeometryUtil.readableDistance(t,this.options.metric)},_showErrorTooltip:function(){this._errorShown=!0,this._tooltip.showAsError().updateContent({text:this.options.drawError.message}),this._updateGuideColor(this.options.drawError.color),this._poly.setStyle({color:this.options.drawError.color}),this._clearHideErrorTimeout(),this._hideErrorTimeout=setTimeout(L.Util.bind(this._hideErrorTooltip,this),this.options.drawError.timeout)},_hideErrorTooltip:function(){this._errorShown=!1,this._clearHideErrorTimeout(),this._tooltip.removeError().updateContent(this._getTooltipText()),this._updateGuideColor(this.options.shapeOptions.color),this._poly.setStyle({color:this.options.shapeOptions.color})},_clearHideErrorTimeout:function(){this._hideErrorTimeout&&(clearTimeout(this._hideErrorTimeout),this._hideErrorTimeout=null)},_cleanUpShape:function(){this._markers.length>1&&this._markers[this._markers.length-1].off("click",this._finishShape,this)},_fireCreatedEvent:function(){var t=new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions);L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Polygon=L.Draw.Polyline.extend({statics:{TYPE:"polygon"},Poly:L.Polygon,options:{showArea:!1,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){L.Draw.Polyline.prototype.initialize.call(this,t,e),this.type=L.Draw.Polygon.TYPE},_updateFinishHandler:function(){var t=this._markers.length;1===t&&this._markers[0].on("click",this._finishShape,this),t>2&&(this._markers[t-1].on("dblclick",this._finishShape,this),t>3&&this._markers[t-2].off("dblclick",this._finishShape,this))},_getTooltipText:function(){var t,e;return 0===this._markers.length?t=L.drawLocal.draw.handlers.polygon.tooltip.start:this._markers.length<3?t=L.drawLocal.draw.handlers.polygon.tooltip.cont:(t=L.drawLocal.draw.handlers.polygon.tooltip.end,e=this._getMeasurementString()),{text:t,subtext:e}},_getMeasurementString:function(){var t=this._area;return t?L.GeometryUtil.readableArea(t,this.options.metric):null},_shapeIsValid:function(){return this._markers.length>=3},_vertexChanged:function(t,e){var i;!this.options.allowIntersection&&this.options.showArea&&(i=this._poly.getLatLngs(),this._area=L.GeometryUtil.geodesicArea(i)),L.Draw.Polyline.prototype._vertexChanged.call(this,t,e)},_cleanUpShape:function(){var t=this._markers.length;t>0&&(this._markers[0].off("click",this._finishShape,this),t>2&&this._markers[t-1].off("dblclick",this._finishShape,this))}}),L.SimpleShape={},L.Draw.SimpleShape=L.Draw.Feature.extend({options:{repeatMode:!1},initialize:function(t,e){this._endLabelText=L.drawLocal.draw.handlers.simpleshape.tooltip.end,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._mapDraggable=this._map.dragging.enabled(),this._mapDraggable&&this._map.dragging.disable(),this._container.style.cursor="crosshair",this._tooltip.updateContent({text:this._initialLabelText}),this._map.on("mousedown",this._onMouseDown,this).on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._mapDraggable&&this._map.dragging.enable(),this._container.style.cursor="",this._map.off("mousedown",this._onMouseDown,this).off("mousemove",this._onMouseMove,this),L.DomEvent.off(e,"mouseup",this._onMouseUp,this),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_onMouseDown:function(t){this._isDrawing=!0,this._startLatLng=t.latlng,L.DomEvent.on(e,"mouseup",this._onMouseUp,this).preventDefault(t.originalEvent)},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._isDrawing&&(this._tooltip.updateContent({text:this._endLabelText}),this._drawShape(e))},_onMouseUp:function(){this._shape&&this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()}}),L.Draw.Rectangle=L.Draw.SimpleShape.extend({statics:{TYPE:"rectangle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Rectangle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.rectangle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,t)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Rectangle(this._shape.getBounds(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Circle=L.Draw.SimpleShape.extend({statics:{TYPE:"circle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0},showRadius:!0,metric:!0},initialize:function(t,e){this.type=L.Draw.Circle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.circle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(t)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Circle(this._startLatLng,this._shape.getRadius(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)},_onMouseMove:function(t){var e,i=t.latlng,o=this.options.showRadius,a=this.options.metric;this._tooltip.updatePosition(i),this._isDrawing&&(this._drawShape(i),e=this._shape.getRadius().toFixed(1),this._tooltip.updateContent({text:this._endLabelText,subtext:o?"Radius: "+L.GeometryUtil.readableDistance(e,a):""}))}}),L.Draw.Marker=L.Draw.Feature.extend({statics:{TYPE:"marker"},options:{icon:new L.Icon.Default,repeatMode:!1,zIndexOffset:2e3},initialize:function(t,e){this.type=L.Draw.Marker.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._tooltip.updateContent({text:L.drawLocal.draw.handlers.marker.tooltip.start}),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._marker&&(this._marker.off("click",this._onClick,this),this._map.off("click",this._onClick,this).removeLayer(this._marker),delete this._marker),this._mouseMarker.off("click",this._onClick,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._map.off("mousemove",this._onMouseMove,this))},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._mouseMarker.setLatLng(e),this._marker?(e=this._mouseMarker.getLatLng(),this._marker.setLatLng(e)):(this._marker=new L.Marker(e,{icon:this.options.icon,zIndexOffset:this.options.zIndexOffset}),this._marker.on("click",this._onClick,this),this._map.on("click",this._onClick,this).addLayer(this._marker))},_onClick:function(){this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()},_fireCreatedEvent:function(){var t=new L.Marker(this._marker.getLatLng(),{icon:this.options.icon});L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Edit=L.Edit||{},L.Edit.Poly=L.Handler.extend({options:{icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"})},initialize:function(t,e){this._poly=t,L.setOptions(this,e)},addHooks:function(){this._poly._map&&(this._markerGroup||this._initMarkers(),this._poly._map.addLayer(this._markerGroup))},removeHooks:function(){this._poly._map&&(this._poly._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers)},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._markers=[];var t,e,i,o,a=this._poly._latlngs;for(t=0,i=a.length;i>t;t++)o=this._createMarker(a[t],t),o.on("click",this._onMarkerClick,this),this._markers.push(o);var s,r;for(t=0,e=i-1;i>t;e=t++)(0!==t||L.Polygon&&this._poly instanceof L.Polygon)&&(s=this._markers[e],r=this._markers[t],this._createMiddleMarker(s,r),this._updatePrevNext(s,r))},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:this.options.icon});return i._origLatLng=t,i._index=e,i.on("drag",this._onMarkerDrag,this),i.on("dragend",this._fireEdit,this),this._markerGroup.addLayer(i),i},_removeMarker:function(t){var e=t._index;this._markerGroup.removeLayer(t),this._markers.splice(e,1),this._poly.spliceLatLngs(e,1),this._updateIndexes(e,-1),t.off("drag",this._onMarkerDrag,this).off("dragend",this._fireEdit,this).off("click",this._onMarkerClick,this)},_fireEdit:function(){this._poly.edited=!0,this._poly.fire("edit")},_onMarkerDrag:function(t){var e=t.target;L.extend(e._origLatLng,e._latlng),e._middleLeft&&e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev,e)),e._middleRight&&e._middleRight.setLatLng(this._getMiddleLatLng(e,e._next)),this._poly.redraw()},_onMarkerClick:function(t){var e=L.Polygon&&this._poly instanceof L.Polygon?4:3,i=t.target;this._poly._latlngs.length<e||(this._removeMarker(i),this._updatePrevNext(i._prev,i._next),i._middleLeft&&this._markerGroup.removeLayer(i._middleLeft),i._middleRight&&this._markerGroup.removeLayer(i._middleRight),i._prev&&i._next?this._createMiddleMarker(i._prev,i._next):i._prev?i._next||(i._prev._middleRight=null):i._next._middleLeft=null,this._fireEdit())},_updateIndexes:function(t,e){this._markerGroup.eachLayer(function(i){i._index>t&&(i._index+=e)})},_createMiddleMarker:function(t,e){var i,o,a,s=this._getMiddleLatLng(t,e),r=this._createMarker(s);r.setOpacity(.6),t._middleRight=e._middleLeft=r,o=function(){var o=e._index;r._index=o,r.off("click",i,this).on("click",this._onMarkerClick,this),s.lat=r.getLatLng().lat,s.lng=r.getLatLng().lng,this._poly.spliceLatLngs(o,0,s),this._markers.splice(o,0,r),r.setOpacity(1),this._updateIndexes(o,1),e._index++,this._updatePrevNext(t,r),this._updatePrevNext(r,e),this._poly.fire("editstart")},a=function(){r.off("dragstart",o,this),r.off("dragend",a,this),this._createMiddleMarker(t,r),this._createMiddleMarker(r,e)},i=function(){o.call(this),a.call(this),this._fireEdit()},r.on("click",i,this).on("dragstart",o,this).on("dragend",a,this),this._markerGroup.addLayer(r)},_updatePrevNext:function(t,e){t&&(t._next=e),e&&(e._prev=t)},_getMiddleLatLng:function(t,e){var i=this._poly._map,o=i.project(t.getLatLng()),a=i.project(e.getLatLng());return i.unproject(o._add(a)._divideBy(2))}}),L.Polyline.addInitHook(function(){this.editing||(L.Edit.Poly&&(this.editing=new L.Edit.Poly(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()}))}),L.Edit=L.Edit||{},L.Edit.SimpleShape=L.Handler.extend({options:{moveIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move"}),resizeIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"})},initialize:function(t,e){this._shape=t,L.Util.setOptions(this,e)},addHooks:function(){this._shape._map&&(this._map=this._shape._map,this._markerGroup||this._initMarkers(),this._map.addLayer(this._markerGroup))},removeHooks:function(){if(this._shape._map){this._unbindMarker(this._moveMarker);for(var t=0,e=this._resizeMarkers.length;e>t;t++)this._unbindMarker(this._resizeMarkers[t]);this._resizeMarkers=null,this._map.removeLayer(this._markerGroup),delete this._markerGroup}this._map=null},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._createMoveMarker(),this._createResizeMarker()},_createMoveMarker:function(){},_createResizeMarker:function(){},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:e,zIndexOffset:10});return this._bindMarker(i),this._markerGroup.addLayer(i),i},_bindMarker:function(t){t.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._onMarkerDragEnd,this)},_unbindMarker:function(t){t.off("dragstart",this._onMarkerDragStart,this).off("drag",this._onMarkerDrag,this).off("dragend",this._onMarkerDragEnd,this)},_onMarkerDragStart:function(t){var e=t.target;e.setOpacity(0),this._shape.fire("editstart")},_fireEdit:function(){this._shape.edited=!0,this._shape.fire("edit")},_onMarkerDrag:function(t){var e=t.target,i=e.getLatLng();e===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw()},_onMarkerDragEnd:function(t){var e=t.target;e.setOpacity(1),this._fireEdit()},_move:function(){},_resize:function(){}}),L.Edit=L.Edit||{},L.Edit.Rectangle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getBounds(),e=t.getCenter();this._moveMarker=this._createMarker(e,this.options.moveIcon)},_createResizeMarker:function(){var t=this._getCorners();this._resizeMarkers=[];for(var e=0,i=t.length;i>e;e++)this._resizeMarkers.push(this._createMarker(t[e],this.options.resizeIcon)),this._resizeMarkers[e]._cornerIndex=e},_onMarkerDragStart:function(t){L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this,t);var e=this._getCorners(),i=t.target,o=i._cornerIndex;this._oppositeCorner=e[(o+2)%4],this._toggleCornerMarkers(0,o)},_onMarkerDragEnd:function(t){var e,i,o=t.target;o===this._moveMarker&&(e=this._shape.getBounds(),i=e.getCenter(),o.setLatLng(i)),this._toggleCornerMarkers(1),this._repositionCornerMarkers(),L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this,t)},_move:function(t){for(var e,i=this._shape.getLatLngs(),o=this._shape.getBounds(),a=o.getCenter(),s=[],r=0,n=i.length;n>r;r++)e=[i[r].lat-a.lat,i[r].lng-a.lng],s.push([t.lat+e[0],t.lng+e[1]]);this._shape.setLatLngs(s),this._repositionCornerMarkers()},_resize:function(t){var e;this._shape.setBounds(L.latLngBounds(t,this._oppositeCorner)),e=this._shape.getBounds(),this._moveMarker.setLatLng(e.getCenter())},_getCorners:function(){var t=this._shape.getBounds(),e=t.getNorthWest(),i=t.getNorthEast(),o=t.getSouthEast(),a=t.getSouthWest();return[e,i,o,a]},_toggleCornerMarkers:function(t){for(var e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setOpacity(t)},_repositionCornerMarkers:function(){for(var t=this._getCorners(),e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setLatLng(t[e])}}),L.Rectangle.addInitHook(function(){L.Edit.Rectangle&&(this.editing=new L.Edit.Rectangle(this),this.options.editable&&this.editing.enable())}),L.Edit=L.Edit||{},L.Edit.Circle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getLatLng();this._moveMarker=this._createMarker(t,this.options.moveIcon)},_createResizeMarker:function(){var t=this._shape.getLatLng(),e=this._getResizeMarkerPoint(t);this._resizeMarkers=[],this._resizeMarkers.push(this._createMarker(e,this.options.resizeIcon))},_getResizeMarkerPoint:function(t){var e=this._shape._radius*Math.cos(Math.PI/4),i=this._map.project(t);return this._map.unproject([i.x+e,i.y-e])},_move:function(t){var e=this._getResizeMarkerPoint(t);this._resizeMarkers[0].setLatLng(e),this._shape.setLatLng(t)},_resize:function(t){var e=this._moveMarker.getLatLng(),i=e.distanceTo(t);this._shape.setRadius(i)}}),L.Circle.addInitHook(function(){L.Edit.Circle&&(this.editing=new L.Edit.Circle(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()})}),L.LatLngUtil={cloneLatLngs:function(t){for(var e=[],i=0,o=t.length;o>i;i++)e.push(this.cloneLatLng(t[i]));return e},cloneLatLng:function(t){return L.latLng(t.lat,t.lng)}},L.GeometryUtil=L.extend(L.GeometryUtil||{},{geodesicArea:function(t){var e,i,o=t.length,a=0,s=L.LatLng.DEG_TO_RAD;if(o>2){for(var r=0;o>r;r++)e=t[r],i=t[(r+1)%o],a+=(i.lng-e.lng)*s*(2+Math.sin(e.lat*s)+Math.sin(i.lat*s));a=6378137*a*6378137/2}return Math.abs(a)},readableArea:function(t,e){var i;return e?i=t>=1e4?(1e-4*t).toFixed(2)+" ha":t.toFixed(2)+" m&sup2;":(t*=.836127,i=t>=3097600?(t/3097600).toFixed(2)+" mi&sup2;":t>=4840?(t/4840).toFixed(2)+" acres":Math.ceil(t)+" yd&sup2;"),i},readableDistance:function(t,e){var i;return e?i=t>1e3?(t/1e3).toFixed(2)+" km":Math.ceil(t)+" m":(t*=1.09361,i=t>1760?(t/1760).toFixed(2)+" miles":Math.ceil(t)+" yd"),i}}),L.Util.extend(L.LineUtil,{segmentsIntersect:function(t,e,i,o){return this._checkCounterclockwise(t,i,o)!==this._checkCounterclockwise(e,i,o)&&this._checkCounterclockwise(t,e,i)!==this._checkCounterclockwise(t,e,o)},_checkCounterclockwise:function(t,e,i){return(i.y-t.y)*(e.x-t.x)>(e.y-t.y)*(i.x-t.x)}}),L.Polyline.include({intersects:function(){var t,e,i,o=this._originalPoints,a=o?o.length:0;if(this._tooFewPointsForIntersection())return!1;for(t=a-1;t>=3;t--)if(e=o[t-1],i=o[t],this._lineSegmentsIntersectsRange(e,i,t-2))return!0;return!1},newLatLngIntersects:function(t,e){return this._map?this.newPointIntersects(this._map.latLngToLayerPoint(t),e):!1},newPointIntersects:function(t,e){var i=this._originalPoints,o=i?i.length:0,a=i?i[o-1]:null,s=o-2;return this._tooFewPointsForIntersection(1)?!1:this._lineSegmentsIntersectsRange(a,t,s,e?1:0)},_tooFewPointsForIntersection:function(t){var e=this._originalPoints,i=e?e.length:0;return i+=t||0,!this._originalPoints||3>=i},_lineSegmentsIntersectsRange:function(t,e,i,o){var a,s,r=this._originalPoints;o=o||0;for(var n=i;n>o;n--)if(a=r[n-1],s=r[n],L.LineUtil.segmentsIntersect(t,e,a,s))return!0;return!1}}),L.Polygon.include({intersects:function(){var t,e,i,o,a,s=this._originalPoints;return this._tooFewPointsForIntersection()?!1:(t=L.Polyline.prototype.intersects.call(this))?!0:(e=s.length,i=s[0],o=s[e-1],a=e-2,this._lineSegmentsIntersectsRange(o,i,a,1))}}),L.Control.Draw=L.Control.extend({options:{position:"topleft",draw:{},edit:!1},initialize:function(t){if(L.version<"0.7")throw new Error("Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/");L.Control.prototype.initialize.call(this,t);var e,i;this._toolbars={},L.DrawToolbar&&this.options.draw&&(i=new L.DrawToolbar(this.options.draw),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this)),L.EditToolbar&&this.options.edit&&(i=new L.EditToolbar(this.options.edit),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this))},onAdd:function(t){var e,i=L.DomUtil.create("div","leaflet-draw"),o=!1,a="leaflet-draw-toolbar-top";for(var s in this._toolbars)this._toolbars.hasOwnProperty(s)&&(e=this._toolbars[s].addToolbar(t),e&&(o||(L.DomUtil.hasClass(e,a)||L.DomUtil.addClass(e.childNodes[0],a),o=!0),i.appendChild(e)));return i},onRemove:function(){for(var t in this._toolbars)this._toolbars.hasOwnProperty(t)&&this._toolbars[t].removeToolbar()},setDrawingOptions:function(t){for(var e in this._toolbars)this._toolbars[e]instanceof L.DrawToolbar&&this._toolbars[e].setOptions(t)},_toolbarEnabled:function(t){var e=""+L.stamp(t.target);for(var i in this._toolbars)this._toolbars.hasOwnProperty(i)&&i!==e&&this._toolbars[i].disable()}}),L.Map.mergeOptions({drawControlTooltips:!0,drawControl:!1}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))}),L.Toolbar=L.Class.extend({includes:[L.Mixin.Events],initialize:function(t){L.setOptions(this,t),this._modes={},this._actionButtons=[],this._activeMode=null},enabled:function(){return null!==this._activeMode},disable:function(){this.enabled()&&this._activeMode.handler.disable()},addToolbar:function(t){var e,i=L.DomUtil.create("div","leaflet-draw-section"),o=0,a=this._toolbarClass||"",s=this.getModeHandlers(t);for(this._toolbarContainer=L.DomUtil.create("div","leaflet-draw-toolbar leaflet-bar"),this._map=t,e=0;e<s.length;e++)s[e].enabled&&this._initModeHandler(s[e].handler,this._toolbarContainer,o++,a,s[e].title);return o?(this._lastButtonIndex=--o,this._actionsContainer=L.DomUtil.create("ul","leaflet-draw-actions"),i.appendChild(this._toolbarContainer),i.appendChild(this._actionsContainer),i):void 0},removeToolbar:function(){for(var t in this._modes)this._modes.hasOwnProperty(t)&&(this._disposeButton(this._modes[t].button,this._modes[t].handler.enable,this._modes[t].handler),this._modes[t].handler.disable(),this._modes[t].handler.off("enabled",this._handlerActivated,this).off("disabled",this._handlerDeactivated,this));this._modes={};for(var e=0,i=this._actionButtons.length;i>e;e++)this._disposeButton(this._actionButtons[e].button,this._actionButtons[e].callback,this);this._actionButtons=[],this._actionsContainer=null},_initModeHandler:function(t,e,i,o,a){var s=t.type;this._modes[s]={},this._modes[s].handler=t,this._modes[s].button=this._createButton({title:a,className:o+"-"+s,container:e,callback:this._modes[s].handler.enable,context:this._modes[s].handler}),this._modes[s].buttonIndex=i,this._modes[s].handler.on("enabled",this._handlerActivated,this).on("disabled",this._handlerDeactivated,this)},_createButton:function(t){var e=L.DomUtil.create("a",t.className||"",t.container);return e.href="#",t.text&&(e.innerHTML=t.text),t.title&&(e.title=t.title),L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"mousedown",L.DomEvent.stopPropagation).on(e,"dblclick",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",t.callback,t.context),e},_disposeButton:function(t,e){L.DomEvent.off(t,"click",L.DomEvent.stopPropagation).off(t,"mousedown",L.DomEvent.stopPropagation).off(t,"dblclick",L.DomEvent.stopPropagation).off(t,"click",L.DomEvent.preventDefault).off(t,"click",e)},_handlerActivated:function(t){this.disable(),this._activeMode=this._modes[t.handler],L.DomUtil.addClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._showActionsToolbar(),this.fire("enable")},_handlerDeactivated:function(){this._hideActionsToolbar(),L.DomUtil.removeClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._activeMode=null,this.fire("disable")},_createActions:function(t){var e,i,o,a,s=this._actionsContainer,r=this.getActions(t),n=r.length;for(i=0,o=this._actionButtons.length;o>i;i++)this._disposeButton(this._actionButtons[i].button,this._actionButtons[i].callback);for(this._actionButtons=[];s.firstChild;)s.removeChild(s.firstChild);for(var l=0;n>l;l++)"enabled"in r[l]&&!r[l].enabled||(e=L.DomUtil.create("li","",s),a=this._createButton({title:r[l].title,text:r[l].text,container:e,callback:r[l].callback,context:r[l].context}),this._actionButtons.push({button:a,callback:r[l].callback}))},_showActionsToolbar:function(){var t=this._activeMode.buttonIndex,e=this._lastButtonIndex,i=this._activeMode.button.offsetTop-1;this._createActions(this._activeMode.handler),this._actionsContainer.style.top=i+"px",0===t&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-top")),t===e&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-bottom")),this._actionsContainer.style.display="block"
},_hideActionsToolbar:function(){this._actionsContainer.style.display="none",L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-top"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-bottom")}}),L.Tooltip=L.Class.extend({initialize:function(t){this._map=t,this._popupPane=t._panes.popupPane,this._container=t.options.drawControlTooltips?L.DomUtil.create("div","leaflet-draw-tooltip",this._popupPane):null,this._singleLineLabel=!1},dispose:function(){this._container&&(this._popupPane.removeChild(this._container),this._container=null)},updateContent:function(t){return this._container?(t.subtext=t.subtext||"",0!==t.subtext.length||this._singleLineLabel?t.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!1):(L.DomUtil.addClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!0),this._container.innerHTML=(t.subtext.length>0?'<span class="leaflet-draw-tooltip-subtext">'+t.subtext+"</span><br />":"")+"<span>"+t.text+"</span>",this):this},updatePosition:function(t){var e=this._map.latLngToLayerPoint(t),i=this._container;return this._container&&(i.style.visibility="inherit",L.DomUtil.setPosition(i,e)),this},showAsError:function(){return this._container&&L.DomUtil.addClass(this._container,"leaflet-error-draw-tooltip"),this},removeError:function(){return this._container&&L.DomUtil.removeClass(this._container,"leaflet-error-draw-tooltip"),this}}),L.DrawToolbar=L.Toolbar.extend({options:{polyline:{},polygon:{},rectangle:{},circle:{},marker:{}},initialize:function(t){for(var e in this.options)this.options.hasOwnProperty(e)&&t[e]&&(t[e]=L.extend({},this.options[e],t[e]));this._toolbarClass="leaflet-draw-draw",L.Toolbar.prototype.initialize.call(this,t)},getModeHandlers:function(t){return[{enabled:this.options.polyline,handler:new L.Draw.Polyline(t,this.options.polyline),title:L.drawLocal.draw.toolbar.buttons.polyline},{enabled:this.options.polygon,handler:new L.Draw.Polygon(t,this.options.polygon),title:L.drawLocal.draw.toolbar.buttons.polygon},{enabled:this.options.rectangle,handler:new L.Draw.Rectangle(t,this.options.rectangle),title:L.drawLocal.draw.toolbar.buttons.rectangle},{enabled:this.options.circle,handler:new L.Draw.Circle(t,this.options.circle),title:L.drawLocal.draw.toolbar.buttons.circle},{enabled:this.options.marker,handler:new L.Draw.Marker(t,this.options.marker),title:L.drawLocal.draw.toolbar.buttons.marker}]},getActions:function(t){return[{enabled:t.deleteLastVertex,title:L.drawLocal.draw.toolbar.undo.title,text:L.drawLocal.draw.toolbar.undo.text,callback:t.deleteLastVertex,context:t},{title:L.drawLocal.draw.toolbar.actions.title,text:L.drawLocal.draw.toolbar.actions.text,callback:this.disable,context:this}]},setOptions:function(t){L.setOptions(this,t);for(var e in this._modes)this._modes.hasOwnProperty(e)&&t.hasOwnProperty(e)&&this._modes[e].handler.setOptions(t[e])}}),L.EditToolbar=L.Toolbar.extend({options:{edit:{selectedPathOptions:{color:"#fe57a1",opacity:.6,dashArray:"10, 10",fill:!0,fillColor:"#fe57a1",fillOpacity:.1}},remove:{},featureGroup:null},initialize:function(t){t.edit&&("undefined"==typeof t.edit.selectedPathOptions&&(t.edit.selectedPathOptions=this.options.edit.selectedPathOptions),t.edit=L.extend({},this.options.edit,t.edit)),t.remove&&(t.remove=L.extend({},this.options.remove,t.remove)),this._toolbarClass="leaflet-draw-edit",L.Toolbar.prototype.initialize.call(this,t),this._selectedFeatureCount=0},getModeHandlers:function(t){var e=this.options.featureGroup;return[{enabled:this.options.edit,handler:new L.EditToolbar.Edit(t,{featureGroup:e,selectedPathOptions:this.options.edit.selectedPathOptions}),title:L.drawLocal.edit.toolbar.buttons.edit},{enabled:this.options.remove,handler:new L.EditToolbar.Delete(t,{featureGroup:e}),title:L.drawLocal.edit.toolbar.buttons.remove}]},getActions:function(){return[{title:L.drawLocal.edit.toolbar.actions.save.title,text:L.drawLocal.edit.toolbar.actions.save.text,callback:this._save,context:this},{title:L.drawLocal.edit.toolbar.actions.cancel.title,text:L.drawLocal.edit.toolbar.actions.cancel.text,callback:this.disable,context:this}]},addToolbar:function(t){var e=L.Toolbar.prototype.addToolbar.call(this,t);return this._checkDisabled(),this.options.featureGroup.on("layeradd layerremove",this._checkDisabled,this),e},removeToolbar:function(){this.options.featureGroup.off("layeradd layerremove",this._checkDisabled,this),L.Toolbar.prototype.removeToolbar.call(this)},disable:function(){this.enabled()&&(this._activeMode.handler.revertLayers(),L.Toolbar.prototype.disable.call(this))},_save:function(){this._activeMode.handler.save(),this._activeMode.handler.disable()},_checkDisabled:function(){var t,e=this.options.featureGroup,i=0!==e.getLayers().length;this.options.edit&&(t=this._modes[L.EditToolbar.Edit.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.edit:L.drawLocal.edit.toolbar.buttons.editDisabled)),this.options.remove&&(t=this._modes[L.EditToolbar.Delete.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.remove:L.drawLocal.edit.toolbar.buttons.removeDisabled))}}),L.EditToolbar.Edit=L.Handler.extend({statics:{TYPE:"edit"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),this._selectedPathOptions=e.selectedPathOptions,this._featureGroup=e.featureGroup,!(this._featureGroup instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this._uneditedLayerProps={},this.type=L.EditToolbar.Edit.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:editstart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._featureGroup.on("layeradd",this._enableLayerEdit,this).on("layerremove",this._disableLayerEdit,this))},disable:function(){this._enabled&&(this._featureGroup.off("layeradd",this._enableLayerEdit,this).off("layerremove",this._disableLayerEdit,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:editstop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._featureGroup.eachLayer(this._enableLayerEdit,this),this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.edit.tooltip.text,subtext:L.drawLocal.edit.handlers.edit.tooltip.subtext}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._featureGroup.eachLayer(this._disableLayerEdit,this),this._uneditedLayerProps={},this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._featureGroup.eachLayer(function(t){this._revertLayer(t)},this)},save:function(){var t=new L.LayerGroup;this._featureGroup.eachLayer(function(e){e.edited&&(t.addLayer(e),e.edited=!1)}),this._map.fire("draw:edited",{layers:t})},_backupLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps[e]||(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?this._uneditedLayerProps[e]={latlngs:L.LatLngUtil.cloneLatLngs(t.getLatLngs())}:t instanceof L.Circle?this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng()),radius:t.getRadius()}:t instanceof L.Marker&&(this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng())}))},_revertLayer:function(t){var e=L.Util.stamp(t);t.edited=!1,this._uneditedLayerProps.hasOwnProperty(e)&&(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?t.setLatLngs(this._uneditedLayerProps[e].latlngs):t instanceof L.Circle?(t.setLatLng(this._uneditedLayerProps[e].latlng),t.setRadius(this._uneditedLayerProps[e].radius)):t instanceof L.Marker&&t.setLatLng(this._uneditedLayerProps[e].latlng))},_toggleMarkerHighlight:function(t){if(t._icon){var e=t._icon;e.style.display="none",L.DomUtil.hasClass(e,"leaflet-edit-marker-selected")?(L.DomUtil.removeClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,-4)):(L.DomUtil.addClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,4)),e.style.display=""}},_offsetMarker:function(t,e){var i=parseInt(t.style.marginTop,10)-e,o=parseInt(t.style.marginLeft,10)-e;t.style.marginTop=i+"px",t.style.marginLeft=o+"px"},_enableLayerEdit:function(t){var e,i=t.layer||t.target||t,o=i instanceof L.Marker;(!o||i._icon)&&(this._backupLayer(i),this._selectedPathOptions&&(e=L.Util.extend({},this._selectedPathOptions),o?this._toggleMarkerHighlight(i):(i.options.previousOptions=L.Util.extend({dashArray:null},i.options),i instanceof L.Circle||i instanceof L.Polygon||i instanceof L.Rectangle||(e.fill=!1),i.setStyle(e))),o?(i.dragging.enable(),i.on("dragend",this._onMarkerDragEnd)):i.editing.enable())},_disableLayerEdit:function(t){var e=t.layer||t.target||t;e.edited=!1,this._selectedPathOptions&&(e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.setStyle(e.options.previousOptions),delete e.options.previousOptions)),e instanceof L.Marker?(e.dragging.disable(),e.off("dragend",this._onMarkerDragEnd,this)):e.editing.disable()},_onMarkerDragEnd:function(t){var e=t.target;e.edited=!0},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_hasAvailableLayers:function(){return 0!==this._featureGroup.getLayers().length}}),L.EditToolbar.Delete=L.Handler.extend({statics:{TYPE:"remove"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.Util.setOptions(this,e),this._deletableLayers=this.options.featureGroup,!(this._deletableLayers instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this.type=L.EditToolbar.Delete.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:deletestart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._deletableLayers.on("layeradd",this._enableLayerDelete,this).on("layerremove",this._disableLayerDelete,this))},disable:function(){this._enabled&&(this._deletableLayers.off("layeradd",this._enableLayerDelete,this).off("layerremove",this._disableLayerDelete,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:deletestop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._deletableLayers.eachLayer(this._enableLayerDelete,this),this._deletedLayers=new L.layerGroup,this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.remove.tooltip.text}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._disableLayerDelete,this),this._deletedLayers=null,this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._deletedLayers.eachLayer(function(t){this._deletableLayers.addLayer(t)},this)},save:function(){this._map.fire("draw:deleted",{layers:this._deletedLayers})},_enableLayerDelete:function(t){var e=t.layer||t.target||t;e.on("click",this._removeLayer,this)},_disableLayerDelete:function(t){var e=t.layer||t.target||t;e.off("click",this._removeLayer,this),this._deletedLayers.removeLayer(e)},_removeLayer:function(t){var e=t.layer||t.target||t;this._deletableLayers.removeLayer(e),this._deletedLayers.addLayer(e)},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_hasAvailableLayers:function(){return 0!==this._deletableLayers.getLayers().length}})}(window,document);(function() {

L.Control.Search = L.Control.extend({
	includes: L.Mixin.Events,
	//
	//	Name					Data passed			   Description
	//
	//Managed Events:
	//	search_locationfound	{latlng, title, layer} fired after moved and show markerLocation
	//  search_collapsed		{}					   fired after control was collapsed
	//
	//Public methods:
	//  setLayer()				L.LayerGroup()         set layer search at runtime
	//  showAlert()             'Text message'         Show alert message
	//
	options: {
		wrapper: '',				//container id to insert Search Control
		url: '',					//url for search by ajax request, ex: "search.php?q={s}". Can be function that returns string for dynamic parameter setting
		jsonpParam: null,			//jsonp param name for search by jsonp service, ex: "callback"
		layer: null,				//layer where search markers(is a L.LayerGroup)		
		callData: null,				//function that fill _recordsCache, passed searching text by first param and callback in second
		//TODO important! implements uniq option 'sourceData' that recognizes source type: url,array,callback or layer		
		//TODO implement can do research on multiple sources
		propertyName: 'title',		//property in marker.options(or feature.properties for vector layer) trough filter elements in layer,
		propertyLoc: 'loc',			//field for remapping location, using array: ['latname','lonname'] for select double fields(ex. ['lat','lon'] )
									// support dotted format: 'prop.subprop.title'
		callTip: null,				//function that return row tip html node(or html string), receive text tooltip in first param
		filterJSON: null,			//callback for filtering data to _recordsCache
		minLength: 1,				//minimal text length for autocomplete
		initial: true,				//search elements only by initial text
		autoType: true,				//complete input with first suggested result and select this filled-in text.
		delayType: 400,				//delay while typing for show tooltip
		tooltipLimit: -1,			//limit max results to show in tooltip. -1 for no limit.
		tipAutoSubmit: true,  		//auto map panTo when click on tooltip
		autoResize: true,			//autoresize on input change
		collapsed: true,			//collapse search control at startup
		autoCollapse: false,		//collapse search control after submit(on button or on tips if enabled tipAutoSubmit)
		//TODO add option for persist markerLoc after collapse!
		autoCollapseTime: 1200,		//delay for autoclosing alert and collapse after blur
		zoom: null,					//zoom after pan to location found, default: map.getZoom()
		text: 'Search...',			//placeholder value	
		textCancel: 'Cancel',		//title in cancel button
		textErr: 'Location not found',	//error message
		position: 'topleft',
		animateLocation: true,		//animate a circle over location found
		circleLocation: true,		//draw a circle in location found
		markerLocation: false,		//draw a marker in location found
		markerIcon: new L.Icon.Default()//custom icon for maker location
	},
//FIXME option condition problem {autoCollapse: true, markerLocation: true} not show location
//FIXME option condition problem {autoCollapse: false }
//
//TODO important optimization!!! always append data in this._recordsCache
//  now _recordsCache content is emptied and replaced with new data founded
//  always appending data on _recordsCache give the possibility of caching ajax, jsonp and layersearch!
//
//TODO here insert function that search inputText FIRST in _recordsCache keys and if not find results.. 
//  run one of callbacks search(callData,jsonpUrl or options.layer) and run this.showTooltip
//
//TODO change structure of _recordsCache
//	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
//	in this mode every record can have a free structure of attributes, only 'loc' is required
	
	initialize: function(options) {
		L.Util.setOptions(this, options || {});
		this._inputMinSize = this.options.text ? this.options.text.length : 10;
		this._layer = this.options.layer || new L.LayerGroup();
		this._filterJSON = this.options.filterJSON || this._defaultFilterJSON;
		this._autoTypeTmp = this.options.autoType;	//useful for disable autoType temporarily in delete/backspace keydown
		this._countertips = 0;		//number of tips items
		this._recordsCache = {};	//key,value table! that store locations! format: key,latlng
		this._curReq = null;
	},

	onAdd: function (map) {
		this._map = map;
		this._container = L.DomUtil.create('div', 'leaflet-control-search');
		this._input = this._createInput(this.options.text, 'search-input');
		this._tooltip = this._createTooltip('search-tooltip');
		this._cancel = this._createCancel(this.options.textCancel, 'search-cancel');
		this._button = this._createButton(this.options.text, 'search-button');
		this._alert = this._createAlert('search-alert');

		if(this.options.collapsed===false)
			this.expand(this.options.collapsed);

		if(this.options.circleLocation || this.options.markerLocation || this.options.markerIcon){
            this._markerLoc = new SearchMarker([0,0], {
                showCircle: this.options.circleLocation,
                showMarker: this.options.markerLocation,
                icon: this.options.markerIcon
            }).addTo(this._map);//这儿做过修改，把后来绘制的图标添加到地图，而非默认的图层
        }
		
		this.setLayer( this._layer );
		 map.on({
		// 		'layeradd': this._onLayerAddRemove,
		// 		'layerremove': this._onLayerAddRemove
		     'resize': this._handleAutoresize
		 	}, this);
		return this._container;
	},
	addTo: function (map) {

		if(this.options.wrapper) {
			this._container = this.onAdd(map);
			this._wrapper = L.DomUtil.get(this.options.wrapper);
			this._wrapper.style.position = 'relative';
			this._wrapper.appendChild(this._container);
		}
		else
			L.Control.prototype.addTo.call(this, map);

		return this;
	},

	onRemove: function(map) {
		this._recordsCache = {};
		// map.off({
		// 		'layeradd': this._onLayerAddRemove,
		// 		'layerremove': this._onLayerAddRemove
		// 	}, this);
	},

	// _onLayerAddRemove: function(e) {
	// 	//console.info('_onLayerAddRemove');
	// 	//without this, run setLayer also for each Markers!! to optimize!
	// 	if(e.layer instanceof L.LayerGroup)
	// 		if( L.stamp(e.layer) != L.stamp(this._layer) )
	// 			this.setLayer(e.layer);
	// },

	_getPath: function(obj, prop) {
		var parts = prop.split('.'),
			last = parts.pop(),
			len = parts.length,
			cur = parts[0],
			i = 1;

		if(len > 0)
			while((obj = obj[cur]) && i < len)
				cur = parts[i++];

		if(obj)
			return obj[last];
	},

	setLayer: function(layer) {	//set search layer at runtime
		//this.options.layer = layer; //setting this, run only this._recordsFromLayer()
		this._layer = layer;
		//this._layer.addTo(this._map);//是否在最初把图标添加到地图上
		if(this._markerLoc)
			this._layer.addLayer(this._markerLoc);
		return this;
	},
	
	showAlert: function(text) {
		text = text || this.options.textErr;
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		clearTimeout(this.timerAlert);
		var that = this;		
		this.timerAlert = setTimeout(function() {
			that.hideAlert();
		},this.options.autoCollapseTime);
		return this;
	},
	
	hideAlert: function() {
		this._alert.style.display = 'none';
		return this;
	},
		
	cancel: function() {
		this._input.value = '';
		this._handleKeypress({keyCode:8});//simulate backspace keypress
		this._input.size = this._inputMinSize;
		this._input.focus();
		this._cancel.style.display = 'none';
		return this;
	},
	
	expand: function(toggle) {
		toggle = toggle || true;
		this._input.style.display = 'block';
		L.DomUtil.addClass(this._container, 'search-exp');
		if ( toggle != false ) {
			this._input.focus();
			this._map.on('dragstart click', this.collapse, this);
		}
		return this;	
	},

	collapse: function() {
		this._hideTooltip();
		this.cancel();
		this._alert.style.display = 'none';
		this._input.blur();
		if(this.options.collapsed)
		{
			this._input.style.display = 'none';
			this._cancel.style.display = 'none';			
			L.DomUtil.removeClass(this._container, 'search-exp');		
			//this._markerLoc.hide();//maybe unuseful
			this._map.off('dragstart click', this.collapse, this);
		}
		this.fire('search_collapsed');
		return this;
	},
	
	collapseDelayed: function() {	//collapse after delay, used on_input blur
		if (!this.options.autoCollapse) return this;
		var that = this;
		clearTimeout(this.timerCollapse);
		this.timerCollapse = setTimeout(function() {
			that.collapse();
		}, this.options.autoCollapseTime);
		return this;		
	},

	collapseDelayedStop: function() {
		clearTimeout(this.timerCollapse);
		return this;		
	},

////start DOM creations
	_createAlert: function(className) {
		var alert = L.DomUtil.create('div', className, this._container);
		alert.style.display = 'none';

		L.DomEvent
			.on(alert, 'click', L.DomEvent.stop, this)
			.on(alert, 'click', this.hideAlert, this);

		return alert;
	},

	_createInput: function (text, className) {
		var label = L.DomUtil.create('label', className, this._container);
		var input = L.DomUtil.create('input', className, this._container);
		input.type = 'text';
		input.size = this._inputMinSize;
		input.value = '';
		input.autocomplete = 'off';
		input.autocorrect = 'off';
		input.autocapitalize = 'off';
		input.placeholder = text;
		input.style.display = 'none';
		input.role = 'search';
		input.id = input.role + input.type + input.size;
		
		label.htmlFor = input.id;
		label.style.display = 'none';
		label.value = text;
		
		L.DomEvent
			.disableClickPropagation(input)
			.on(input, 'keyup', this._handleKeypress, this)
			.on(input, 'keydown', this._handleAutoresize, this)
			.on(input, 'blur', this.collapseDelayed, this)
			.on(input, 'focus', this.collapseDelayedStop, this);
		
		return input;
	},

	_createCancel: function (title, className) {
		var cancel = L.DomUtil.create('a', className, this._container);
		cancel.href = '#';
		cancel.title = title;
		cancel.style.display = 'none';
		cancel.innerHTML = "<span>&otimes;</span>";//imageless(see css)

		L.DomEvent
			.on(cancel, 'click', L.DomEvent.stop, this)
			.on(cancel, 'click', this.cancel, this);

		return cancel;
	},
	
	_createButton: function (title, className) {
		var button = L.DomUtil.create('a', className, this._container);
		button.href = '#';
		button.title = title;

		L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._handleSubmit, this)			
			.on(button, 'focus', this.collapseDelayedStop, this)
			.on(button, 'blur', this.collapseDelayed, this);

		return button;
	},

	_createTooltip: function(className) {
		var tool = L.DomUtil.create('div', className, this._container);
		tool.style.display = 'none';

		var that = this;
		L.DomEvent
			.disableClickPropagation(tool)
			.on(tool, 'blur', this.collapseDelayed, this)
			.on(tool, 'mousewheel', function(e) {
				that.collapseDelayedStop();
				L.DomEvent.stopPropagation(e);//disable zoom map
			}, this)
			.on(tool, 'mouseover', function(e) {
				that.collapseDelayedStop();
			}, this);
		return tool;
	},

	_createTip: function(text, val) {//val is object in recordCache, usually is Latlng
		var tip;
		
		if(this.options.callTip)
		{
			tip = this.options.callTip(text,val); //custom tip node or html string
			if(typeof tip === 'string')
			{
				var tmpNode = L.DomUtil.create('div');
				tmpNode.innerHTML = tip;
				tip = tmpNode.firstChild;
			}
		}
		else
		{
			tip = L.DomUtil.create('a', '');
			tip.href = '#';
			tip.innerHTML = text;
		}
		
		L.DomUtil.addClass(tip, 'search-tip');
		tip._text = text; //value replaced in this._input and used by _autoType

		L.DomEvent
			.disableClickPropagation(tip)		
			.on(tip, 'click', L.DomEvent.stop, this)
			.on(tip, 'click', function(e) {
				this._input.value = text;
				this._handleAutoresize();
				this._input.focus();
				this._hideTooltip();	
				if(this.options.tipAutoSubmit)//go to location at once
					this._handleSubmit();
			}, this);

		return tip;
	},

//////end DOM creations

	_getUrl: function() {
		return (typeof(this.options.url) == "function") ? this.options.url() : this.options.url;
	},

	_filterRecords: function(text) {	//Filter this._recordsCache case insensitive and much more..
	
		var regFilter = new RegExp("^[.]$|[\[\]|()*]",'g'),	//remove . * | ( ) ] [
			I, regSearch,
			frecords = {};

		text = text.replace(regFilter,'');	  //sanitize text
		I = this.options.initial ? '^' : '';  //search only initial text
		//TODO add option for case sesitive search, also showLocation
		regSearch = new RegExp(I + text,'i');

		//TODO use .filter or .map
		for(var key in this._recordsCache)
			if( regSearch.test(key) )
				frecords[key]= this._recordsCache[key];
		
		return frecords;
	},

	showTooltip: function() {
		var filteredRecords, newTip;

		this._countertips = 0;
		
	//FIXME problem with jsonp/ajax when remote filter has different behavior of this._filterRecords
		if(this.options.layer)
			filteredRecords = this._filterRecords( this._input.value );
		else
			filteredRecords = this._recordsCache;
			
		this._tooltip.innerHTML = '';
		this._tooltip.currentSelection = -1;  //inizialized for _handleArrowSelect()

		for(var key in filteredRecords)//fill tooltip
		{
			if(++this._countertips == this.options.tooltipLimit) break;

			newTip = this._createTip(key, filteredRecords[key] );

			this._tooltip.appendChild(newTip);
		}
		
		if(this._countertips > 0)
		{
			this._tooltip.style.display = 'block';
			if(this._autoTypeTmp)
				this._autoType();
			this._autoTypeTmp = this.options.autoType;//reset default value
		}
		else
			this._hideTooltip();

		this._tooltip.scrollTop = 0;
		return this._countertips;
	},

	_hideTooltip: function() {
		this._tooltip.style.display = 'none';
		this._tooltip.innerHTML = '';
		return 0;
	},

	_defaultFilterJSON: function(json) {	//default callback for filter data
		var jsonret = {}, i,
			propName = this.options.propertyName,
			propLoc = this.options.propertyLoc;

		if( L.Util.isArray(propLoc) )
			for(i in json)
				jsonret[ this._getPath(json[i],propName) ]= L.latLng( json[i][ propLoc[0] ], json[i][ propLoc[1] ] );
		else
			for(i in json)
				jsonret[ this._getPath(json[i],propName) ]= L.latLng( this._getPath(json[i],propLoc) );
		//TODO throw new Error("propertyName '"+propName+"' not found in JSON data");
		return jsonret;
	},

	_recordsFromJsonp: function(text, callAfter) {  //extract searched records from remote jsonp service
		//TODO remove script node after call run
		var that = this;
		L.Control.Search.callJsonp = function(data) {	//jsonp callback
			var fdata = that._filterJSON(data);//_filterJSON defined in inizialize...
			callAfter(fdata);
		}
		var script = L.DomUtil.create('script','search-jsonp', document.getElementsByTagName('body')[0] ),			
			url = L.Util.template(this._getUrl()+'&'+this.options.jsonpParam+'=L.Control.Search.callJsonp', {s: text}); //parsing url
			//rnd = '&_='+Math.floor(Math.random()*10000);
			//TODO add rnd param or randomize callback name! in recordsFromJsonp
		script.type = 'text/javascript';
		script.src = url;
		return {abort: function() { script.parentNode.removeChild(script); } };
	},

	_recordsFromAjax: function(text, callAfter) {	//Ajax request
		if (window.XMLHttpRequest === undefined) {
			window.XMLHttpRequest = function() {
				try { return new ActiveXObject("Microsoft.XMLHTTP.6.0"); }
				catch  (e1) {
					try { return new ActiveXObject("Microsoft.XMLHTTP.3.0"); }
					catch (e2) { throw new Error("XMLHttpRequest is not supported"); }
				}
			};
		}
		var request = new XMLHttpRequest(),
			url = L.Util.template(this._getUrl(), {s: text}), //parsing url
			//rnd = '&_='+Math.floor(Math.random()*10000);
			//TODO add rnd param or randomize callback name! in recordsFromAjax			
			response = {};
		
		request.open("GET", url);
		var that = this;
		request.onreadystatechange = function() {
		    if(request.readyState === 4 && request.status === 200) {
		    	response = JSON.parse(request.responseText);
		    	var fdata = that._filterJSON(response);//_filterJSON defined in inizialize...
		        callAfter(fdata);
		    }
		};
		request.send();
		return request;   
	},	

	_recordsFromLayer: function() {	//return table: key,value from layer
		var that = this,
			retRecords = {},
			propName = this.options.propertyName,
			loc;
		
		this._layer.eachLayer(function(layer) {

			if(layer instanceof SearchMarker) return;

			if(layer instanceof L.Marker || L.CircleMarker)
			{
				if(that._getPath(layer.options,propName))
				{
					loc = layer.getLatLng();
					loc.layer = layer;
					retRecords[ that._getPath(layer.options,propName) ] = loc;			
					
				}else if(that._getPath(layer.feature.properties,propName)){

					loc = layer.getLatLng();
					loc.layer = layer;
					retRecords[ that._getPath(layer.feature.properties,propName) ] = loc;
					
				}else{
					console.log("propertyName '"+propName+"' not found in marker", layer);
				}
			}
			else if(layer.hasOwnProperty('feature'))//GeoJSON layer
			{
				if(layer.feature.properties.hasOwnProperty(propName))
				{
					loc = layer.getBounds().getCenter();
					loc.layer = layer;			
					retRecords[ layer.feature.properties[propName] ] = loc;
				}
				else
					console.log("propertyName '"+propName+"' not found in feature", layer);			
			}
			
		},this);
		
		return retRecords;
	},

	_autoType: function() {
		
		//TODO implements autype without selection(useful for mobile device)
		
		var start = this._input.value.length,
			firstRecord = this._tooltip.firstChild._text,
			end = firstRecord.length;

		if (firstRecord.indexOf(this._input.value) === 0) { // If prefix match
			this._input.value = firstRecord;
			this._handleAutoresize();

			if (this._input.createTextRange) {
				var selRange = this._input.createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end);
				selRange.select();
			}
			else if(this._input.setSelectionRange) {
				this._input.setSelectionRange(start, end);
			}
			else if(this._input.selectionStart) {
				this._input.selectionStart = start;
				this._input.selectionEnd = end;
			}
		}
	},

	_hideAutoType: function() {	// deselect text:

		var sel;
		if ((sel = this._input.selection) && sel.empty) {
			sel.empty();
		}
		else if (this._input.createTextRange) {
			sel = this._input.createTextRange();
			sel.collapse(true);
			var end = this._input.value.length;
			sel.moveStart('character', end);
			sel.moveEnd('character', end);
			sel.select();
		}
		else {
			if (this._input.getSelection) {
				this._input.getSelection().removeAllRanges();
			}
			this._input.selectionStart = this._input.selectionEnd;
		}
	},
	
	_handleKeypress: function (e) {	//run _input keyup event
		
		switch(e.keyCode)
		{
			case 27: //Esc
				this.collapse();
			break;
			case 13: //Enter
				if(this._countertips == 1)
					this._handleArrowSelect(1);
				this._handleSubmit();	//do search
			break;
			case 38://Up
				this._handleArrowSelect(-1);
			break;
			case 40://Down
				this._handleArrowSelect(1);
			break;
			case 37://Left
			case 39://Right
			case 16://Shift
			case 17://Ctrl
			//case 32://Space
			break;
			case 8://backspace
			case 46://delete
				this._autoTypeTmp = false;//disable temporarily autoType
			break;
			default://All keys

				if(this._input.value.length)
					this._cancel.style.display = 'block';
				else
					this._cancel.style.display = 'none';

				if(this._input.value.length >= this.options.minLength)
				{
					var that = this;

					clearTimeout(this.timerKeypress);	//cancel last search request while type in				
					this.timerKeypress = setTimeout(function() {	//delay before request, for limit jsonp/ajax request

						that._fillRecordsCache();
					
					}, this.options.delayType);
				}
				else
					this._hideTooltip();
		}
	},
	
	_fillRecordsCache: function() {
//TODO important optimization!!! always append data in this._recordsCache
//  now _recordsCache content is emptied and replaced with new data founded
//  always appending data on _recordsCache give the possibility of caching ajax, jsonp and layersearch!
//
//TODO here insert function that search inputText FIRST in _recordsCache keys and if not find results.. 
//  run one of callbacks search(callData,jsonpUrl or options.layer) and run this.showTooltip
//
//TODO change structure of _recordsCache
//	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
//	in this mode every record can have a free structure of attributes, only 'loc' is required
	
		var inputText = this._input.value,
			that = this;

		if(this._curReq && this._curReq.abort)
			this._curReq.abort();
		//abort previous requests

		L.DomUtil.addClass(this._container, 'search-load');	

		if(this.options.callData)	//CUSTOM SEARCH CALLBACK
		{
			this._curReq = this.options.callData(inputText, function(jsonraw) {

				that._recordsCache = that._filterJSON(jsonraw);

				that.showTooltip();

				L.DomUtil.removeClass(that._container, 'search-load');
			});
		}
		else if(this._getUrl())	//JSONP/AJAX REQUEST
		{
			if(this.options.jsonpParam)
			{
				this._curReq = this._recordsFromJsonp(inputText, function(data) {// is async request then it need callback
					that._recordsCache = data;
					that.showTooltip();
					L.DomUtil.removeClass(that._container, 'search-load');
				});
			}
			else
			{
				this._curReq = this._recordsFromAjax(inputText, function(data) {// is async request then it need callback
					that._recordsCache = data;
					that.showTooltip();
					L.DomUtil.removeClass(that._container, 'search-load');
				});
			}
		}
		else if(this.options.layer)	//SEARCH ELEMENTS IN PRELOADED LAYER
		{
			this._recordsCache = this._recordsFromLayer();	//fill table key,value from markers into layer				
			this.showTooltip();
			L.DomUtil.removeClass(this._container, 'search-load');
		}
	},
	
	_handleAutoresize: function() {	//autoresize this._input
	    //TODO refact _handleAutoresize now is not accurate
	    if (this._input.style.maxWidth != this._map._container.offsetWidth) //If maxWidth isn't the same as when first set, reset to current Map width
	        this._input.style.maxWidth = L.DomUtil.getStyle(this._map._container, 'width');

		if(this.options.autoResize && (this._container.offsetWidth + 45 < this._map._container.offsetWidth))
			this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
	},

	_handleArrowSelect: function(velocity) {
	
		var searchTips = this._tooltip.hasChildNodes() ? this._tooltip.childNodes : [];
			
		for (i=0; i<searchTips.length; i++)
			L.DomUtil.removeClass(searchTips[i], 'search-tip-select');
		
		if ((velocity == 1 ) && (this._tooltip.currentSelection >= (searchTips.length - 1))) {// If at end of list.
			L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
		}
		else if ((velocity == -1 ) && (this._tooltip.currentSelection <= 0)) { // Going back up to the search box.
			this._tooltip.currentSelection = -1;
		}
		else if (this._tooltip.style.display != 'none') { // regular up/down
			this._tooltip.currentSelection += velocity;
			
			L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
			
			this._input.value = searchTips[this._tooltip.currentSelection]._text;

			// scroll:
			var tipOffsetTop = searchTips[this._tooltip.currentSelection].offsetTop;
			
			if (tipOffsetTop + searchTips[this._tooltip.currentSelection].clientHeight >= this._tooltip.scrollTop + this._tooltip.clientHeight) {
				this._tooltip.scrollTop = tipOffsetTop - this._tooltip.clientHeight + searchTips[this._tooltip.currentSelection].clientHeight;
			}
			else if (tipOffsetTop <= this._tooltip.scrollTop) {
				this._tooltip.scrollTop = tipOffsetTop;
			}
		}
	},

	_handleSubmit: function() {	//button and tooltip click and enter submit

		this._hideAutoType();
		
		this.hideAlert();
		this._hideTooltip();

		if(this._input.style.display == 'none')	//on first click show _input only
			this.expand();
		else
		{
			if(this._input.value === '')	//hide _input only
				this.collapse();
			else
			{
				var loc = this._getLocation(this._input.value);
				
				if(loc===false)
					this.showAlert();
				else
				{
					this.showLocation(loc, this._input.value);
					this.fire('search_locationfound', {
							latlng: loc,
							text: this._input.value,
							layer: loc.layer ? loc.layer : null
						});
				}
				//this.collapse();
				//FIXME if collapse in _handleSubmit hide _markerLoc!
			}
		}
	},

	_getLocation: function(key) {	//extract latlng from _recordsCache

		if( this._recordsCache.hasOwnProperty(key) )
			return this._recordsCache[key];//then after use .loc attribute
		else
			return false;
	},

	showLocation: function(latlng, title) {	//set location on map from _recordsCache
			
		if(this.options.zoom)
			this._map.setView(latlng, this.options.zoom);
		else
			this._map.panTo(latlng);

		if(this._markerLoc)
		{
			this._markerLoc.setLatLng(latlng);  //show circle/marker in location found
			this._markerLoc.setTitle(title);
			this._markerLoc.show();
			if(this.options.animateLocation)
				this._markerLoc.animate();
			//TODO showLocation: start animation after setView or panTo, maybe with map.on('moveend')...	
		}
		
		//FIXME autoCollapse option hide this._markerLoc before that visualized!!
		if(this.options.autoCollapse)
			this.collapse();
		return this;
	}
});

var SearchMarker = L.Marker.extend({

	includes: L.Mixin.Events,
	
	options: {
		radius: 10,
		weight: 3,
		color: '#e03',
		stroke: true,
		fill: false,
		title: '',
		icon: new L.Icon.Default(),
		showCircle: true,
		showMarker: true	//show icon optional, show only circleLoc
	},
	
	initialize: function (latlng, options) {
		L.setOptions(this, options);
		L.Marker.prototype.initialize.call(this, latlng, options);
		if(this.options.showCircle)
			this._circleLoc =  new L.CircleMarker(latlng, this.options);
	},

	onAdd: function (map) {
		L.Marker.prototype.onAdd.call(this, map);
		if(this._circleLoc)
			map.addLayer(this._circleLoc);
		this.hide();
	},

	onRemove: function (map) {
		L.Marker.prototype.onRemove.call(this, map);
		if(this._circleLoc)
			map.removeLayer(this._circleLoc);
	},	
	
	setLatLng: function (latlng) {
		L.Marker.prototype.setLatLng.call(this, latlng);
		if(this._circleLoc)
			this._circleLoc.setLatLng(latlng);
		return this;
	},
	
	setTitle: function(title) {
		title = title || '';
		this.options.title = title;
		if(this._icon)
			this._icon.title = title;
		return this;
	},

	show: function() {
		if(this.options.showMarker)
		{
			if(this._icon)
				this._icon.style.display = 'block';
			if(this._shadow)
				this._shadow.style.display = 'block';
			//this._bringToFront();
		}
		if(this._circleLoc)
		{
			this._circleLoc.setStyle({fill: this.options.fill, stroke: this.options.stroke});
			//this._circleLoc.bringToFront();
		}
		return this;
	},

	hide: function() {
		if(this._icon)
			this._icon.style.display = 'none';
		if(this._shadow)
			this._shadow.style.display = 'none';
		if(this._circleLoc)			
			this._circleLoc.setStyle({fill: false, stroke: false});
		return this;
	},

	animate: function() {
	//TODO refact animate() more smooth! like this: http://goo.gl/DDlRs
		if(this._circleLoc)
		{
			var circle = this._circleLoc,
				tInt = 200,	//time interval
				ss = 10,	//frames
				mr = parseInt(circle._radius/ss),
				oldrad = this.options.radius,
				newrad = circle._radius * 2.5,
				acc = 0;

			circle._timerAnimLoc = setInterval(function() {
				acc += 0.5;
				mr += acc;	//adding acceleration
				newrad -= mr;
				
				circle.setRadius(newrad);

				if(newrad<oldrad)
				{
					clearInterval(circle._timerAnimLoc);
					circle.setRadius(oldrad);//reset radius
					//if(typeof afterAnimCall == 'function')
						//afterAnimCall();
						//TODO use create event 'animateEnd' in SearchMarker 
				}
			}, tInt);
		}
		
		return this;
	}
});

L.Map.addInitHook(function () {
    if (this.options.searchControl) {
        this.searchControl = L.control.search(this.options.searchControl);
        this.addControl(this.searchControl);
    }
});

L.control.search = function (options) {
    return new L.Control.Search(options);
};

}).call(this);

(function(){

L.Control.EasyButton = L.Control.extend({

  options: {
    position:  'topleft', // part of leaflet's defaults

    id:        null,      // an id to tag the container with

    type:      'replace', // [(replace|animate)]
                          // replace swaps out elements
                          // animate changes classes with all elements inserted

    auto:      'CYCLE',   // [(CYCLE|FORWARD|REVERSE-CYCLE|BACK|NOOP)]
                          // CYCLE => after callback go to the next state (loop to beginning from the end)
                          // FORWARD => after callback go to the next state (stop at end)
                          // REVERSE-CYCLE => after callback go to the previous state (loop to the end from the beginning)
                          // BACK => after callback go to the next state (stop at beginning)
                          // NOOP => no operation

    states:    [],        // state names look like this
                          // {
                          //   stateName: 'untracked',
                          //   onEnter: function(){ track_Something(); this.state('tracking'); },
                          //   onClick: function(){ handle_nav_manually(); };
                          //   title: 'click to make inactive',
                          //   icon: 'fa-circle',    // wrapped with <a>
                          // }

    extraHTML: null      // extra html to be inserted in
                          // the container. useful for indicators
  },



  initialize: function(uno, dos, tres){

    this.options.states = [];
    this.storage = {};

    // is the last item an object?
    if( typeof arguments[arguments.length-1] === "object" ){

      // if so, it should be the options
      L.Util.setOptions( this, arguments[arguments.length-1] );
    }

    //if there aren't any states set manually
    if( this.options.states.length === 0 ){

      // if the uno argument is a string, set it
      if( uno && typeof uno  === "string"){
        L.Util.setOptions( this, { icon: uno});
      }

      // if the dos argument is a function, set it
      if( dos && typeof dos === 'function'){
        L.Util.setOptions( this, { onEnter: dos});
      }

      // turn the options object into a state
      this.options.states.push(Object.create(this.options));
    }

    this._states = curateStates(this);

  },



  onAdd: function () {

    this.container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    this.options.id && (this.container.id = this.options.id);

    this.container.innerHTML = this.options.extraHTML;

    // prep the contents of the control
    if(this.options.type == 'replace'){
      this._currentState = this._states[0];
      this.container.appendChild(this._currentState.icon);
    } else {
      for(var i=0;i<this._states.length;i++){
        this.container.appendChild(this._states[i].icon);
      }
    }

    //this.state(0);

    return this.container;
  },



  _currentState: {
    // placeholder content
    stateName: 'unnamed',
    icon: (function(){ return document.createElement('span'); })()
  },



  _states: null, // populated on init



  state: function(newState){

    if(typeof newState == "string"){
      switch (newState){
        case "FORWARD":
          this._forward();
          break;
        case "CYCLE":
        case "FORWARD-CYCLE":
          this._forwardCycle();
          break;
        case "REVERSE":
          this._reverse();
          break;
        case "REV-CYCLE":
        case "REVERSE-CYCLE":
          this._reverseCycle();
          break;
        case "NOOP":
          break;
        default:
          this._activateStateNamed(newState);
          break;
      }
    } else if (typeof newState == "number"){
      this._activateState(this._states[newState]);
    }

    return this;
  },


  _activateStateNamed: function(stateName){
    for(var i = 0; i < this._states.length; i++){
      if( this._states[i].stateName == stateName ){
        this._activateState( this._states[i] );
      }
    }
  },

  _activateState: function(newState){

    newState.onEnter(this);

    // don't touch the dom if it'll just be the same after
    if( newState.icon !== this._currentState.icon){

      // swap out elements... if you're into that kind of thing
      if( this.options.type == 'replace' ){
        this.container.appendChild(newState.icon);
        this.container.removeChild(this._currentState.icon);
      }

      // update classes for animations
      for(var i=0;i<this._states.length;i++){
        L.DomUtil.removeClass(this._states[i].icon, this._currentState.stateName + '-active');
        L.DomUtil.addClass(this._states[i].icon, newState.stateName + '-active');
      }

      // update classes for animations
      L.DomUtil.removeClass(this.container, this._currentState.stateName + '-active');
      L.DomUtil.addClass(this.container, newState.stateName + '-active');

      // update the record
      this._currentState = newState;

    }
  },



  _forward: function(){
    var index = this._states.indexOf(this._currentState);
    index++;
    if( index < this._states.length ){
      this._activateState(this._states[index]);
    }
  },



  _reverse: function(){
    var index = this._states.indexOf(this._currentState);
    index--;
    if( index >= 0 ){
      this._activateState(this._states[index]);
    }
  },



  _forwardCycle: function(){
    var index = this._states.indexOf(this._currentState);
    index++;
    if( index < this._states.length ){
      this._activateState(this._states[index]);
    } else {
      this._activateState(this._states[0]);
    }
  },



  _reverseCycle: function(){
    var index = this._states.indexOf(this._currentState);
    index--;
    if( index >= 0 ){
      this._activateState(this._states[index]);
    } else {
      this._activateState(this._states[this._states.length - 1]);
    }
  },



  enable: function(){
    L.DomUtil.addClass(this.container, 'enabled');
    L.DomUtil.removeClass(this.container, 'disabled');
    return this;
  },



  disable: function(){
    L.DomUtil.addClass(this.container, 'disabled');
    L.DomUtil.removeClass(this.container, 'enabled');
    return this;
  }

});

L.easyButton = function(one, two, three){
  var args = Array.prototype.concat.apply([L.Control.EasyButton],arguments)
  return new (Function.prototype.bind.apply(L.Control.EasyButton, args));
};

/*************************
 *
 * util functions
 *
 *************************/

function buildIcon(ambiguousIconString) {

  var tmpIcon;

  // does this look like html? (i.e. not a class)
  if( ambiguousIconString.match(/[&;=<>"']/) ){

    // if so, the user should have put in html
    // so move forward as such
    tmpIcon = ambiguousIconString;

  } else { // it's a class list, figure out what kind
      ambiguousIconString = ambiguousIconString.trim();
      tmpIcon = L.DomUtil.create('span', '', this.link);

      if( ambiguousIconString.indexOf('fa-') === 0 ){
        L.DomUtil.addClass(tmpIcon, "fa fa-lg "  + ambiguousIconString)

      } else if ( ambiguousIconString.indexOf('glyphicon-') === 0 ) {
        L.DomUtil.addClass(tmpIcon, "glyphicon " + ambiguousIconString)

      } else {
        L.DomUtil.addClass(tmpIcon, /*rollwithit*/ ambiguousIconString)
      }

      // make this a string so that it's easy to set innerHTML below
      tmpIcon = tmpIcon.outerHTML;
  }

  return tmpIcon;
}

function curateStates(thisEasyButton){
  var curatedStates = [],
      dirtyStates = thisEasyButton.options.states;


  for(var i = 0; i < thisEasyButton.options.states.length; i++){
    curatedStates.push( curateState(thisEasyButton.options.states[i], thisEasyButton) );
  }

  return curatedStates;

  function curateState(state, newThis){
    var cleanState = {};

    cleanState.title = state.title;
    cleanState.stateName = state.stateName;

    cleanState.icon = L.DomUtil.create('a', 'easy-button-button leaflet-bar-part');
    cleanState.icon.href = 'javascript:void(0);';
    state.title && (cleanState.icon.title = state.title);
    cleanState.icon.innerHTML = buildIcon(state.icon);
    cleanState.onEnter = L.Util.bind(state.onEnter, newThis);
    cleanState.onClick = L.Util.bind(state.onClick?state.onClick:function(){}, newThis);

    L.DomEvent.addListener(cleanState.icon,'click', function(e){
      L.DomEvent.stop(e);
      this._map.getContainer().focus();
      cleanState.onClick(newThis);
      this.state(this.options.auto);
    }, newThis);

    return cleanState;
  }
}

})();
/**
 * Semicircle extension for L.Circle.
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

/*jshint browser:true, strict:false, globalstrict:false, indent:4, white:true, smarttabs:true*/
/*global L:true*/

(function (L) {

	// save original getPathString function to draw a full circle.
	var original_getPathString = L.Circle.prototype.getPathString;

	L.Circle = L.Circle.extend({
		options: {
			startAngle: 0,
			stopAngle: 359.9999
		},

		// make sure 0 degrees is up (North) and convert to radians.
		_fixAngle: function (angle) {
			return (angle - 90) * L.LatLng.DEG_TO_RAD;
		},
		startAngle: function () {
			return this._fixAngle(this.options.startAngle);
		},
		stopAngle: function () {
			return this._fixAngle(this.options.stopAngle);
		},

		//rotate point x,y+r around x,y with angle.
		rotated: function (angle, r) {
			return this._point.add(
				L.point(Math.cos(angle), Math.sin(angle)).multiplyBy(r)
			).round();
		},

		getPathString: function () {
			var center = this._point,
			    r = this._radius;

			// If we want a circle, we use the original function
			if (this.options.startAngle === 0 && this.options.stopAngle > 359) {
				return original_getPathString.call(this);
			}

			var start = this.rotated(this.startAngle(), r),
				end = this.rotated(this.stopAngle(), r);

			if (this._checkIfEmpty()) {
				return '';
			}

			if (L.Browser.svg) {
				var largeArc = (this.options.stopAngle - this.options.startAngle >= 180) ? '1' : '0';
				//move to center
				var ret = "M" + center.x + "," + center.y;
				//lineTo point on circle startangle from center
				ret += "L " + start.x + "," + start.y;
				//make circle from point start - end:
				ret += "A " + r + "," + r + ",0," + largeArc + ",1," + end.x + "," + end.y + " z";

				return ret;
			} else {
				//TODO: fix this for semicircle...
				center._round();
				r = Math.round(r);
				return "A " + center.x + "," + center.y + " " + r + "," + r + " 0," + (65535 * 360);
			}
		},
		setStartAngle: function (angle) {
			this.options.startAngle = angle;
			return this.redraw();
		},
		setStopAngle: function (angle) {
			this.options.stopAngle = angle;
			return this.redraw();
		},
		setDirection: function (direction, degrees) {
			if (degrees === undefined) {
				degrees = 10;
			}
			this.options.startAngle = direction - (degrees / 2);
			this.options.stopAngle = direction + (degrees / 2);

			return this.redraw();
		}
	});
	L.Circle.include(!L.Path.CANVAS ? {} : {
		_drawPath: function () {
			var center = this._point,
			    r = this._radius;

			var start = this.rotated(this.startAngle(), r);

			this._ctx.beginPath();
			this._ctx.moveTo(center.x, center.y);
			this._ctx.lineTo(start.x, start.y);

			this._ctx.arc(center.x, center.y, this._radius,
				this.startAngle(), this.stopAngle(), false);
			this._ctx.lineTo(center.x, center.y);
		}

		// _containsPoint: function (p) {
		// TODO: fix for semicircle.
		// var center = this._point,
		//     w2 = this.options.stroke ? this.options.weight / 2 : 0;

		//  return (p.distanceTo(center) <= this._radius + w2);
		// }
	});
})(L);
/*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
    
L.Rrose = L.Popup.extend({

  _initLayout:function () {
    var prefix = 'leaflet-rrose',
      container = this._container = L.DomUtil.create('div', prefix + ' ' + this.options.className + ' leaflet-zoom-animated'),
      closeButton, wrapper;

    if (this.options.closeButton) {
      closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
      closeButton.href = '#close';
      closeButton.innerHTML = '&#215;';

      L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
    }

    // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
    var x_bound = 80, y_bound = 80;
    // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
    this.options.position = 'n';
    // Then see if the point is too far north...
    var y_diff = y_bound - this._map.latLngToContainerPoint(this._latlng).y;
    if (y_diff > 0) {
      this.options.position = 's'
    }
    // or too far east...
    var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
    if (x_diff > 0) {
      this.options.position += 'w'
    } else {
    // or too far west.
      x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
      if (x_diff > 0) {
        this.options.position += 'e'
      }
    }

    // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
    if (/s/.test(this.options.position)) {
      if (this.options.position === 's') {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      } 
      else {
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position, container);
      }
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
    } 
    else {
      if (this.options.position === 'n') {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      } 
      else {
        wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + this.options.position, container);
        this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + this.options.position, container);
      }
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
      this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + this.options.position, this._tipContainer);
    }

  },

  _updatePosition:function () {
    var pos = this._map.latLngToLayerPoint(this._latlng),
      is3d = L.Browser.any3d,
      offset = this.options.offset;

    if (is3d) {
      L.DomUtil.setPosition(this._container, pos);
    }

    if (/s/.test(this.options.position)) {
      this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y);
    } else {
      this._containerBottom = -offset.y - (is3d ? 0 : pos.y);
    }

    if (/e/.test(this.options.position)) {
      this._containerLeft = offset.x + (is3d ? 0 : pos.x);
    } 
    else if (/w/.test(this.options.position)) {
      this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x);
    } 
    else {
      this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x);
    }

    this._container.style.bottom = this._containerBottom + 'px';
    this._container.style.left = this._containerLeft + 'px';
  }

});
