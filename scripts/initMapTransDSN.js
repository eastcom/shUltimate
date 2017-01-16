//注册鼠标悬浮时显示鼠标停留的坐标事件,这儿显示坐标信息
function onMouseMove(e) {
    var latlng = e.latlng;
    document.getElementById("infoLocation").innerHTML = "纬度：" + latlng.lat.toString() + "，" + "经度：" + latlng.lng.toString();
}
//控制地图缩放时标注显示
function controlLabel(){
    if(labelLayer){
        var curZoom = map.getZoom();
        if(curZoom < 15){
            map.removeLayer(labelLayer);
        }
        else{
            map.addLayer(labelLayer);
        }
    }
}
//控制浮动模块DIV的显示
function showIndexDiv(){
    document.getElementById("showIndex").style.display="none";
    document.getElementById("showIndex").style.visibility = "hidden";
    document.getElementById("indexSelect").style.display="block";
    document.getElementById("indexSelect").style.visibility = "visible";
    document.getElementById("hideIndex").style.display="block";
    document.getElementById("hideIndex").style.visibility = "visible";
}
function hideIndexDIV(){
    document.getElementById("indexSelect").style.display="none";
    document.getElementById("indexSelect").style.visibility = "hidden";
    document.getElementById("showIndex").style.display="block";
    document.getElementById("showIndex").style.visibility = "visible";
    document.getElementById("hideIndex").style.display="none";
    document.getElementById("hideIndex").style.visibility = "hidden";
}
//获取颜色值
function getColor(d) {
    return d < 0 ? '#FFFFFF' :
        d <= 1 ? '#0000FF' :
            d <= 2 ? '#00FF00' :
                d <= 3 ? '#FFFF00' :
                    d <= 4 ? '#F08080' :
                        d <= 5 ? '#FF0000' : '#FF0000';
}
//初始化百度地图
function initBaiduMap(){
	//console.time('test')
    //限制地图显示范围
    var southWest = L.latLng(31.079115, 121.5702),
        northEast = L.latLng(31.237952, 121.753598),
        bounds = L.latLngBounds(southWest, northEast);
    //初始化地图
    map = new L.map('map',{
        minZoom: 14,
        maxZoom: 21,
        crs: L.CRS.BEPSG3857,
        //contextmenu: true,
        maxBounds: bounds,
		zoomControl: false,
        attributionControl: false
    }).setView([31.147751,121.689207], 17);
	L.control.zoom({zoomInTitle: '放大', zoomOutTitle: '缩小'}).addTo(map);
    //自定义地图数据源
    var baseLayer = L.tileLayer.baiduLayer('customLayerDSN.Map',{tileSize: 256, minZoom: 14, maxZoom: 21});
    //var baseLayer = L.tileLayer.baiduLayer('Satellite.Map');
    //var baseLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw');
    //添加图层控制器
    var baseLayers = {
        "地图": baseLayer
    };
    //switchControl = L.control.layers(baseLayers, [],{autoZIndex:false,position:'topright'}).addTo(map);
    map.addLayer(baseLayer);
    //注册鼠标悬浮地图事件
    map.on('mousemove', onMouseMove);
    //控制标注
    //map.on('zoomend',controlLabel);
    //添加比例尺
    L.control.scale({position: 'bottomright', imperial: false}).addTo(map);
	//console.timeEnd('test')
}
//添加小区
function queryXQHZ(){
    polygonLayer && (map.removeLayer(polygonLayer),polygonLayer.clearLayers());
    labelLayer && (map.removeLayer(labelLayer),labelLayer.clearLayers());
    markerLayer && (map.removeLayer(markerLayer),markerLayer.clearLayers(),switchControl.removeLayer(markerLayer));
    for(var i= 0,lenI=polygonData.length; i<lenI; ++i){
        var pointsArr = polygonData[i].latlng;
        var polygonName = polygonData[i].name;
        var equipmentNo = JSON.stringify(polygonData[i].equipmentNo);
        var polygonArr = [];
        for(var j= 0,lenJ=pointsArr.length; j<lenJ; ++j){
            var latLng = pointsArr[j];
            polygonArr.push(latLng);
        }
        var color = Math.random()*(5 - 0) + 0;
        var polygon = L.polygon(polygonArr,{weight: 1, color: getColor(color), fillOpacity: 0.3, className: equipmentNo}).bindPopup(polygonName);
        var centerPoint = polygon.getBounds().getCenter();
        addLabel(centerPoint,polygonName);
        polygonLayer.addLayer(polygon);
    }
    map.setView([33.9668, 118.2464], 16);
    map.addLayer(polygonLayer);
    map.addLayer(labelLayer);
    switchControl.addOverlay(polygonLayer,"小区图层");
    switchControl.addOverlay(labelLayer,"小区标注");
    addContextMenuHZ();
    hideIndexDIV();
}
//添加标注
function addLabel(latlng,dataVal){
    //以Icon.lable形式添加标注
    var SweetIcon = L.Icon.Label.extend({
        options: {
            iconUrl: 'images/testBack.png',
            shadowUrl: null,
            iconSize: new L.Point(0.001, 0.001),
            iconAnchor: new L.Point(0, 1),
            labelAnchor: new L.Point(-12, 0),
            wrapperAnchor: new L.Point(12, 13),
            labelClassName: 'sweet-deal-label'
        }
    });
    new L.Marker(latlng,{icon: new SweetIcon({ labelText:dataVal })}).bindPopup(dataVal).addTo(labelLayer);
}
//添加右键菜单
function addContextMenuHZ(){
    polygonLayer.eachLayer(function (layer) {
        layer.bindContextMenu({
            contextmenu: true,
            contextmenuItems: [
                {
                    text: '查看设备分布 ',
                    callback: function(){
                        addEquipment2XQ(layer);
                    }
                },
                {
                    text: '',
                    callback: function(){
                        addRaster2XQ(layer);
                    }
                }
            ]
        });
    });
    labelLayer.eachLayer(function (layer) {
        layer.bindContextMenu({
            contextmenu: true,
            contextmenuItems: [
                {
                    text: '查看设备分布 ',
                    callback: function(){
                        var labelPolygonArr = polygonLayer.getLayers();
                        for(var i= 0,lenI=labelPolygonArr.length; i<lenI; ++i){
                            var temLayer = labelPolygonArr[i];
                            temLayer._popup._content === layer._popup._content && (addEquipment2XQ(temLayer));
                        }
                    }
                },
                {
                    text: '',
                    callback: function(){
                        var latlng = layer.getLatLng();
                        //console.log(layer)
                        map.flyTo(latlng,8);
                        var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 0),closeButton:true, closeOnClick:false})
                            .setLatLng(latlng);
                        var testHtml = 'pages/propertyInfoSB.html?name=' + 'beijing' + '&title=shanghai';
                        heatPopup.setContent("<iframe name='childSB' width=550px frameborder=no height=300px src=" + testHtml + "></iframe>");
                        map.openPopup(heatPopup);
                        //queryXQToSB();
                    }
                }
            ]
        });
    });
}
function judgeEquipment(num,dataVal,layer){
    var dmtBox = L.icon({iconUrl: 'images/dmt.png', iconSize: [50, 50]}),
        gjxBox = L.icon({iconUrl: 'images/gjx.png', iconSize: [50, 50]}),
        onuBox = L.icon({iconUrl: 'images/onu.png', iconSize: [50, 50]});
    var southWest = layer.getBounds().getSouthWest(),
        northEast = layer.getBounds().getNorthEast();
    var latMin = southWest.lat,
        latMax = northEast.lat,
        lngMin = southWest.lng,
        lngMax = northEast.lng;
    var nameContent = layer._popup._content;
    nameContent === '通和桂圆' && (latMin += 0.001, latMax -= 0.002, lngMin += 0.001, lngMax -= 0.001);
    for(var i=0; i<num; ++i){
        var lat = Math.random()*(latMax-latMin) + latMin,
            lng = Math.random()*(lngMax-lngMin) + lngMin;
        var nameNo = i + 1;
        dataVal === 'dmtBox' && L.marker([lat,lng],{icon: dmtBox, title : 'DMT000' + nameNo}).bindPopup('DMT000' + nameNo).addTo(markerLayer);
        dataVal === 'fqxBox' && L.marker([lat,lng],{icon: dmtBox, title : 'FQ000' + nameNo}).bindPopup('FQ000' + nameNo).addTo(markerLayer);
        dataVal === 'gjxBox' && L.marker([lat,lng],{icon: gjxBox, title : 'GJ000' + nameNo}).bindPopup('GJ000' + nameNo).addTo(markerLayer);
        dataVal === 'onuBox' && L.marker([lat,lng],{icon: onuBox, title : 'ONU000' + nameNo}).bindPopup('ONU000' + nameNo).addTo(markerLayer);
    }
}
function addEquipment2XQ(layer){
    markerLayer && (map.removeLayer(markerLayer),markerLayer.clearLayers());
    rasterLayer && (map.removeLayer(rasterLayer),rasterLayer.clearLayers());
    //console.log(nameContent);
    /*/
    var latLngs = layer.getLatLngs()[0];
    var latVal = [],
        lngVal = [];
    for(var i= 0,lenI=latLngs.length; i<lenI; ++i){
        latVal.push(latLngs[i].lat);
        lngVal.push(latLngs[i].lng);
    }
    latVal.sort(function(a,b){return a-b});
    lngVal.sort(function(a,b){return a-b});
    var latMin = latVal[0],
        latMax = latVal[latVal.length-1],
        lngMin = lngVal[0],
        lngMax = lngVal[lngVal.length-1];
    //*/
    /*/
    var southWest = layer.getBounds().getSouthWest(),
        northEast = layer.getBounds().getNorthEast();
    var latMin = southWest.lat,
        latMax = northEast.lat,
        lngMin = southWest.lng,
        lngMax = northEast.lng;
    //console.log(latMin,latMax,lngMin,lngMax);
    var nameContent = layer._popup._content;
    nameContent === '通和桂圆' && (latMin += 0.001, latMax -= 0.002, lngMin += 0.001, lngMax -= 0.001);
    //*/
    //console.log(latMin,latMax,lngMin,lngMax);
    //var nameVal = ['dmtBox','fqxBox','gjxBox','onuBox'];
    var temObj = JSON.parse(layer.options.className);
    var gjxNo = temObj.gjx,
        dmtNo = temObj.dmt,
        fqxNo = temObj.fqx,
        onuNo = temObj.onu;
    judgeEquipment(gjxNo,'gjxBox',layer);
    judgeEquipment(dmtNo,'dmtBox',layer);
    judgeEquipment(fqxNo,'fqxBox',layer);
    judgeEquipment(onuNo,'onuBox',layer);
    /*/
    for(var i= 0; i<30; ++i){
        var lat = Math.random()*(latMax-latMin) + latMin,
            lng = Math.random()*(lngMax-lngMin) + lngMin;
        var indexRandom = parseInt(Math.random()*(4-0)+0);
        var dataVal = nameVal[indexRandom];
        dataVal === 'dmtBox' && L.marker([lat,lng],{icon: dmtBox, title : 'DMT000' + i}).bindPopup('DMT000' + i).addTo(markerLayer);
        dataVal === 'fqxBox' && L.marker([lat,lng],{icon: dmtBox, title : 'FQ000' + i}).bindPopup('FQ000' + i).addTo(markerLayer);
        dataVal === 'gjxBox' && L.marker([lat,lng],{icon: gjxBox, title : 'GJ000' + i}).bindPopup('GJ000' + i).addTo(markerLayer);
        dataVal === 'onuBox' && L.marker([lat,lng],{icon: onuBox, title : 'ONU000' + i}).bindPopup('ONU000' + i).addTo(markerLayer);
    }
    //*/
    var center = layer.getBounds().getCenter();
    map.addLayer(markerLayer);
    switchControl.addOverlay(markerLayer,"设备图层");
    map.flyTo(center, 18);
}
function addRaster2XQ(layer){
    markerLayer && (map.removeLayer(markerLayer),markerLayer.clearLayers());
    rasterLayer && (map.removeLayer(rasterLayer),rasterLayer.clearLayers());
    var southWest = layer.getBounds().getSouthWest(),
        northEast = layer.getBounds().getNorthEast();
    var latMin = southWest.lat,
        latMax = northEast.lat,
        lngMin = southWest.lng,
        lngMax = northEast.lng;
    for(var i= 0; i<8; ++i){
        var lat = Math.random()*(latMax-latMin) + latMin,
            lng = Math.random()*(lngMax-lngMin) + lngMin;
        var bounds = [[lat, lng], [lat+0.001, lng+0.001]];
        L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(markerLayer);
    }
    var center = layer.getBounds().getCenter();
    map.addLayer(markerLayer);
    switchControl.addOverlay(markerLayer,"栅格图层");
    map.flyTo(center, 18);
}
function addEquipment2XQReal(layer){
    var dmtBox = L.icon({iconUrl: 'images/dmt.png', iconSize: [60, 60]}),
        gjxBox = L.icon({iconUrl: 'images/gjx.png', iconSize: [60, 60]}),
        onuBox = L.icon({iconUrl: 'images/onu.png', iconSize: [60, 60]});
    var nameContent = layer._popup._content;
    markerLayer && (map.removeLayer(markerLayer),markerLayer.clearLayers());
    //console.log(nameContent);
    for(var i= 0,lenI=detailedData.length; i<lenI; ++i){
        var targetObj = detailedData[i];
        var name = targetObj.name;
        if(name === nameContent){
            for(var dataVal in targetObj){
                var targetArr = targetObj[dataVal];
                if(targetArr instanceof Array){
                    if(targetArr.length !== 0){
                        for(var j= 0,lenJ=targetArr.length; j<lenJ; ++j){
                            var lat = targetArr[j].lat,
                                lng = targetArr[j].lng;
                            var title = targetArr[j].name;
                            if(lat && lng){
                                var gcjPoint = wgs84togcj02(lng,lat);
                                var baiduPoint = gcj02tobd09(gcjPoint[0],gcjPoint[1]);
                                dataVal === 'dmtBox' && L.marker(baiduPoint.reverse(),{icon: dmtBox, title : title}).bindPopup(title).addTo(markerLayer);
                                dataVal === 'fqxBox' && L.marker(baiduPoint.reverse(),{icon: dmtBox, title : title}).bindPopup(title).addTo(markerLayer);
                                dataVal === 'gjxBox' && L.marker(baiduPoint.reverse(),{icon: gjxBox, title : title}).bindPopup(title).addTo(markerLayer);
                            }
                        }
                    }
                }
            }
            break;
        }
    }
    var center = layer.getBounds().getCenter();
    map.addLayer(markerLayer);
    switchControl.addOverlay(markerLayer,"设备图层");
    map.setView(center, 18);
}