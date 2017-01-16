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
function getSectorColor(type){
    var color = '';
    switch (type){
        case '4G':
            color = 'red';
            break;
        case '3G':
            color = 'blue';
            break;
        case '2G':
            color = 'green';
            break;
    }
    return color;
}
//添加扇形小区
function addSectorXQ(latlng,radius,start,stop,name,lacci,hotspot,hotId,type){
    var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
        .setLatLng(latlng);
    //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');
    heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

    var color = getSectorColor(type);
    //console.log(type);
    L.circle(latlng, radius, {
        fill: true,
        weight:1,
        className:name,
        fillColor: color,
        fillOpacity: 0.5,
        color: color,
        opacity: 0.9,
        startAngle: start,
        stopAngle: stop
    }).bindPopup(heatPopup).addTo(sectorLayer);
    //map.addLayer(sectorLayer);
}
//添加各环线高架路
function addMedianCycleRoad(){
    callLocalFile('jsons/nhgj.json',roadNH);
    callLocalFile('jsons/zhgj.json',roadZH);
    callLocalFile('jsons/whgj.json',roadWH);
    callLocalFile('jsons/yagj.json',roadYA);
    callLocalFile('jsons/nbgj.json',roadNB);

    addAllRoadInfos(roadNH,'内环高架','高架桥');
    addAllRoadInfos(roadZH,'中环高架','高架桥');
    addAllRoadInfos(roadWH,'外环高架','高架桥');
    addAllRoadInfos(roadYA,'延安路高架','高架桥');
    addAllRoadInfos(roadNB,'南北高架','高架桥');
}
function addAllRoadInfos(temLayer,layerName,groupName){
    map.addLayer(temLayer);
    switchControl.addOverlay(temLayer,layerName,groupName);
}
function callLocalFile(strPath,temLayer){
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
                //console.log(pathCol);
                var posCol = [];
                for(var j= 0,lenJ=pathCol.length; j<lenJ; ++j){
                    var latlng = gcj02tobd09(pathCol[j].lng,pathCol[j].lat).reverse();
                    //addCustomMarker(latlng[0],latlng[1],temLayer);
                    posCol.push(latlng);
                }
                if(posCol.length <= 0) continue;
                var latVal = posCol[0][0],
                    lngVal = posCol[0][1];
                var popupContent = '经度:' + lngVal + '</br>纬度:' + latVal;
                //addCustomMarker(latVal,lngVal,temLayer);
                var randomNum = parseInt(Math.random()*(5-0)+0);
                var color = getRandomColorSubway(randomNum);
                //console.log(color);
                var polyline = L.polyline(posCol, {color: color, weight: 10}).bindPopup(popupContent).addTo(temLayer);
            }
        });
}
function getRandomColorSubway(d){
    if(d === 0){
        return 'red';
    }else if (d === 1){
        return 'yellow';
    }else if(d === 2){
        return 'blue';
    }else{
        return 'green';
    }
}
//添加各地铁线路
function addSubway(){
    callLocalFileSubway('jsons/line1.json',subway1);
    callLocalFileSubway('jsons/line2.json',subway2);
    callLocalFileSubway('jsons/line3.json',subway3);
    callLocalFileSubway('jsons/line4.json',subway4);
    callLocalFileSubway('jsons/line5.json',subway5);
    callLocalFileSubway('jsons/line6.json',subway6);
    callLocalFileSubway('jsons/line7.json',subway7);
    callLocalFileSubway('jsons/line8.json',subway8);
    callLocalFileSubway('jsons/line9.json',subway9);
    callLocalFileSubway('jsons/line10.json',subway10);
    callLocalFileSubway('jsons/line11.json',subway11);

    addAllRoadInfos(subway1,'1号线','地铁');
    addAllRoadInfos(subway2,'2号线','地铁');
    addAllRoadInfos(subway3,'3号线','地铁');
    addAllRoadInfos(subway4,'4号线','地铁');
    addAllRoadInfos(subway5,'5号线','地铁');
    addAllRoadInfos(subway6,'6号线','地铁');
    addAllRoadInfos(subway7,'7号线','地铁');
    addAllRoadInfos(subway8,'8号线','地铁');
    addAllRoadInfos(subway9,'9号线','地铁');
    addAllRoadInfos(subway10,'10号线','地铁');
    addAllRoadInfos(subway11,'11号线','地铁');
    //map.addLayer(subwayLayer);
    //switchControl.addOverlay(subwayLayer,'地铁');
    //console.log(subway1,subway10);
}
function callLocalFileSubway(strPath,temLayer){
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
                var color = getRandomColorSubway(randomNum);
                var polyline = L.polyline(posCol, {color: color, weight: 10}).bindPopup(popupContent).addTo(temLayer);
            }
        });
}
function customAjax(configParam){
    //url,method,postStr,header,func
    var url=configParam.url;
    var method=configParam.type;
    var postStr=configParam.data;
    var func=configParam.success;
    var errFunc=configParam.error;

    var accept=configParam.dataType==null?"application/json":configParam.dataType;
    var contentType=configParam.contentType==null?"application/json":configParam.contentType;



    var ajax = null;

    /** 不同浏览器判定*/
    if (window.ActiveXObject || "ActiveXObject" in window) {
        try {
            ajax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {

            try {

                ajax = new ActiveXObject("Microsoft.XMLHTTP");

            } catch (e) {}

        }

    }else if(window.XMLHttpRequest) {

        ajax = new XMLHttpRequest();

        if (ajax.overrideMimeType) {

            ajax.overrideMimeType("text/xml");

        }

    }

    if (ajax==null) {

        return null;

    }

    if(url.indexOf("?")==-1){

        url+="?random="+new Date().getTime();

    }else{

        url+="&random="+new Date().getTime();

    }

//	url=encodeURI(url); 不在这里进行encode

    ajax.open(method, url, true);



    ajax.setRequestHeader('Content-Type',contentType);
    ajax.setRequestHeader('Accept',accept);

    ajax.send(postStr);

    ajax.onreadystatechange = function() {

        if (ajax.readyState == 4 && (ajax.status == 200||ajax.status== 204)) {

            var result=ajax.responseText;
            switch(contentType){
                case "application/json":
                    if(result!=""){
                        result=JSON.parse(result);
                    }else{
                        result={};
                    }
                    break;
            }
            if(func){
                func.call(this,result);
            }
        }else if(ajax.readyState == 4){
            if(errFunc){
                errFunc.call(this,ajax,ajax.status,null);
            }
        }
    };

    return ajax;
}
//拼接url参数
function constructParams(arr){
    return JSON.stringify(arr);
}
//南北高架
function addPosNBGJ(str,flag){
    var url = 'http://' + baseUrl + ':8080/services/ws/fast_query/srpt/pm/cfg-hotDescQueryByHotid?type=all&hot_name=' + encodeURIComponent(str);
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        data: {}
    })
        .done(function(data){
            //console.log(data);
            var dataArr = [];
            for(var i= 0,lenI=data.length; i<lenI; ++i){
                var name = data[i].hot_name;
                var targetArr = JSON.parse(data[i].desc_);
                if(targetArr === null) continue;
                var posCol = [];
                for(var j= 0,lenJ=targetArr.length; j<lenJ; ++j){
                    var lat = parseFloat(targetArr[j].lat),
                        lng = parseFloat(targetArr[j].lng);
                    var bdPoint = wgs84tobd09(lng,lat).reverse();
                    posCol.push(bdPoint);
                }
                var temObj = {
                    name: name,
                    posArr: posCol
                };
                dataArr.push(temObj);
                if(posCol.length <= 0) continue;
                var latVal = posCol[0][0],
                    lngVal = posCol[0][1];
                var popupContent = '经度:' + lngVal + '</br>纬度:' + latVal;
                //addCustomMarker(latVal,lngVal,temLayer);
                var randomNum = parseInt(Math.random()*(5-0)+0);
                var color = getRandomColorSubway(randomNum);
                //console.log(color);
                //var polyline = L.polyline(posCol, {color: color, weight: 10}).bindPopup(name).addTo(map);
            }
            //console.log(dataArr)
            addValNBGJ(dataArr);
            addXQ2Map(str,flag);
        })
}
function addValNBGJ(arr){
    var timeBegin = getCurrentTimeMin(15);
    var url = 'http://10.221.247.7:8080/stream/union/hotspots-time?time=' + timeBegin;
    var queryData = [];
    for(var i= 0,lenI=arr.length; i<lenI; ++i){
        queryData.push(arr[i].name);
    }
    var queryParas = constructParams(queryData);
    //console.log(queryParas);
    //var queryObj = {
    //    url: url,
    //    type: 'post',
    //    data: '["外环-联谊路","联谊路-呼玛路","共江路-临汾路"]',
    //    success: function(data){
    //        console.log(data);
    //    }
    //};
    ////customAjax(queryObj);
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: queryParas
    })
        .done(function(data){
            //console.log(data);
            var resultArr = [];
            for(var i= 0,lenI=arr.length; i<lenI; ++i){
                var name = arr[i].name;
                var posCol = arr[i].posArr;
                var temVal = data[name]['总用户数'];
                resultArr.push({
                    value: temVal,
                    name: name,
                    posArr: posCol
                });
                var loc = posCol[0];
                var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
                    .setLatLng(loc);
                //heatPopup.setContent('<iframe width="410px" frameborder=no height="280px" src='+"pagesDSN/queryImportantInfo.html?name=" + encodeURIComponent(name) + '&end=' + '></iframe>');
                heatPopup.setContent('<iframe width="610px" frameborder=no height="390px" src='+"pagesDSN/queryImportantInfoBig.html?name=" + encodeURIComponent(name) + '&end=' + '></iframe>');

                if(temVal <1000){
                    var polyline = L.polyline(posCol, {color: 'green', weight: 6}).bindPopup(heatPopup).addTo(roadNB);
                }else if(temVal< 2000){
                    var polyline = L.polyline(posCol, {color: 'yellow', weight: 6}).bindPopup(heatPopup).addTo(roadNB);
                }else{
                    var polyline = L.polyline(posCol, {color: 'red', weight: 6}).bindPopup(heatPopup).addTo(roadNB);
                }
            }
            map.addLayer(roadNB);
            switchControl.addOverlay(roadNB,'南北高架','高架桥');
            //console.log(resultArr);
            addContextMenuGJ();
        });
}
//添加高架菜单
function addContextMenuGJ(){
    roadNB.eachLayer(function (layer) {
        layer.bindContextMenu({
            contextmenu: true,
            contextmenuItems: [
                {
                    text: '查看业务信息 ',
                    callback: function(){
                        //console.log(layer);
                        var layerName = layer._popup._content;
                        var startPos = layerName.indexOf('name=');
                        var endPos = layerName.indexOf('&end=');
                        var content = decodeURIComponent(layerName.substring(startPos+5,endPos));
                        //console.log(content);
                        heatFlag = true;
                        addXQ2Map(content,heatFlag);
                    }
                }
            ]
        });
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
    }).setView([31.21651,121.573883], 17);
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
	baseLayer = new L.TileLayer.DSN(urlDSN,{tileSize: 256, minZoom: 14, maxZoom: 22});//瓦片无转换
    //baseLayer = L.tileLayer.baiduLayer('customLayerDSN.Map',{tileSize: 256, minZoom: 14, maxZoom: 21});//瓦片转换成百度原始形式
    normalLayer = new L.tileLayer.baiduLayer('customLayerNormalSH.Map').addTo(map);
    satelliteLayer = new L.tileLayer.baiduLayer('customLayerSatSH.Map');
    roadLayer = new L.tileLayer.baiduLayer('customLayerSatSH.Road');
    //console.log(roadLayer._leaflet_id);
    //normalLayer.setOpacity(0.1);
	//添加图层控制器
    var baseLayers = {
        "迪斯尼": baseLayer,
        "地图": normalLayer,
        "卫星": satelliteLayer
    };
    //switchControl = L.control.layers(baseLayers, [],{autoZIndex:false,position:'topright'}).addTo(map);
    var groupedOverlays = {
        "高架桥": {
            "内环高架": roadNH,
            "中环高架": roadZH,
            "外环高架": roadWH,
            "延安路高架": roadYA,
            "南北高架": roadNB
        },
        "地铁": {
            "1号线": subway1,
            "2号线": subway2,
            "3号线": subway3,
            "4号线": subway4,
            "5号线": subway5,
            "6号线": subway6,
            "7号线": subway7,
            "8号线": subway8,
            "9号线": subway9,
            "10号线": subway10,
            "11号线": subway11
        }
    };
    switchControl = L.control.groupedLayers(baseLayers, [],{exclusiveGroups: [], groupCheckboxes: true}).addTo(map);
    L.control.zoom({zoomInTitle: '放大', zoomOutTitle: '缩小'}).addTo(map);
    //map.addLayer(normalLayer);
    L.control.scale({position: 'bottomright', imperial: false}).addTo(map);	//添加比例尺

    map.on('mousemove', onMouseMove);//注册鼠标悬浮地图事件
    map.on('baselayerchange', baseLayerChange);//注册底图切换事件
    map.on('zoomend', rerenderHeatMap);//重新绘制热力图
    map.on('overlayremove', heatMapUnSelect);//监测热力图是否勾选
    map.on('overlayadd', heatMapSelect);//监测热力图是否勾选
    addRectangleTool();//添加框选工具
    addSearchTool();//添加搜索工具
	//console.timeEnd('test')
}
//监测热力图是否勾选
function heatMapUnSelect(e){
    //console.log(e);
    var layerName = e.name;
    if(layerName === '热力图'){
        heatFlag = false;
    }
    var groupName = e.group.name;
    if(groupName === '高架桥'){
        normalLayer.setOpacity(1);
    }
}
function heatMapSelect(e){
    var layerName = e.name;
    if(layerName === '热力图'){
        heatFlag = true;
    }var groupName = e.group.name;
    if(groupName === '高架桥'){
        normalLayer.setOpacity(0.5);
    }
}
//添加搜索工具栏
function addSearchTool(){
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
    map.addControl( new L.Control.Search({callData: searchByAjax, text:"搜索", textCancel: '取消', textErr: '未查询到', markerIcon: myIcon}) );
}
function searchByAjax(text,callResponse){
    var cellNameUrl = "http://"+baseUrl+":8080//services/ws/rest/info/grid_cell?page=1&limit=500&cellName=%"+encodeURIComponent(text)+"%"+"&district="+encodeURIComponent('全市');
    $.ajax({
        type : "get",
        async : true, //异步执行
        url : cellNameUrl,
        data : {},
        dataType : "json" //返回数据形式为json
    })
        .done(function(data){
            var lengthRows = data.rows.length;
            if(lengthRows){
                districtsLayer && (map.removeLayer(districtsLayer),districtsLayer.clearLayers());
                for(var i=0; i<lengthRows; i++){
                    if(data.rows[i].latitude != undefined && data.rows[i].latitude != null && data.rows[i].latitude != "" && data.rows[i].longitude != undefined && data.rows[i].longitude != null && data.rows[i].longitude != ""){
                        var cell_longitude = parseFloat(data.rows[i].longitude),
                            cell_latitude = parseFloat(data.rows[i].latitude);
                        var bdPoint = wgs84tobd09(cell_longitude,cell_latitude);
                        var point = [bdPoint[1],bdPoint[0]];
                        //var point = L.latLng(parseFloat(data.rows[i].latitude), parseFloat(data.rows[i].longitude));
                        var popupContent = data.rows[i].cellName;
                        var typeMarker = data.rows[i].cellNt;
                        var lacci = data.rows[i].lacci;
                        //为detailedeInfoVector数组赋值
                        var temObj = {
                            point: point,
                            name: popupContent,
                            type: typeMarker,
                            id: lacci,
                            lacci: lacci
                        };
                        detailedInfoVector.push(temObj);
                        //为小区绑定popup
                        var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
                            .setLatLng(point);
                        //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(heatIndexDis) + "&name=" + encodeURIComponent(popupContent) +'></iframe>');
                        heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

                        var marker = L.marker(point,{title: popupContent, icon: createMarkers(typeMarker),keepInView:true});
                        marker.bindPopup(heatPopup);
                        districtsLayer.addLayer(marker);
                    }
                }
                map.addLayer(districtsLayer);
                //map.panTo(point);
                map.setView(point,15);
            }
        });
}
//重新绘制热力图
function rerenderHeatMap(){
    //console.log(map.latLngToContainerPoint([30.91350,121.4]));
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
                radiusHeatMap = 0.007;
                break;
            case 14:
                radiusHeatMap = 0.006;
                break;
            case 15:
                radiusHeatMap = 0.005;
                break;
            case 16:
                radiusHeatMap = 0.004;
                break;
            case 17:
                radiusHeatMap = 0.003;
                break;
            default:
                radiusHeatMap = 0.0008;
                break;
        }
    }
    lastZoomLevel = curZoom;
    if(curZoom >= 18) return;
    if(cacheHeatMapData.length <= 0) return;//无缓存数据不渲染
    if(!isInScreen(cacheHeatMapData)) {
        //console.log('happened');
        return;
    }
    //热力渲染区域不在屏幕范围内不渲染
    //var maxPoint = map.latLngToContainerPoint(maxPosHeatMap),
    //    minPoint = map.latLngToContainerPoint(minPosHeatMap);
    ////console.log(maxPoint,minPoint)
    //if((maxPoint.x <= 0 || maxPoint.y <= 0) && (minPoint.x <= 0 || minPoint.y <= 0)){
    //    //console.log('happened');
    //    return;
    //}
    //console.log(radiusHeatMap);
    heatMapRender(cacheHeatMapData,radiusHeatMap,heatFlag);
}
function rerenderHeatMap2(){
    //console.log(map.latLngToContainerPoint([30.91350,121.4]));
    var curZoom = map.getZoom();
    if(curZoom === lastZoomLevel){
        //console.log('相等');
        return;
    }else{
        switch (curZoom){
            case 10:
                radiusHeatMap = 200;
                break;
            case 11:
                radiusHeatMap = 100;
                break;
            case 12:
                radiusHeatMap = 80;
                break;
            case 13:
                radiusHeatMap = 60;
                break;
            case 14:
                radiusHeatMap = 50;
                break;
            case 15:
                radiusHeatMap = 40;
                break;
            case 16:
                radiusHeatMap = 30;
                break;
            case 17:
                radiusHeatMap = 20;
                break;
            default:
                radiusHeatMap = 20;
                break;
        }
    }
    lastZoomLevel = curZoom;
    if(curZoom >= 18) return;
    if(cacheHeatMapData.length <= 0) return;//无缓存数据不渲染
    if(!isInScreen(cacheHeatMapData)) {
        //console.log('happened');
        return;
    }
    //热力渲染区域不在屏幕范围内不渲染
    //var maxPoint = map.latLngToContainerPoint(maxPosHeatMap),
    //    minPoint = map.latLngToContainerPoint(minPosHeatMap);
    ////console.log(maxPoint,minPoint)
    //if((maxPoint.x <= 0 || maxPoint.y <= 0) && (minPoint.x <= 0 || minPoint.y <= 0)){
    //    //console.log('happened');
    //    return;
    //}
    //console.log(radiusHeatMap);
    heatMapRender(cacheHeatMapData,radiusHeatMap,heatFlag);
}
//判断缓存的热力图数据是否在当前屏幕范围内
function isInScreen(arr){
    for(var i= 0,lenI=arr.length; i<lenI; ++i){
        var latlng = [arr[i].lat,arr[i].lng];
        var screenPoint = map.latLngToContainerPoint(latlng);
        if(screenPoint.x > 0 && screenPoint.y > 0) return true;
    }
    return false;
}
//底图切换事件
function baseLayerChange(e){
    //console.log(e)
    var curLayerName = e.name;
    var curZoom = map.getZoom();
    var curCenter = map.getCenter();
    //map.addLayer(roadLayer);
    map.hasLayer(roadLayer) && (map.removeLayer(roadLayer));
    //map.hasLayer(satelliteLayer) && map.removeLayer(satelliteLayer);
    //map.hasLayer(baseLayer) && map.removeLayer(baseLayer);
    //map.hasLayer(normalLayer) && map.removeLayer(normalLayer);
    if(curLayerName === '地图'){
        //map.addLayer(normalLayer);
        //map.removeLayer(roadLayer);
        map.options.maxZoom = 18;
        map.options.minZoom = 10;
        if(curZoom>18){
            map.setView(curCenter,18);
        }
    }else if(curLayerName === '迪斯尼'){
        //map.addLayer(baseLayer);
        //map.removeLayer(roadLayer);
        map.options.maxZoom = 21;
        map.options.minZoom = 14;
        map.setView([31.147534,121.663992],18);
    }else{
        //map.addLayer(roadLayer);
        //map.addLayer(satelliteLayer);
        //map.removeLayer(roadLayer);
        map.options.maxZoom = 18;
        map.options.minZoom = 10;
        if(curZoom>18){
            map.setView(curCenter,18);
        }
        map.addLayer(roadLayer);
        roadLayer.bringToFront();
        //console.log(roadLayer,satelliteLayer);
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
        var layersArr = layers.getLayers();
        //分组计算
        var groupLayers = groupSectorAfterMove(layersArr,0.00005);
        var updateArr = [];
        for(var i= 0,lenI=groupLayers.length; i<lenI; ++i){
            var target = groupLayers[i];
            for(var j= 0,lenJ=target.length; j<lenJ; ++j){
                //console.log(target[j]);
                target[j].setLatLng(target[0]._latlng);
                //console.log(target[j]._latlng);
                var latlng = target[j]._latlng;
                var lat = latlng.lat,
                    lng = latlng.lng;
                var popupContent = target[j]._popup._content;
                var hotIdPosStart = popupContent.indexOf('&hotid='),
                    hotIdPosEnd = popupContent.indexOf('&end='),
                    lacciPosStart = popupContent.indexOf('lacci='),
                    lacciPosEnd = popupContent.indexOf('&hotspot=');
                var hot_id = popupContent.substring(hotIdPosStart+7,hotIdPosEnd);
                var lacci = popupContent.substring(lacciPosStart+6,lacciPosEnd).split(':');
                updateArr.push({
                    hot_id: hot_id,
                    lac: lacci[0],
                    ci: lacci[1],
                    lat: lat,
                    lon: lng
                });
            }
        }
        var resultObj = {
            "dbId": "srpt",
            "tableName": "dm_re_ba_rel_hot_cell",
            "type": "update",
            "conditions": ["hot_id","lac","ci"],
            "datas": updateArr
        };
        $('#geoContent').html(JSON.stringify(updateArr));
        $.ajax({
            url: 'http://' + baseUrl + ':8080/services/ws/fast_update/common', //后台处理程序
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
                alert('保存成功!');
            },
            error: function(e){
                alert('保存失败!');
            }
        });
        //console.log(updateArr);
        //console.log(groupLayers);
        //原始方法，未分组
        //if(layersArr.length > 3){
        //    alert('每次最多编辑3个扇形，请重新编辑!');
        //    return;
        //}
        //var baseLat = 0,
        //    baseLng = 0;
        //for(var i= 0,lenI=layersArr.length; i<lenI; ++i){
        //    var target = layersArr[i];
        //    baseLat += target._latlng.lat;
        //    baseLng += target._latlng.lng;
        //}
        //baseLat = parseFloat(baseLat/lenI);
        //baseLng = parseFloat(baseLng/lenI);
        //layers.eachLayer(function (layer) {
        //    //console.log(layer);
        //    layer.setLatLng([baseLat,baseLng]);
        //});
    });
}
//移动后的扇形分组
function groupSectorAfterMove(layersArr,tolerance){
    var copyArr = [];
    copyArr = copyArr.concat(layersArr);
    //console.log(copyArr);
    var resultArr = [];
    for(var i= 0,lenI=layersArr.length; i<lenI; ++i){
        var target = layersArr[i];
        var inUse = compareCopy(target,copyArr);
        if(inUse.length > 0){resultArr.push(inUse);}
    }
    return resultArr;
    function compareCopy(target,arr){
        var temArr = [];
        var deleteArr = [];
        var baseLat = target._latlng.lat,
            baseLng = target._latlng.lng;
        for(var j= 0,lenJ=arr.length; j<lenJ; ++j){
            var compare = arr[j];
            var compareLat = compare._latlng.lat,
                compareLng = compare._latlng.lng;
            if(Math.abs(baseLat - compareLat) <= tolerance && Math.abs(baseLng - compareLng) <= tolerance){
                //console.log('happened');
                temArr.push(compare);
                deleteArr.push(j);
            }
        }
        for(var k= 0,lenK=deleteArr.length; k<lenK; ++k){
            copyArr.splice(0,1);
        }
        //console.log('删除后COPY',copyArr);
        //console.log('删除后layersArr',layersArr);
        return temArr;
    }
}
//框选查询
function queryByRectangle(maxLat,maxLng,minLat,minLng) {
    districtsLayer && (map.removeLayer(districtsLayer),districtsLayer.clearLayers());
    temLayer && (map.removeLayer(temLayer), temLayer.clearLayers());
    sectorLayer && (map.removeLayer(sectorLayer));
    markerClusters && (map.removeLayer(markerClusters));
    detailedInfoVector = [];
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
                    //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(heatIndexDis) + "&name=" + encodeURIComponent(popupContent) +'></iframe>');
                    heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

                    var marker = L.marker(point,{title: popupContent, icon: createMarkers(typeMarker),keepInView:true, draggable: false});
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
    sectorLayer && (map.removeLayer(sectorLayer));
    markerClusters && (map.removeLayer(markerClusters));
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
            //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(heatIndexDis) + "&name=" + encodeURIComponent(popupContent) +'></iframe>');
            heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

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
    div.html( '<iframe width="320px" frameborder=no height="340px" src="pagesDSN/rectangleQueryListDistrictsF.html?"></iframe>');
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
            //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(heatIndexDis) + "&name=" + encodeURIComponent(popupContent) +'></iframe>');
            heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

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
                var bdPoint = detailedInfoVector[i].point;
                var point = bd09towgs84(bdPoint[1],bdPoint[0]);
                var lat = point[1].toString(),
                    lng = point[0].toString();
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
function addCustomMarker(lat,lng,temLayer){
	var myIcon = new L.icon({
		iconUrl: 'images/marker-icon.png',
		iconRetinaUrl: 'images/marker-icon@2x.png',
		iconSize: [25, 41],
		//iconAnchor: [22, 94],
		popupAnchor: [-3, -6],
		//shadowUrl: 'images/marker-shadow.png',
		//shadowRetinaUrl: 'images/marker-shadow@2x.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]
	});
    var popupContent = '经度:' + lng + '</br>纬度:' + lat;
	L.marker([lat,lng], {icon: myIcon}).bindPopup(popupContent).addTo(temLayer);
    var SweetIcon = L.Icon.Label.extend({
        options: {
            iconUrl: 'images/marker-icon.png',
            shadowUrl: null,
            iconSize: [24, 41],
            iconAnchor: new L.Point(0, 1),
            labelAnchor: new L.Point(12, 0),
            wrapperAnchor: new L.Point(12, 13),
            labelClassName: 'sweet-deal-label'
        }
    });
    //new L.Marker([lat,lng],{ icon: new SweetIcon({ labelText: '12'})}).bindPopup(popupContent).addTo(cycleRoadLayer);
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
//后台请求入口函数，添加各种覆盖物至地图
function addXQ2Map(str,flag){
    markersLayer && (map.removeLayer(markersLayer),markersLayer.clearLayers(),switchControl.removeLayer(markersLayer));
    heatMapLayer && (switchControl.removeLayer(heatMapLayer), map.removeLayer(heatMapLayer));
    sectorLayer && (map.removeLayer(sectorLayer),sectorLayer.clearLayers(),switchControl.removeLayer(sectorLayer));
    markerClusters && (map.removeLayer(markerClusters),markerClusters.clearLayers(),switchControl.removeLayer(markerClusters));
    //var urlCluster = "http://"+baseUrl+":8080/services/ws/rest/bchol/select_cellinfo?name="+encodeURIComponent(str)+"&page=1&limit=10000";//原始
    var urlCluster = 'http://' + baseUrl + ':8080/services/ws/fast_query/area/re/re_cellByHotname?hotspot=' + encodeURIComponent(str);//迪士尼
    //console.log(urlCluster);
    addMarkerClusters(urlCluster,str,flag);
}
function addMarkerClusters1(url,hotspot,flag){
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
            //console.log(data);
            detailedInfoVector = [];
            for(var i= 0, len = data.rows.length; i<len;++i){
                if (data.rows[i].cellLatitude !="" && data.rows[i].cellLongitude != "") {
                    var latHeatMap = parseFloat(data.rows[i].cellLatitude),
                        lngHeatMap = parseFloat(data.rows[i].cellLongitude);
                    //var point = L.latLng(latHeatMap,lngHeatMap);
                    if(latHeatMap === 0 || lngHeatMap === 0) continue;
                    //根据小区原坐标产生随机坐标
                    if(isNumber(latHeatMap) && isNumber(lngHeatMap)){
                        //console.log([latHeatMap,lngHeatMap]);
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
            addResultNow(heatMap,hotspot,flag);//当前热力图渲染
        });
}
function addMarkerClusters(url,hotspot,flag){
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
            //console.log(data)
            if(isEmpty(data) || data.length <= 0){
                alert('暂无坐标数据');
                return;
            }
            //console.log(data);
            detailedInfoVector = [];
            for(var i= 0, len = data.length; i<len;++i){
                if ((data[i].lat !="" && data[i].lon != "") && (data[i].lat != null && data[i].lon != null)) {
                    var latHeatMap = parseFloat(data[i].lat),
                        lngHeatMap = parseFloat(data[i].lon);
                    //var point = L.latLng(latHeatMap,lngHeatMap);
                    //console.log(latHeatMap,lngHeatMap);
                    if(latHeatMap === 0 || lngHeatMap === 0) continue;
                    if(isNumber(latHeatMap) && isNumber(lngHeatMap)){
                        //console.log([latHeatMap,lngHeatMap]);
                        var bdPoint = wgs84tobd09(lngHeatMap,latHeatMap);
                        //var bdPoint = [lngHeatMap,latHeatMap];
                        var point = bdPoint.reverse();
                        //console.log(point[1]);
                        if(point.length !== 2) continue;
                        var lac = data[i].lac;
                        var ci = data[i].ci;
                        var lacci = lac + ':' + ci;
                        var name = data[i].cell_name;
                        var type = data[i].cell_nt;
                        var hot_id = data[i].hot_id;
                        var cellType1 = data[i].cell_type;
                        var cellType = cellType1.trim();
                        //console.log(data[i].hori_direc_angle,data[i].mechanical_dip_angle)
                        if(data[i].hori_direc_angle === null || data[i].hori_direc_angle === '-') {continue;}
                        var beginAngle = parseFloat(data[i].hori_direc_angle);
                        beginAngle = 90-(180-beginAngle);
                        //var endAngle = parseFloat(data[i].mechanical_dip_angle);
                        var endAngle = 0;
                        if(beginAngle > 0 && beginAngle > endAngle){
                            var temVal = endAngle;
                            endAngle = beginAngle;
                            beginAngle = temVal;
                        }
                        //console.log(point);
                        var temObj = {
                            lacci: lacci,
                            id: lacci,
                            point: point,
                            name: name,
                            lat: point[0],
                            lng: point[1],
                            type: type,
                            hot_id: hot_id,
                            cellType: cellType,
                            hori_direc_angle: beginAngle,
                            mechanical_dip_angle: endAngle
                        };
                        //console.log(temObj);
                        heatMap.push(temObj);//cacheHeatMapData部分值
                        detailedInfoVector.push(temObj);//为detailedeInfoVector数组赋值
                    }else{
                        continue;
                    }
                }else{
                    //console.log('no data');
                    continue;
                }
            }
            //console.log(heatMap);
            if(heatMap.length >0){
                beginAddXQ(heatMap,hotspot);
                //addResultNow(heatMap,hotspot,flag);//当前热力图渲染
            }else{
                alert('后台数据有问题，请稍后重试!');
                return;
            }
        });
}
function beginAddXQ1(arr,hotspot){
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
        //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?"+lacci+"!"+encodeURIComponent(hotspot) + "&" + encodeURIComponent(name) +'></iframe>');
        heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

        type === '4G' && (L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        type === '3G' && (L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        type === '2G' && (L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
    }
    var center = [lat,lng];
    hotspot === '交通枢纽' && (center = [31.195769,121.338157]);
    map.panTo(center,{});
    map.addLayer(markersLayer);
    switchControl.addOverlay(markersLayer,"小区图层",'业务');
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
    var marker2GH = L.icon({
        iconUrl: 'images/2G_2.png',
        iconSize: [35, 35]
    });
    var marker3GH = L.icon({
        iconUrl: 'images/3G_2.png',
        iconSize: [35, 35]
    });
    var marker4GH = L.icon({
        iconUrl: 'images/4G_2.png',
        iconSize: [35, 35]
    });
    var lastAngle = 0,
        lastPointArr = [0,0];
    for(var i= 0, lenI=arr.length; i<lenI; ++i){
        var lat = arr[i].lat,
            lng = arr[i].lng;
        var type = arr[i].type,
            name = arr[i].name,
            lacci = arr[i].lacci;
        var hotId = arr[i].hot_id;
        var cellType = arr[i].cellType;
        var beginAngle = parseFloat(arr[i].hori_direc_angle);
        var endAngle = parseFloat(arr[i].mechanical_dip_angle);
        var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
            .setLatLng([lat,lng]);
        //heatPopup.setContent('<iframe width="480px" frameborder=no height="290px" src='+"pagesDSN/sitePieCharts.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name) +'></iframe>');
        heatPopup.setContent('<iframe width="680px" frameborder=no height="460px" src='+"pagesDSN/sitePieChartsBig.html?lacci="+lacci+"&hotspot="+encodeURIComponent(hotspot) + "&name=" + encodeURIComponent(name)+ "&hotid=" + encodeURIComponent(hotId) + "&end=" + '></iframe>');

        if(type === '4G'){
            if(cellType === '宏站'){

                L.marker([lat,lng],{title: name, icon: marker4GH, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker4GH, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }else{
                L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }
            addSectorXQ([lat,lng],100,beginAngle,beginAngle+75,name,lacci,hotspot,hotId,type);
        }else if(type === '3G'){
            if(cellType === '宏站'){

                L.marker([lat,lng],{title: name, icon: marker3GH, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker3GH, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }else{
                L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }
            addSectorXQ([lat,lng],100,beginAngle,beginAngle+60,name,lacci,hotspot,hotId,type);
        }else{
            if(cellType === '宏站'){

                L.marker([lat,lng],{title: name, icon: marker2GH, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker2GH, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }else{
                L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer);
                L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters);
            }
            addSectorXQ([lat, lng], 100, beginAngle, beginAngle + 45, name, lacci, hotspot, hotId,type);
        }
        lastAngle = beginAngle;
        lastPointArr = [lat,lng];
        //type === '4G' && (addSectorXQ([lat,lng],100,beginAngle,beginAngle+75,name,lacci,hotspot,hotId), L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        //type === '3G' && (addSectorXQ([lat,lng],200,beginAngle,beginAngle+60,name,lacci,hotspot,hotId), L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        //type === '2G' && (addSectorXQ([lat,lng],300,beginAngle,beginAngle+45,name,lacci,hotspot,hotId), L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer),L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markerClusters));
        //addSectorXQ([lat,lng],100,beginAngle,endAngle,name,lacci,hotspot,hotId);
    }
    var center = [lat,lng];
    hotspot === '交通枢纽' && (center = [31.195769,121.338157]);
    map.panTo(center,{});
    //map.addLayer(markerClusters);
    //switchControl.addOverlay(markerClusters,"聚合小区",'业务');
    map.addLayer(sectorLayer);
    switchControl.addOverlay(sectorLayer,"宏站小区",'业务');
}
//当前热力图渲染
function addResultNow(arr,heatIndexDis,flag){
    var heatIndexName = '业务用户数';
    var time = getCurrentTimeMin(15);//当前热力图渲染时间
    var url;
    var heatMap = [];
    heatIndexName === '信令用户数' && (url = 'http://' + baseUrl + ':8080/stream/totalnum/sites?time=' + time + '&hotspot=' + encodeURIComponent(heatIndexDis));
    heatIndexName === '业务用户数' && (url = 'http://' + baseUrl + ':8080/stream/usernum/sites?time=' + time + '&hotspot=' + encodeURIComponent(heatIndexDis));
    //console.log(url)
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
            heatMapRender(heatMap,radiusHeatMap,flag);
        });
}
function heatMapRender (temArr,radius,flag) {
    cacheHeatMapData = [];
    var heatMap = mergeSame(temArr.sort(keySort('lat')),'lat','lng');
    //console.log(heatMap);
    //var latSort = temArr.sort(keySort('lat')),//从大到小排列
    //    lngSort = temArr.sort(keySort('lng'));
    //var temLength = temArr.length - 1;
    //maxPosHeatMap = [latSort[0].lat,lngSort[0].lng];
    //minPosHeatMap = [latSort[temLength].lat,lngSort[temLength].lng];
    ////console.log(maxPosHeatMap,minPosHeatMap);
    if(heatMapLayer !== undefined || heatMapLayer != null){
        if (heatMapLayer._data){
            switchControl.removeLayer(heatMapLayer);
            map.removeLayer(heatMapLayer);
        }
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
    //var lat = heatMap[0].lat,
    //    lng = heatMap[0].lng;
    //map.panTo([lat,lng]);
    heatMapLayer = new HeatmapOverlay(cfg);
    map.addLayer(heatMapLayer);
    heatMapLayer.setData(testData);
    flag === false && (map.removeLayer(heatMapLayer));
    //map.removeLayer(heatMapLayer);
    switchControl.addOverlay(heatMapLayer,"热力图",'业务');
}
function heatMapRender2 (temArr,radius,flag) {
    cacheHeatMapData = [];
    var heatMap = mergeSame(temArr.sort(keySort('lat')),'lat','lng');
    //console.log(heatMap);
    //var latSort = temArr.sort(keySort('lat')),//从大到小排列
    //    lngSort = temArr.sort(keySort('lng'));
    //var temLength = temArr.length - 1;
    //maxPosHeatMap = [latSort[0].lat,lngSort[0].lng];
    //minPosHeatMap = [latSort[temLength].lat,lngSort[temLength].lng];
    ////console.log(maxPosHeatMap,minPosHeatMap);
    if(heatMapLayer !== undefined || heatMapLayer != null){
        if (heatMapLayer._latlngs){
            switchControl.removeLayer(heatMapLayer);
            map.removeLayer(heatMapLayer);
        }
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
    var heatData = [];
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
        heatData.push([lat,lng,temVal/10]);
    }
    cacheHeatMapData = heatMap;
    var aveHeatValue = Math.ceil(sum/heatMap.length);
    //for (var i= 0,len =heatMap.length; i<len; i++){
    //    var temVal = heatMap[i].value;
    //    var lat = heatMap[i].lat,
    //        lng = heatMap[i].lng;
    //    heatData.push([lat,lng,temVal/aveHeatValue]);
    //}
    testData={max: maxHeatValue, min: minHeatValue, data: heatMap};
    //console.log(testData);
    //var lat = heatMap[0].lat,
    //    lng = heatMap[0].lng;
    //map.panTo([lat,lng]);
    console.log(heatData);
    heatMapLayer = L.heatLayer(heatData, {radius: radius, blur: 5, gradient: {0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"}}).addTo(map);
    switchControl.addOverlay(heatMapLayer,"热力图",'业务');
}
//根据坐标网格化地图
function addWangGe(){
    var x1 = 31.165427;
    var y1 = 121.653318;
    var x2 = 31.134646;
    var y2 = 121.693469;
    //绘制4边型
    var lineStyle = {color:'gray' , weight : 1, opacity: 0.3};
    //x经度
    for(var i = y1; i < y2; i+= 0.000718587500000145){
        L.polyline([[x1,i],[x2,i]], lineStyle).addTo(rasterLayer);
    }
    L.polyline([[x1,y2],[x2,y2]], lineStyle).addTo(rasterLayer);
    //y纬度
    for(var i = x1; i > x2; i-= 0.000613250000000024){
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
    //heatPopup.setContent('<iframe width="410px" frameborder=no height="300px" src='+"pages/queryImportantInfo.html?name=" + encodeURIComponent(str) + '></iframe>');
    heatPopup.setContent('<iframe width="610px" frameborder=no height="390px" src='+"pagesDSN/queryImportantInfoBig.html?name=" + encodeURIComponent(name) + '&end=' + '></iframe>');

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
//创建指标
function showAllIndexInfo(disName){
    $('#userData1').empty();
    $('#dataThroughPut1').empty();
    $('#hotTerminal1').empty();
    var src1 = "pagesDSN/yhsBig.html?name=";
    constructDomTrend(disName,'userData1',src1);
    var src2 = "pagesDSN/llBig.html?name=";
    constructDomTrend(disName,'dataThroughPut1',src2);
    var src3 = "pagesDSN/rmyyBig.html?name=";
    constructDomTrend(disName,'hotTerminal1',src3);

    $('#userData').empty();
    var src4 = "pagesDSN/wlzlzb1Big.html?name=";
    constructDomTrend(disName,'userData',src4);
    $('#dataThroughPut').empty();
    var src5 = "pagesDSN/wlzlzb2Big.html?name=";
    constructDomTrend(disName,'dataThroughPut',src5);
    $('#hotTerminal').empty();
    var src6 = "pagesDSN/wlzlzb3Big.html?name=";
    constructDomTrend(disName,'hotTerminal',src6);
}
function constructDomTrend(disName,divId,src){
    var myiframe=document.createElement("iframe");
    myiframe.name="showframe" ;
    myiframe.width="99%";
    myiframe.height="99%";
    myiframe.marginwidth="0";
    myiframe.marginheight="0";
    myiframe.hspace="0";
    myiframe.vspace="0";
    myiframe.frameborder="0";
    myiframe.scrolling="no";
    myiframe.style.border="none";
    myiframe.src=src + encodeURIComponent(disName);
    document.getElementById(divId).appendChild(myiframe);
}
//接受子页面调用绘制趋势图
//普通大小趋势图
function callDrawTrendPlot2(str){
    document.getElementById("trendPlotFromChild").style.visibility = "visible";
    document.getElementById("trendPlotFromChild").innerHTML = '';
    $('#trendPlotFromChild').addClass('img-preview');
    var winHeight = $(document).height(),
        winWidth = $(document).width();
    $('#trendPlotFromChild').css({position: 'absolute', width: '680px', height: '380px', left: winWidth/4, top: winHeight/4, 'background-color': '#252c34', border: 'none'});
    document.getElementById("trendPlotFromChild").innerHTML = '<iframe width="680px" frameborder=no height="380px" src=' + str + '></iframe>';
}
//放大效果趋势图
function callDrawTrendPlotBig(str){
    document.getElementById("trendPlotFromChild").style.visibility = "visible";
    document.getElementById("trendPlotFromChild").innerHTML = '';
    $('#trendPlotFromChild').addClass('img-preview');
    var winHeight = $(document).height(),
        winWidth = $(document).width();
    $('#trendPlotFromChild').css({position: 'absolute', width: '880px', height: '480px', left: winWidth/4, top: winHeight/7, 'background-color': '#252c34', border: 'none'});
    document.getElementById("trendPlotFromChild").innerHTML = '<iframe width="880px" frameborder=no height="480px" src=' + str + '></iframe>';
}
//接受子页面调用关闭小区信息趋势图
function closeTrendPlot(){
    document.getElementById("trendPlotFromChild").innerHTML = '';
    document.getElementById("trendPlotFromChild").style.visibility = "hidden";
}
//接受子页面调用关闭地图热点区域趋势图
function closeDivLL(){
    document.getElementById("dataThroughPut1").innerHTML = '';
    document.getElementById("dataThroughPut1").style.visibility = "hidden";
}
function callDivLLMax(str){
    document.getElementById("dataThroughPut1").style.visibility = "visible";
    document.getElementById("dataThroughPut1").innerHTML = '';
    $('#dataThroughPut1').addClass('img-preview');
    var winHeight = $(document).height(),
        winWidth = $(document).width();
    $('#dataThroughPut1').css({position: 'absolute', width: '880px', height: '480px', left: winWidth/4, top: winHeight/7, 'background-color': '#252c34', border: 'none'});
    document.getElementById("dataThroughPut1").innerHTML = '<iframe width="880px" frameborder=no height="480px" src=' + str + '></iframe>';
}
function callDivLLNormal(){
    $('#dataThroughPut1').empty();
    var str = "pagesDSN/llBig.html?name=";
    $('#dataThroughPut1').css({position: 'absolute', width: '600px', height: '300px', left: '80px', top: '360px', 'background-color': '#252c34', border: 'none'});
    constructDomTrend(heatIndexDis,'dataThroughPut1',str);
}
function callDrawTrendPlot(str){
    var div = $('#trendPlotFromChild');
    document.getElementById("trendPlotFromChild").style.visibility = "visible";
    div.html( '');
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
        left:100,
        top:200,
        width:1150,
        height:375
    });
    div.html( '<iframe width="1130px" frameborder=no height="330px" src=' + str + '></iframe>');
}
//记忆转换法
function wgs84tobd09(lng,lat){
	var temArr = wgs84togcj02(lng,lat);
    return gcj02tobd09(temArr[0],temArr[1]);
}