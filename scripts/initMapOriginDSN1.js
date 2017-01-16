//判断对象是否为空
function isEmpty(obj){
    for (var name in obj){
        return false;
    }
    return true;
};
//判断字符是否为整数
function isNumber(obj){
    //var reg = new RegExp("^[0-9]$");
    if ( /^-?\d+$/.test(obj) || /^[0-9]+.?[0-9]*$/.test(obj)){
        //alert(obj+"是数字");
        return true;
    }else{
        //alert(obj+"不是数字");
        return false;
    }
}
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
        }else{
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
//添加扇形小区
function addSectorXQ(latlng,radius,start,stop){
    L.circle(latlng, radius, {
        fill: true,
        weight:1,
        className:name,
        fillColor:'#0000FF',
        fillOpacity: 0.5,
        color: '#0000FF',
        opacity: 0.9,
        startAngle: start,
        stopAngle: stop
    }).bindPopup('玩具总动员').addTo(sectorLayer);
    map.addLayer(sectorLayer);
}
//添加各环线高架路
function addMedianCycleRoad(){
    callLocalFile('jsons/nhgj.json');
    callLocalFile('jsons/zhgj.json');
    callLocalFile('jsons/whgj.json');
    callLocalFile('jsons/yagj.json');
    callLocalFile('jsons/nbgj.json');
    map.addLayer(cycleRoadLayer);
    switchControl.addOverlay(cycleRoadLayer,'高架桥');
}
function callLocalFile(strPath){
    $.ajax({
        url: strPath,
        type: 'GET',
        dataType: 'json',
        data: {}
    })
        .done(function(data){
            var targetArr = data.list;
            for(var i= 0,lenI=targetArr.length; i<lenI; ++i){
                var targetObj = targetArr[i];
                var id = targetObj.id;
                var pathCol = targetObj.path;
                var posCol = [];
                for(var j= 0,lenJ=pathCol.length; j<lenJ; ++j){
                    var latlng = gcj02tobd09(pathCol[j].lng,pathCol[j].lat).reverse();
                    posCol.push(latlng);
                }
                if(posCol.length <= 0) continue;
                var latVal = posCol[0][0],
                    lngVal = posCol[0][1];
                var popupContent = '经度:' + lngVal + '</br>纬度:' + latVal;
                addCustomMarker(latVal,lngVal);
                var randomNum = parseInt(Math.random()*(5-1)+1);
                var color = getColor(randomNum);
                var polyline = L.polyline(posCol, {color: 'darkblue'}).bindPopup(popupContent).addTo(cycleRoadLayer);
            }
        });
}
//添加各地铁线路
function addSubway(){
    callLocalFileSubway('jsons/line1.json');
    callLocalFileSubway('jsons/line2.json');
    callLocalFileSubway('jsons/line3.json');
    callLocalFileSubway('jsons/line4.json');
    callLocalFileSubway('jsons/line5.json');
    callLocalFileSubway('jsons/line6.json');
    callLocalFileSubway('jsons/line7.json');
    callLocalFileSubway('jsons/line8.json');
    callLocalFileSubway('jsons/line9.json');
    callLocalFileSubway('jsons/line10.json');
    callLocalFileSubway('jsons/line11.json');
    map.addLayer(subwayLayer);
    switchControl.addOverlay(subwayLayer,'地铁');
}
function callLocalFileSubway(strPath){
    $.ajax({
        url: strPath,
        type: 'GET',
        dataType: 'json',
        data: {}
    })
        .done(function(data){
            var targetArr = data.list;
            for(var i= 0,lenI=targetArr.length; i<lenI; ++i){
                var targetObj = targetArr[i];
                var id = targetObj.id;
                var pathCol = targetObj.path;
                var posCol = [];
                for(var j= 0,lenJ=pathCol.length; j<lenJ; ++j){
                    var latlng = gcj02tobd09(pathCol[j].lng,pathCol[j].lat).reverse();
                    posCol.push(latlng);
                }
                if(posCol.length <= 0) continue;
                var latVal = posCol[0][0],
                    lngVal = posCol[0][1];
                var popupContent = '经度:' + lngVal + '</br>纬度:' + latVal;
                //addCustomMarker(latVal,lngVal);
                var randomNum = parseInt(Math.random()*(5-1)+1);
                var color = getColor(randomNum);
                var polyline = L.polyline(posCol, {color: 'red'}).bindPopup(popupContent).addTo(subwayLayer);
            }
        });
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
        //maxBounds: bounds,
        zoomControl: false,
        attributionControl: false
    }).setView([31.148834,121.667138], 19);
    L.control.zoom({zoomInTitle: '放大', zoomOutTitle: '缩小'}).addTo(map);
    //自定义地图数据源
    //tileSize==512
    L.TileLayer.DSN1 = L.TileLayer.extend({
        getTileUrl: function (tilePoint) {
            return L.Util.template(this._url, L.extend({
                s: this._getSubdomain(tilePoint),
                z: tilePoint.z-1,
                x: tilePoint.x,
                y: tilePoint.y
            }, this.options));
        }
    });
    //tileSize==256
    L.TileLayer.DSN = L.TileLayer.extend({
        getTileUrl: function (tilePoint) {
            return L.Util.template(this._url, L.extend({
                s: this._getSubdomain(tilePoint),
                z: tilePoint.z,
                x: tilePoint.x,
                y: tilePoint.y
            }, this.options));
        }
    });
    var urlDSN = 'http://' + baseUrl + ':8080/sh/tilesDSN/newPicsOrigin/{z}/{x}/{y}.jpg';
    //var urlDSN = 'http://localhost:8080/tilesDSN/newPicsOrigin/{z}/{x}/{y}.jpg';
    //var urlDSN = 'https://secure.parksandresorts.wdpromedia.com/media/maps/prod/shdr-baidu/9/{z}/{x}/{y}.jpg';
    baseLayer = new L.TileLayer.DSN(urlDSN,{tileSize: 256, minZoom: 14, maxZoom: 22}).addTo(map);//瓦片无转换
    //baseLayer = L.tileLayer.baiduLayer('customLayerDSN.Map',{tileSize: 256, minZoom: 14, maxZoom: 21});//瓦片转换成百度原始形式
    normalLayer = new L.tileLayer.baiduLayer('customLayerNormalSH.Map');
    satelliteLayer = new L.tileLayer.baiduLayer('customLayerSatSH.Map');
    roadLayer = new L.tileLayer.baiduLayer('customLayerSatSH.Road');
    //添加图层控制器
    var baseLayers = {
        "迪斯尼": baseLayer,
        "地图": normalLayer,
        "卫星": satelliteLayer
    };
    switchControl = L.control.layers(baseLayers, [],{autoZIndex:false,position:'topright'}).addTo(map);
    map.addLayer(baseLayer);
    L.control.scale({position: 'bottomright', imperial: false}).addTo(map);	//添加比例尺
    //addCustomMarker(31.147534,121.663992);
    addSectorXQ([31.147534,121.663992],100,330,30);
    addSectorXQ([31.147534,121.663992],100,90,150);
    addSectorXQ([31.147534,121.663992],100,210,270);

    map.on('mousemove', onMouseMove);//注册鼠标悬浮地图事件
    map.on('baselayerchange', baseLayerChange);//注册底图切换事件
    //map.on('zoomend', rerenderHeatMap);//重新绘制热力图
    //addRectangleTool();//添加框选工具
    //console.timeEnd('test')
}
//重新绘制热力图
function rerenderHeatMap(){
    var curZoom = map.getZoom();
    if(curZoom === lastZoomLevel){
        //console.log('相等');
        return;
    }else{
        switch (curZoom){
            case 10:
                radiusHeatMap = 0.032;
                break;
            case 11:
                radiusHeatMap = 0.016;
                break;
            case 12:
                radiusHeatMap = 0.008;
                break;
            case 13:
                radiusHeatMap = 0.004;
                break;
            case 14:
                radiusHeatMap = 0.002;
                break;
            case 15:
                radiusHeatMap = 0.001;
                break;
            case 16:
                radiusHeatMap = 0.0009;
                break;
            case 17:
                radiusHeatMap = 0.0008;
                break;
        }
    }
    //console.log(radiusHeatMap);
    heatMapRender(cacheHeatMapData,radiusHeatMap);
    lastZoomLevel = curZoom;
}
//底图切换事件
function baseLayerChange(e){
    var curLayerName = e.name;
    var curZoom = map.getZoom();
    var curCenter = map.getCenter();
    if(curLayerName === '地图'){
        map.removeLayer(roadLayer);
        map.options.maxZoom = 18;
        map.options.minZoom = 10;
        if(curZoom>18){
            map.setView(curCenter,18);
        }
    }else if(curLayerName === '迪斯尼'){
        map.removeLayer(roadLayer);
        map.options.maxZoom = 21;
        map.options.minZoom = 14;
        if(curZoom<14){
            map.setView(curCenter,14);
        }
    }else{
        map.removeLayer(roadLayer);
        map.options.maxZoom = 18;
        map.options.minZoom = 10;
        if(curZoom>18){
            map.setView(curCenter,18);
        }
        map.addLayer(roadLayer);
    }
}
//接受手机参数切换底图事件
function getPhoneParas2baselayerChange(str){
    map.removeLayer(roadLayer);
    map.removeLayer(normalLayer);
    map.removeLayer(baseLayer);
    map.removeLayer(satelliteLayer);
    if(str === '卫星'){
        map.addLayer(satelliteLayer);
        map.addLayer(roadLayer);
    }else if(str === '地图'){
        map.addLayer(normalLayer);
    }else{
        map.addLayer(baseLayer);
    }
}
//接受手机定位参数设置地图
function getLocationParasAndLevel(lat,lng,level){
    map.setView([lat,lng],level);
}
//添加框选工具
function addRectangleTool(){
    //添加图形绘制控件，并注册鼠标绘制图形时的首次查询事件
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    L.drawLocal.draw.toolbar.buttons.rectangle = '框选';
    L.drawLocal.draw.toolbar.actions.text = '取消';
    L.drawLocal.draw.handlers.rectangle.tooltip.start = '拖动鼠标开始绘制';
    L.drawLocal.draw.handlers.simpleshape.tooltip.end = '释放鼠标结束绘制';
    L.drawLocal.edit.toolbar.buttons.edit = '编辑';
    L.drawLocal.edit.toolbar.actions.save.text = '保存';
    L.drawLocal.edit.toolbar.actions.cancel.text = '取消';
    L.drawLocal.edit.handlers.edit.tooltip.text = '点击节点开始编辑';
    L.drawLocal.edit.handlers.edit.tooltip.subtext = '';
    var drawControl = new L.Control.Draw({
        draw: {
            position: 'topleft',
            rectangle:{
                title:'Query By Rectangle',
                shapeOptions:{
                    color: '#252c34',
                    fill: false
                }
            },
            polygon: false,
            polyline: false,
            circle: false,
            marker:false
        },
        edit: {
            featureGroup: sectorLayer,
            edit: {
                selectedPathOptions: {
                    maintainColor: true,
                    opacity: 0.9
                }
            },
            remove: false
        }
    });
    map.addControl(drawControl);
    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer;
        //根据图层类别，在这儿定义查询事件
        if (type === 'rectangle' ){
            var bounds=layer.getBounds();
            var northWestO = bounds.getNorthWest();//获取矩形左上角坐标
            var southEastO = bounds.getSouthEast();//获取矩形右下角坐标
            var northWest = bd09towgs84(northWestO.lng,northWestO.lat),
                southEast = bd09towgs84(southEastO.lng,southEastO.lat);
            //console.log('百度：',northWestO,southEastO);
            //console.log('转换：',northWest,southEast);
            var maxLng = southEast[0],
                minLng = northWest[0],
                maxLat = northWest[1],
                minLat = southEast[1];
            if(detailedInfoVector.length === 0){
                queryByRectangle(maxLat,maxLng,minLat,minLng);//传wgs84坐标
            }else{
                resultQueryByRectangle(northWestO.lat,southEastO.lng,southEastO.lat,northWestO.lng);//传百度坐标
            }

        }
        //drawnItems.addLayer(layer);//是否显示所绘形状
    });
    map.on('draw:edited', function (e) {
        var layers = e.layers;
        //console.log(layers)
        layers.eachLayer(function (layer) {
            console.log(layer)
        });
    });
}
//框选查询
function queryByRectangle(maxLat,maxLng,minLat,minLng) {
    districtsLayer && (map.removeLayer(districtsLayer),districtsLayer.clearLayers());
    temLayer && (map.removeLayer(temLayer), temLayer.clearLayers());
    //ajax方式获取数据
    //var temUrl = "http://" + baseUrl + ":8080/services/ws/fast_query/gis/kpi/findGridCell?business_circles_name="+encodeURIComponent(heatIndexDis) +"&minLongitude=" +minLng +"&minLatitude=" +minLat + "&maxLongitude=" + maxLng +"&maxLatitude=" + maxLat;
    var temUrl = "http://" + baseUrl + ":8080/services/ws/fast_query/gis/kpi/findGridCells?minLongitude=" +minLng +"&minLatitude=" +minLat + "&maxLongitude=" + maxLng +"&maxLatitude=" + maxLat;
    //console.log("http://"+baseUrl+":8080/services/ws/fast_query/gis/kpi/findGridCell?business_circles_name="+encodeURIComponent(heatIndexDis) +"&minLongitude=" +minLng +"&minLatitude=" +minLat + "&maxLongitude=" + maxLng +"&maxLatitude=" + maxLat)
    $.ajax({
        url: temUrl,
        type: 'GET',
        dataType: 'json',
        data: {},
        beforeSend: function(XMLHttpRequest){
            document.getElementById('loading').style.visibility = 'visible';
            $('#loading').html("<img src='images/loading.gif' />");
        },
        complete: function(XMLHttpRequest,textStatus){
            document.getElementById('loading').style.visibility = 'hidden';
            $('#loading').empty();
        }
        //data: {business_circles_name:encodeURIComponent(heatIndexDis),minLongitude:minLng,minLatitude:minLat,maxLongitude:maxLng,maxLatitude:maxLat ,uuid:Math.random()}
    })
        .done(function(data){
            //console.log(data)
            var lengthRows = data.length;
            //console.log(temUrl);
            //alert(lengthRows);
            for(var i=0;i<lengthRows;i++){
                var cell_longitude = parseFloat(data[i].cell_longitude),
                    cell_latitude = parseFloat(data[i].cell_latitude);
                //console.log(cell_latitude,cell_longitude)
                if(cell_latitude != "" && cell_longitude != "" && cell_latitude != " " && cell_longitude != " "){
                    var bdPoint = wgs84tobd09(cell_longitude,cell_latitude);
                    //通过最大最小坐标，产生随机坐标，并绘制marker
                    var latMax = cell_latitude + 0.002,
                        latMin = cell_latitude - 0.002,
                        lngMax = cell_longitude + 0.002,
                        lngMin = cell_longitude - 0.002;
                    //var point = L.latLng(Math.random()*(latMax-latMin)+latMin, Math.random()*(lngMax-lngMin)+lngMin);
                    var point = [bdPoint[1],bdPoint[0]];
                    // marker的title属性,同时也是传参的cellName
                    var popupContent = data[i].cell_name;
                    var typeMarker = data[i].cell_nt;
                    var idValue = data[i].lacci;
                    var lacci = data[i].lacci;
                    if(lacci.indexOf('-') !== -1){
                        lacci = lacci.replace('-',':');
                    }
                    //为detailedeInfoVector数组赋值
                    var temObj = {
                        point: point,
                        name: popupContent,
                        type: typeMarker,
                        id: idValue,
                        lacci: lacci
                    };
                    detailedInfoVector.push(temObj);
                    //为小区绑定popup
                    var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
                        .setLatLng(point);
                    heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pages/sitePieCharts.html?"+lacci+"!"+encodeURIComponent(heatIndexDis) + "&" + encodeURIComponent(popupContent) +'></iframe>');
                    var marker = L.marker(point,{title: popupContent, icon: createMarkers(typeMarker),keepInView:true});
                    marker.bindPopup(heatPopup);
                    districtsLayer.addLayer(marker);
                }
                else{
                    continue;
                }
            }
            map.addLayer(districtsLayer);
            //为框选到的小区添加列表
            callListFromXiaoQu();
        });
}
function resultQueryByRectangle(maxLat,maxLng,minLat,minLng){
    districtsLayer && (map.removeLayer(districtsLayer),districtsLayer.clearLayers());
    temLayer && (map.removeLayer(temLayer), temLayer.clearLayers());
    var temDetailed = [];
    //console.log(minLat);
    for(var i= 0,lenI=detailedInfoVector.length;i<lenI;i++){
        var latLng = detailedInfoVector[i].point;
        var popupContent = detailedInfoVector[i].name;
        var typeMarker = detailedInfoVector[i].type;
        var idValue = detailedInfoVector[i].id;
        var lacci = detailedInfoVector[i].lacci;
        var latValue = latLng[0];
        var lngValue = latLng[1];
        //console.log(latValue);
        if(latValue >= minLat && latValue<= maxLat && lngValue>= minLng && lngValue<= maxLng){
            var temObj = {
                point: latLng,
                name: popupContent,
                type: typeMarker,
                id: idValue,
                lacci: lacci
            };
            temDetailed.push(temObj);
            //为小区绑定popup
            var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
                .setLatLng(latLng);
            heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pages/sitePieCharts.html?"+lacci+"!"+encodeURIComponent(heatIndexDis) + "&" + encodeURIComponent(popupContent) +'></iframe>');
            var marker = L.marker(latLng,{title: popupContent, icon: createMarkers(typeMarker),keepInView:true});
            marker.bindPopup(heatPopup);
            districtsLayer.addLayer(marker);
        }
    }
    var arrDistrictsLayer = districtsLayer.getLayers();//如果二次查询没有查到数据，则从后台重新查询
    //console.log(districtsLayer);
    if(arrDistrictsLayer.length > 0){
        //console.log('二次查询查到');
        map.addLayer(districtsLayer);
        //清空detailedInfoVector,并重新赋值
        detailedInfoVector = [];
        detailedInfoVector = detailedInfoVector.concat(temDetailed);
        //为第二次框选到的小区添加列表
        callListFromXiaoQu();
    }else{
        //console.log('二次查询没查到');
        var northEast = bd09towgs84(maxLng,maxLat),
            southWast = bd09towgs84(minLng,minLat);
        queryByRectangle(northEast[1],northEast[0],southWast[1],southWast[0]);
    }
}
//为框选到的小区添加列表
function callListFromXiaoQu(){
    var div = $('#win');
    document.getElementById("win").style.visibility = "visible";
    div.window({
        title:" ",
        closed:false,
        modal:false,
        minimizable:false,
        border:false,
        shadow:false,
        maximizable:false,
        collapsible:false,
        closable:true,
        resizable:false,
        left:880,
        top:50,
        width:350,
        height:390
    });
    div.html( '<iframe width="320px" frameborder=no height="340px" src="pages/rectangleQueryListDistrictsF.html?"></iframe>');
}
//框选到的小区定位
function addHeatPopupFromList(str,indexName) {
    temLayer && (map.removeLayer(temLayer), temLayer.clearLayers());
    var lengthRows = detailedInfoVector.length;
    for(var i=0; i<lengthRows; i++){
        var cellName = detailedInfoVector[i].name;
        if(cellName === str){
            var point = detailedInfoVector[i].point;
            var typeMarker = detailedInfoVector[i].type;
            var lacci = detailedInfoVector[i].lacci;
            var popupContent = detailedInfoVector[i].name;
            //为小区绑定popup
            var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
                .setLatLng(point);
            heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pages/sitePieCharts.html?"+lacci+"!"+encodeURIComponent(heatIndexDis) + "&" + encodeURIComponent(popupContent) +'></iframe>');
            var marker = L.marker(point,{title: cellName,riseOnHover:true, icon: createLocatedMarkers(typeMarker)});
            marker.bindPopup(heatPopup);
            temLayer.addLayer(marker);
            map.setView(point,17);
            map.addLayer(temLayer);
            return;
        }
    }
}
//保存框选到的小区到后台作为自定义热点
function updateHeatCell(checkArr,heatName){
    //customHeatName = '自定义热点-' + heatName;
    var resultArr = [];
    for(var j= 0, lenJ=checkArr.length; j<lenJ; ++j){
        var temVal = checkArr[j];
        for(var i= 0, lenI=detailedInfoVector.length; i<lenI; ++i){
            var name = detailedInfoVector[i].name;
            if(temVal == name){
                var lacci = detailedInfoVector[i].lacci;
                var pos = lacci.indexOf(':');
                if(pos !== -1){
                    var lac = lacci.slice(0,pos);
                    var ci = lacci.slice(pos+1);
                    var valLacci = lac + '-' + ci;
                }else{
                    var lac = '';
                    var ci = '';
                    var valLacci = '';
                }
                var point = detailedInfoVector[i].point;
                var lat = point[0].toString(),
                    lng = point[1].toString();
                var type = detailedInfoVector[i].type;
                var temObj = {
                    //business_circles_id: Math.floor(Math.random()*10000),
                    business_circles_name: '自定义热点-' + heatName,
                    lac: lac,
                    ci: ci,
                    lacci: valLacci,
                    cell_longitude: lng,
                    cell_latitude: lat,
                    cell_nt: type,
                    cell_name: name,
                    cell_id: lacci,
                    data_source: '',
                    insert_timestamp: '',
                    cell_sd_name: '',
                    carriers: ''
                };
                resultArr.push(temObj);
                break;
            }
        }
    }
    //console.log(resultArr)
    var resultObj = {"dbId":"inas","type":"insert","tableName":"META_HOLIDAY_BUSINESS_CIRCLES_CELL_INFO ","datas":resultArr};
    $.ajax({
        url:'http://'+baseUrl+':8080/services/ws/fast_update/common', //后台处理程序
        type:'post',         //数据发送方式
        dataType:'json',     //接受数据格式
        contentType: "application/json",
        accessType: "application/json",
        data: JSON.stringify(resultObj),         //要传递的数据
        beforeSend: function(XMLHttpRequest){
            document.getElementById('loading').style.visibility = 'visible';
            $('#loading').html("<img src='images/loading.gif' />");
        },
        complete: function(XMLHttpRequest,textStatus){
            document.getElementById('loading').style.visibility = 'hidden';
            $('#loading').empty();
        },
        success: function(data){
            alert('保存成功');
            addCustomHeatMenu(false);//立即刷新自定义热点
            //console.log(data)
            //setTimeout(addTrendPlotFromChild,1000*60);
            //addTrendPlotFromChild(customHeatName);
        },
        error: function(e){
            alert('保存失败');
        }
    });
}
//获得当前时间倒推n分钟
function getCurrentTimeMin(n){
    var nowDate = new Date();
    var min = nowDate.getMinutes(),
        hour = nowDate.getHours(),
        date = nowDate.getDate(),
        month = nowDate.getMonth() + 1 ,
        year = nowDate.getFullYear();
    //min<n && (hour -= 1, min = min + 60 - n);
    if(hour === 0){
        hour += 24;
    }
    if(min<n){
        hour -= 1;
        //if(hour<0) hour += 1;
        min = min + 60 - n;
    }
    min<n || ( min -= n);
    if(hour === 24){
        hour = 0;
    }
    var result = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + '00';
    //console.log(result)
    return result;
}
//获得当前时间倒推n小时
function getCurrentTimeHour(n){
    var nowDate = new Date();
    var min = nowDate.getMinutes(),
        hour = nowDate.getHours(),
        date = nowDate.getDate(),
        month = nowDate.getMonth() + 1 ,
        year = nowDate.getFullYear();
    //var hour = 2;
    if(hour < n){
        hour += 24;
    }
    hour -= n;
    if(hour === 24) {
        hour = 0;
    }
    if(min <10){
        min = '0' + min;
        if(hour <0){
            hour = 0;
        }
    }
    var result = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + '00';
    //console.log(result)
    return result;
}
//合并对象数组中的重复元素
function mergeSame(arr,para1,para2){
    var newArr = [],
        n = 0;
    for (var i = 0,lenI=arr.length; i <lenI; i++) {
        if(i<lenI-1){
            if (arr[i][para1] !== arr[i + 1][para1] || arr[i][para2] !== arr[i + 1][para2]) {
                newArr.push(arr.slice(n, i + 1));
                n = i + 1;
            }
        }else{
            newArr.push(arr.slice(n, i + 1));
        }
    }
    //console.log(newArr);
    var resultArr = [];
    for(var j= 0,lenJ=newArr.length; j<lenJ; ++j){
        var temArr = newArr[j];
        var temVal = 0;
        //console.log(temArr);
        for(var k= 0,lenK=temArr.length; k<lenK; ++k){
            temVal += temArr[k].value;
        }
        var temObj ={
            lat: temArr[0].lat,
            lng: temArr[0].lng,
            value: temVal
        };
        resultArr.push(temObj);
    }
    return resultArr;
    //console.log(resultArr);
}
//对象数组按照指定的字段进行排序
function keySort(name) {
    //return function(a,b){
    //    return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
    //}
    return  function(o,p){
        var a, b;
        if (typeof o === "object"  && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a > b ? -1 : 1;
            }
            return typeof a > typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}
//找到数组中的重复元素
function findDuplicates(arr) {
    var temArr = arr.sort();
    var newArr = [];
    for(var i= 0,lenI=temArr.length;i<lenI; ++i ){
        var isRepeated = 0;
        var val = temArr[i];
        for(var j=i+1;j<lenI; ++j ){
            if (val === temArr[j]){
                isRepeated += 1;
            }
        }
        if(isRepeated>0){
            if(newArr.length >0){
                if(val !== newArr[newArr.length-1]){
                    newArr.push(val);
                }
            }else{
                newArr.push(val);
            }
        }
    }
    //console.log(newArr);
    return newArr;
}
//添加自定义marker
function addCustomMarker(lat,lng){
    var myIcon = new L.icon({
        iconUrl: 'images/marker-icon.png',
        iconRetinaUrl: 'images/marker-icon@2x.png',
        iconSize: [25, 41],
        //iconAnchor: [22, 94],
        popupAnchor: [-3, -6],
        shadowUrl: 'images/marker-shadow.png',
        shadowRetinaUrl: 'images/marker-shadow@2x.png',
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });
    var popupContent = '经度:' + lng + '</br>纬度:' + lat;
    L.marker([lat,lng], {icon: myIcon}).bindPopup(popupContent).addTo(cycleRoadLayer);
}
function createMarkers(type){
    //自定义图标
    var marker2G = L.icon({
        iconUrl: 'images/2G.png',
        iconSize: [35, 35]
    });
    var marker3G = L.icon({
        iconUrl: 'images/3G-1.png',
        iconSize: [35, 35]
    });
    var marker4G = L.icon({
        iconUrl: 'images/4G-2.png',
        iconSize: [35, 35]
    });
    if(type === '2G'){
        return marker2G;
    }else if(type === '3G'){
        return marker3G;
    }else{
        return marker4G;
    }
}
function createLocatedMarkers(type){
    var marker2GGreen = L.icon({
        iconUrl: 'images/2GGreen.png',
        iconSize: [35, 35]
    });
    var marker3GGreen = L.icon({
        iconUrl: 'images/3GGreen.png',
        iconSize: [35, 35]
    });
    var marker4GGreen = L.icon({
        iconUrl: 'images/4GGreen.png',
        iconSize: [35, 35]
    });
    if(type === '2G'){
        return marker2GGreen;
    }else if(type === '3G'){
        return marker3GGreen;
    }else{
        return marker4GGreen;
    }
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
//后台请求入口函数，添加各种覆盖物至地图
function addXQ2Map(str){
    markersLayer && (map.removeLayer(markersLayer),markersLayer.clearLayers(),switchControl.removeLayer(markersLayer));
    //heatMapLayer && (switchControl.removeLayer(heatMapLayer), map.removeLayer(heatMapLayer));
    var urlCluster = "http://"+baseUrl+":8080/services/ws/rest/bchol/select_cellinfo?name="+encodeURIComponent(str)+"&page=1&limit=10000";
    addMarkerClusters(urlCluster,str);
}
function addMarkerClusters(url,hotspot){
    var heatMap = []; //全局变量,存放热点图的数据
    $.ajax({
        url: url,
        type: 'get',         //数据发送方式
        dataType: 'json',     //接受数据格式
        contentType: "application/json",
        accessType: "application/json",
        data:{},
        beforeSend: function(XMLHttpRequest){
            document.getElementById('loading').style.visibility = 'visible';
            $('#loading').html("<img src='images/loading.gif' />");
        },
        complete: function(XMLHttpRequest,textStatus){
            document.getElementById('loading').style.visibility = 'hidden';
            $('#loading').empty();
        }
    })
        .done(function(data){
            if(isEmpty(data) || data.rows.length <= 0){
                alert('暂无坐标数据');
                return;
            }
            detailedInfoVector = [];
            for(var i= 0, len = data.rows.length; i<len;++i){
                if (data.rows[i].cellLatitude !="" && data.rows[i].cellLongitude != "") {
                    var latHeatMap = parseFloat(data.rows[i].cellLatitude),
                        lngHeatMap = parseFloat(data.rows[i].cellLongitude);
                    //var point = L.latLng(latHeatMap,lngHeatMap);
                    //根据小区原坐标产生随机坐标
                    if(isNumber(latHeatMap) && isNumber(lngHeatMap)){
                        var bdPoint = wgs84tobd09(lngHeatMap,latHeatMap);
                        //var bdPoint = [lngHeatMap,latHeatMap];
                        var latMin = bdPoint[1]-0.0008,
                            latMax = bdPoint[1]+0.0008,
                            lngMin = bdPoint[0]-0.0008,
                            lngMax = bdPoint[0]+0.0008;
                        //var point = L.latLng(Math.random()*(latMax-latMin)+latMin, Math.random()*(lngMax-lngMin)+lngMin);
                        //var point = L.latLng(bdPoint[1], bdPoint[0]);
                        var point = bdPoint.reverse();
                        var lac = data.rows[i].lac;
                        var ci = data.rows[i].ci;
                        var lacci = lac + ':' + ci;
                        var name = data.rows[i].cellName;
                        var type = data.rows[i].cellNt;
                        var temObj = {
                            lacci: lacci,
                            id: lacci,
                            point: point,
                            name: name,
                            lat: point[0],
                            lng: point[1],
                            type: type
                        };
                        heatMap.push(temObj);//cacheHeatMapData部分值
                        detailedInfoVector.push(temObj);//为detailedeInfoVector数组赋值
                    }else{
                        continue;
                    }
                }
            }
            //console.log(heatMap)
            beginAddXQ(heatMap,hotspot);
            addResultNow(heatMap,hotspot);//当前热力图渲染
        });
}
function beginAddXQ(arr,hotspot){
    //自定义图标
    var marker2G = L.icon({
        iconUrl: 'images/2G.png',
        iconSize: [35, 35]
    });
    var marker3G = L.icon({
        iconUrl: 'images/3G-1.png',
        iconSize: [35, 35]
    });
    var marker4G = L.icon({
        iconUrl: 'images/4G-2.png',
        iconSize: [35, 35]
    });
    for(var i= 0, lenI=arr.length; i<lenI; ++i){
        var lat = arr[i].lat,
            lng = arr[i].lng;
        var type = arr[i].type,
            name = arr[i].name,
            lacci = arr[i].lacci;
        var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
            .setLatLng([lat,lng]);
        heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pages/sitePieCharts.html?"+lacci+"!"+encodeURIComponent(hotspot) + "&" + encodeURIComponent(name) +'></iframe>');
        type === '4G' && (L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        type === '3G' && (L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        type === '2G' && (L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
    }
    var center = [lat,lng];
    hotspot === '交通枢纽' && (center = [31.195769,121.338157]);
    map.panTo(center,{});
    map.addLayer(markersLayer);
    switchControl.addOverlay(markersLayer,"小区图层");
}
//当前热力图渲染
function addResultNow(arr,heatIndexDis){
    var heatIndexName = '业务用户数';
    var time = getCurrentTimeMin(15);//当前热力图渲染时间
    var url;
    var heatMap = [];
    heatIndexName === '信令用户数' && (url = 'http://' + baseUrl + ':8080/stream/totalnum/sites?time=' + time + '&hotspot=' + encodeURIComponent(heatIndexDis));
    heatIndexName === '业务用户数' && (url = 'http://' + baseUrl + ':8080/stream/usernum/sites?time=' + time + '&hotspot=' + encodeURIComponent(heatIndexDis));
    $.ajax({
        url: url,
        type: 'get',         //数据发送方式
        dataType: 'json',     //接受数据格式
        contentType: "application/json",
        accessType: "application/json",
        data:{}
    })
        .done(function(data){
            if(isEmpty(data)){
                alert('暂无用户数据');
                return;
            }
            for(var name in data){
                if(data.hasOwnProperty(name)){
                    for(var i= 0, len=arr.length; i<len; ++i){
                        if(name === arr[i].lacci){
                            var value = data[name].total;
                            if(value !== undefined){
                                arr[i].value = value;
                            }else{
                                arr[i].value = 0;
                            }
                            break;
                        }else{
                            continue;
                        }
                    }
                }
            }
            heatMap = arr;
            heatMapRender(heatMap,radiusHeatMap);
        });
}
function heatMapRender (temArr,radius) {
    cacheHeatMapData = [];
    var heatMap = mergeSame(temArr.sort(keySort('lat')),'lat','lng');
    //console.log(heatMap);
    if (map.hasLayer(heatMapLayer)){
        switchControl.removeLayer(heatMapLayer);
        map.removeLayer(heatMapLayer);
    }
    var testData = new Object();
    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        "radius": radius,
        "maxOpacity": 1,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'value'
    };
    var maxHeatValue = 0;
    var minHeatValue = 0;
    var sum =0;
    for (var i= 0,len =heatMap.length; i<len; i++){
        var temVal = heatMap[i].value;
        var lat = heatMap[i].lat,
            lng = heatMap[i].lng;
        if(!isNumber(temVal)){
            heatMap[i].value = 0;
        }
        sum = sum + heatMap[i].value;
        if (maxHeatValue < temVal){
            maxHeatValue = temVal;
        }
        if (minHeatValue > temVal){
            minHeatValue = temVal;
        }
    }
    cacheHeatMapData = heatMap;
    var aveHeatValue = Math.ceil(sum/heatMap.length);
    testData={max: maxHeatValue, min: minHeatValue, data: heatMap};
    //console.log(testData);
    heatMapLayer = new HeatmapOverlay(cfg);
    map.addLayer(heatMapLayer);
    heatMapLayer.setData(testData);
    //map.removeLayer(heatMapLayer);
    switchControl.addOverlay(heatMapLayer,"热力图");
}
//根据坐标网格化地图
function addWangGe(){
    var x1 = 31.94256;
    var y1 = 120.92651;
    var x2 = 30.61350;
    var y2 = 122.104797;
    //绘制4边型
    var lineStyle = {color:'gray' , weight : 1, opacity: 0.3};
    //x经度
    for(var i = y1; i < y2; i+= 0.018728587500000145){
        L.polyline([[x1,i],[x2,i]], lineStyle).addTo(rasterLayer);
    }
    L.polyline([[x1,y2],[x2,y2]], lineStyle).addTo(rasterLayer);
    //y纬度
    for(var i = x1; i > x2; i-= 0.016613250000000024){
        L.polyline([[i,y1],[i,y2]], lineStyle).addTo(rasterLayer);
    }
    //L.polyline([[x2,y1],[x2,y2]], lineStyle).addTo(rasterLayer);
    map.addLayer(rasterLayer);
    //console.log((122.104797-120.92651)/80);
    //console.log((31.94256-30.61350)/80);
}
//动态添加TOP小区和场馆信息
function getDetailedInfo(){
    $('#nameXQ').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'中国博览会'+'\')">' + '中国博览会' + '</a></div>');
    $('#valueXQ').append('<div class="custom-detailed-info">' + '5234' + '</div>');
    $('#nameXQ').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'虹桥枢纽'+'\')">' + '虹桥枢纽' + '</a></div>');
    $('#valueXQ').append('<div class="custom-detailed-info">' + '4234' + '</div>');
    $('#nameXQ').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'虹口足球场'+'\')">' + '虹口足球场' + '</a></div>');
    $('#valueXQ').append('<div class="custom-detailed-info">' + '3234' + '</div>');
    $('#nameXQ').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'上海南站'+'\')">' + '上海南站' + '</a></div>');
    $('#valueXQ').append('<div class="custom-detailed-info">' + '2234' + '</div>');
    $('#nameXQ').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'大宁商圈'+'\')">' + '大宁商圈' + '</a></div>');
    $('#valueXQ').append('<div class="custom-detailed-info">' + '1234' + '</div>');

    $('#nameCG').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'交通枢纽'+'\')">' + '交通枢纽' + '</a></div>');
    $('#valueCG').append('<div class="custom-detailed-info">' + '5634' + '</a></div>');
    $('#nameCG').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'寺庙'+'\')">' + '寺庙' + '</div>');
    $('#valueCG').append('<div class="custom-detailed-info">' + '4734' + '</a></div>');
    $('#nameCG').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'商业场所'+'\')">' + '商业场所' + '</div>');
    $('#valueCG').append('<div class="custom-detailed-info">' + '3834' + '</div>');
    $('#nameCG').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'游玩场所'+'\')">' + '游玩场所' + '</a></div>');
    $('#valueCG').append('<div class="custom-detailed-info">' + '2294' + '</div>');
    $('#nameCG').append('<div class="custom-detailed-info"><a href="#" onclick="locate2Target(\''+'收费站'+'\')">' + '收费站' + '</a></div>');
    $('#valueCG').append('<div class="custom-detailed-info">' + '1274' + '</div>');
}
//TOP小区和场馆定位
function locate2Target(str){
    var lat = Math.random()*(31.151598-31.143115) + 31.143115,
        lng = Math.random()*(121.671044-121.661378) + 121.661378;
    map.setView([lat,lng],18);
    var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
        .setLatLng([lat,lng]);
    heatPopup.setContent('<iframe width="410px" frameborder=no height="300px" src='+"pages/queryImportantInfo.html?name=" + encodeURIComponent(str) + '></iframe>');
    map.openPopup(heatPopup);
}
//动态加载导航菜单
function addDynamicMenu(arr){
    var headMenuArr = [],
        idArr = [];
    for(var i= 0,lenI=arr.length-1; i<lenI; ++i){
        var temObj = arr[i];
        headMenuArr.push(temObj.name);
        var secondMenuArr = temObj.infos;
        var id = addSecondMenu(secondMenuArr,i);
        idArr.push(id);
    }
    addHeadMenu(headMenuArr,idArr);
    addCustomHeatMenu(true);//自定义菜单另外加载,首次加载时须初始化一级菜单
    $('#secondMenu :button').on('click',function(){
        heatIndexDis = this.value;
        addXQ2Map(heatIndexDis);
        hideIndexDIV();
    });
}
function addSecondMenu(arr,num){
    var dataCount = arr.length;//总数据量
    var trCount = (parseInt(dataCount/2) === (dataCount/2))? parseInt(dataCount/2):parseInt(dataCount/2)+1;
    var htmlStr = '<table class="table">';
    for(var i=0;i<trCount;i++){
        htmlStr += '<tr>';
        var i1 = parseInt(2*i),
            i2 = parseInt(2*i+1);
        var data1 = arr[i1];
        htmlStr += '<td><input type="button" style="width:156px"  class="btn btn-small btn-info "   background-image=""  value="'+data1+'" align="middle" /></td>';
        if( dataCount%2 !== 0 && i === trCount-1){
            htmlStr += '<td></td>'
        }else{
            var data2 = arr[i2];
            htmlStr += '<td><input type="button" style="width:156px"  class="btn btn-small btn-info "   background-image=""  value="'+data2+'" align="middle" /></td>';
        }
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    var id = 'Menu' + num;
    var myDiv = document.createElement('div');
    myDiv.setAttribute('id',id);
    num === 0 && (myDiv.className = 'tab-pane active');
    num === 0 || (myDiv.className = 'tab-pane');
    myDiv.innerHTML = htmlStr;
    document.getElementById('secondMenu').appendChild(myDiv);
    return id;
}
function addHeadMenu(nameArr,menuArr){
    var headMenu = document.createDocumentFragment();
    for(var i= 0,lenI=nameArr.length; i<lenI; ++i){
        var name = nameArr[i],
            id = menuArr[i];
        var temStr = '<a href="#' + id + '\"data-toggle="tab">' + name + '</a>';
        var li= document.createElement("li");
        li.innerHTML = temStr;
        i === 0 && (li.className = 'active');
        headMenu.appendChild(li);
    }
    document.getElementById('dynamicMenu').appendChild(headMenu);
}
function addCustomHeatMenu(flag){
    //alert('自定义热点加载完成啦!');
    reloadCustomMenu(flag);
}
function reloadCustomMenu(flag){
    var  httpUrl="http://"+baseUrl+":8080/services/ws/fast_query/eaebm/cfg/bsZdyHotname?uuid=" + Math.random();
    $.getJSON(httpUrl, function (data) {
        //二级菜单
        var dataCount=data.length;//总数据量
        var trCount = (parseInt(dataCount/2) === (dataCount/2))? parseInt(dataCount/2):parseInt(dataCount/2)+1;
        var htmlStr = '<table class="table" id="zidingyi">';
        //console.log(data);
        for(var i=0;i<trCount;i++){
            htmlStr += '<tr>';
            var i1 = parseInt(2*i),
                i2 = parseInt(2*i+1);
            var data1 = data[i1].business_circles_name.replace("自定义热点-","");
            htmlStr += '<td><input type="button" style="width:156px"  class="btn btn-small btn-info "   background-image=""  value="'+data1+'" align="middle" /></td>';
            if( dataCount%2 !== 0 && i === trCount-1){
                htmlStr += '<td></td>'
            }else{
                var data2 = data[i2].business_circles_name.replace("自定义热点-","");
                htmlStr += '<td><input type="button" style="width:156px"  class="btn btn-small btn-info "   background-image=""  value="'+data2+'" align="middle" /></td>';
            }
            htmlStr += '</tr>';
        }
        htmlStr += '</table>';
        if(flag){
            var myDiv = document.createElement('div');
            myDiv.setAttribute('id','ZDY');
            myDiv.className = 'tab-pane';
            myDiv.innerHTML = htmlStr;
            document.getElementById('secondMenu').appendChild(myDiv);
            //首次添加则需先增加一级菜单
            var temStr = '<a href="#' + 'ZDY' + '\"data-toggle="tab">' + '自定义热点' + '</a>';
            var li= document.createElement("li");
            li.innerHTML = temStr;
            document.getElementById('dynamicMenu').appendChild(li);
        }else{
            //非第一次添加则先移除二级菜单再添加，一级菜单不用添加
            var customDiv = document.getElementById("ZDY");
            customDiv != null && (customDiv.parentNode.removeChild(customDiv));
            //添加
            var myDiv = document.createElement('div');
            myDiv.setAttribute('id','ZDY');
            myDiv.className = 'tab-pane';
            myDiv.innerHTML = htmlStr;
            document.getElementById('secondMenu').appendChild(myDiv);
        }
        //添加单击事件
        $('#zidingyi :button').on('click',function(){
            var temVal = this.value;
            heatIndexDis = '自定义热点-' + temVal ;
            addXQ2Map(heatIndexDis);
            hideIndexDIV();
        });
        //alert('自定义热点加载完成啦!');
    });
}
//记忆转换法
function wgs84tobd09(lng,lat){
    var temArr = wgs84togcj02(lng,lat);
    return gcj02tobd09(temArr[0],temArr[1]);
}