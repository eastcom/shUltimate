//初始化导航栏
function initCls(){
    $("div[name='left_tab']").click(function(){
        var moveCnt=$(".custom-detailed-wx").height();
        var moveCnt2=2;
        moveCnt=moveCnt-44;
        $(".circle_line").hide();
        $(".custom-detailed-wx").hide();
        //$(".custom-detailed-wx").hide();
        $("#tab1").animate({top:"-"+moveCnt2+'px'});
        $("#tab2").animate({top:"-"+moveCnt+'px'});
        $("#tab3").animate({top:"-"+moveCnt+'px'});
        $("#tab4").animate({top:"-"+moveCnt+'px'});
        $("#tab5").animate({top:"-"+moveCnt+'px'});
        $("#tab6").animate({top:"-"+moveCnt+'px'});
        var tab_id=this.id;
        if(tab_id=="tab1"){
            $("#tab1").find(".custom-detailed-wx").eq(0).show();
            $("#tab1").find(".circle_line").eq(0).show();
            $("#tab2").animate({top:'0'});
            $("#tab3").animate({top:'0'});
            $("#tab4").animate({top:'0'});
            $("#tab5").animate({top:'0'});
            $("#tab6").animate({top:'0'});
        }
        if(tab_id=="tab2"){
            $("#tab2").find(".custom-detailed-wx").eq(0).show();
            $("#tab2").find(".circle_line").eq(0).show();
            $("#tab2").animate({top:"-"+moveCnt+'px'});
            $("#tab3").animate({top:'0'});
            $("#tab4").animate({top:'0'});
            $("#tab5").animate({top:'0'});
            $("#tab6").animate({top:'0'});
        }
        if(tab_id=="tab3"){
            $("#tab3").find(".custom-detailed-wx").eq(0).show();
            $("#tab3").find(".circle_line").eq(0).show();
            $("#tab3").animate({top:"-"+moveCnt+'px'});
            $("#tab2").animate({top:"-"+moveCnt+'px'});
            $("#tab4").animate({top:'0'});
            $("#tab5").animate({top:'0'});
            $("#tab6").animate({top:'0'});
        }
        if(tab_id=="tab4"){
            $("#tab4").find(".custom-detailed-wx").eq(0).show();
            $("#tab4").find(".circle_line").eq(0).show();
            $("#tab2").animate({top:"-"+moveCnt+'px'});
            $("#tab3").animate({top:"-"+moveCnt+'px'});
            $("#tab4").animate({top:"-"+moveCnt+'px'});
            $("#tab5").animate({top:'0'});
            $("#tab6").animate({top:'0'});
        }
        if(tab_id=="tab5"){
            $("#tab5").find(".custom-detailed-wx").eq(0).show();
            $("#tab5").find(".circle_line").eq(0).show();
            $("#tab2").animate({top:"-"+moveCnt+'px'});
            $("#tab3").animate({top:"-"+moveCnt+'px'});
            $("#tab4").animate({top:"-"+moveCnt+'px'});
            $("#tab5").animate({top:"-"+moveCnt+'px'});
            $("#tab6").animate({top:'0'});

        }
        if(tab_id=="tab6"){
            $("#tab6").find(".custom-detailed-wx").eq(0).show();
            $("#tab2").animate({top:"-"+moveCnt+'px'});
            $("#tab3").animate({top:"-"+moveCnt+'px'});
            $("#tab4").animate({top:"-"+moveCnt+'px'});
            $("#tab5").animate({top:"-"+moveCnt+'px'});
            $("#tab6").animate({top:"-"+moveCnt+'px'});
        }
    });
}
function initCls2(tab_id){
    var moveCnt = $(".custom-detailed-wx").height();
    moveCnt = moveCnt - 68;
    $(".custom-detailed-wx").hide();
    $("#tab2").animate({top:"-"+moveCnt+'px'});
    $("#tab3").animate({top:"-"+moveCnt+'px'});
    $("#tab4").animate({top:"-"+moveCnt+'px'});
    if(tab_id=="tab1"){
        $("#tab1").find(".custom-detailed-wx").eq(0).show();
        $("#tab2").animate({top:'0'});
        $("#tab3").animate({top:'0'});
        $("#tab4").animate({top:'0'});
    }
    if(tab_id=="tab2"){
        $("#tab2").find(".custom-detailed-wx").eq(0).show();
        $("#tab2").animate({top:"-"+moveCnt+'px'});
        $("#tab3").animate({top:'0'});
        $("#tab4").animate({top:'0'});
    }
    if(tab_id=="tab3"){
        $("#tab3").find(".custom-detailed-wx").eq(0).show();
        $("#tab3").animate({top:"-"+moveCnt+'px'});
        $("#tab2").animate({top:"-"+moveCnt+'px'});
        $("#tab4").animate({top:'0'});
    }
    if(tab_id=="tab4"){
        $("#tab4").find(".custom-detailed-wx").eq(0).show();
        $("#tab2").animate({top:"-"+moveCnt+'px'});
        $("#tab3").animate({top:"-"+moveCnt+'px'});
        $("#tab4").animate({top:"-"+moveCnt+'px'});
    }
}
//初始化地图
function init(){
        var streets  = L.tileLayer('http://'+baseUrl+':8080/Tiles/{z}/{x}/{y}.png');
        var grayScale = L.tileLayer('http://'+baseUrl+':8080/sh/satelliteBingMap/{z}/{x}/{y}.jpg');
        //var grayScale = L.tileLayer('http://localhost:8080/newPics/{z}/{x}/{y}.jpg', {tileSize: 512});
		//限制地图显示范围
        var southWest = L.latLng(30.61350, 120.92651),
                northEast = L.latLng(31.94256, 122.104797),
                bounds = L.latLngBounds(southWest, northEast);
        map = new L.map('map',{
			//crs: L.CRS.Simple,
            layers:[grayScale],
            minZoom:10,
            maxZoom:17,
            fullscreenControl: false,
            zoomControl: false,
            //maxBounds: bounds,
            contextmenu: true
        }).setView([31.195769,121.338157], 13);//31.146484,121.670651
        //添加图层控制器
        var baseLayers = {
            "卫星影像": grayScale,
            "街道地图": streets
        };
        switchControl = L.control.layers(baseLayers, [],{autoZIndex:false,position:'topright'});
        switchControl.addTo(map);

    var marker4G = L.icon({
        iconUrl: 'images/4G-2.png',
        iconSize: [35, 35]
    });
    var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
        .setLatLng([31.146484, 121.640651]);
    heatPopup.setContent('<iframe width="410px" frameborder=no height="300px" src='+"pages/queryImportantInfo.html?name=" + encodeURIComponent(heatIndexDis) + '></iframe>');
    //L.marker([31.146484, 121.640651],{title: heatIndexDis, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(map);
    //addPolygonData2Map();
    //注册鼠标悬浮时显示鼠标停留的坐标事件,这儿显示坐标信息
    function onMouseMove(e) {
        var latlng = e.latlng;
        document.getElementById("infoLocation").innerHTML = "纬度：" + latlng.lat.toString() + "，" + "经度：" + latlng.lng.toString();
    }
    //map.on('mousemove', onMouseMove);
    map.on('zoomend', rerenderHeatMap);//重新绘制热力图
}
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
function addPolygonData2Map(){
    var jtsn = [
        {lat: 31.2157, lng: 121.305198},
        {lat: 31.219261, lng: 121.336784},
        {lat: 31.197825, lng: 121.345367},
        {lat: 31.177559, lng: 121.343994},
        {lat: 31.18372, lng: 121.312751},
        {lat: 31.203698, lng: 121.303482}
    ];
    var gs = [
        {lat: 31.250965, lng: 121.369056},
        {lat: 31.251552, lng: 121.313781},
        {lat: 31.2709215, lng: 121.2866592},
        {lat: 31.303195, lng: 121.313438},
        {lat: 31.285886, lng: 121.389565}
    ];
    var sycs = [
        {lat: 31.23394, lng: 121.463127},
        {lat: 31.238049, lng: 121.483039},
        {lat: 31.223665, lng: 121.477203},
        {lat: 31.226013, lng: 121.462783}
    ];
    var ywcs = [
        {lat: 31.237095, lng: 121.497373},
        {lat: 31.222417, lng: 121.50999},
        {lat: 31.227194, lng: 121.519689},
        {lat: 31.240691, lng: 121.509733}
    ];
    var sm = [
        {lat: 31.170583, lng: 121.446132},
        {lat: 31.176311, lng: 121.455659},
        {lat: 31.188427, lng: 121.446819},
        {lat: 31.186151, lng: 121.432742},
        {lat: 31.173814, lng: 121.44227}
    ];
    constructPolygon(jtsn,'交通枢纽');
    constructPolygon(gs,'高速');
    constructPolygon(sycs,'商业场所');
    constructPolygon(ywcs,'游玩场所');
    constructPolygon(sm,'寺庙');
    map.addLayer(polygonLayer);
    polygonLayer.bringToFront();
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
function constructPolygon(arr,str){
    var polygonArr = [];
    for(var i= 0,lenI=arr.length; i<lenI; ++i){
        var point = [arr[i].lat, arr[i].lng];
        polygonArr.push(point);
    }
    var color = getColor(parseInt(Math.random() * (5-1)));
    var polygon = L.polygon(polygonArr, {smoothFactor: 10, noClip: true, weight: 2, fillOpacity: 0.7, color: color, fillColor: color});
    var bound = polygon.getBounds();
    var loc = bound.getCenter();
    var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
        .setLatLng(loc);
    heatPopup.setContent('<iframe width="410px" frameborder=no height="300px" src='+"pages/queryImportantInfo.html?name=" + encodeURIComponent(str) + '></iframe>');
    polygon.bindPopup(heatPopup).addTo(polygonLayer);
    constructLabel(loc,str);
    map.addLayer(labelLayer);
}
function constructLabel(latlng,dataVal){
    var SweetIcon = L.Icon.Label.extend({
        options: {
            iconUrl: 'images/testBack.png',
            shadowUrl: null,
            iconSize: new L.Point(0.00001, 0.00001),
            iconAnchor: new L.Point(0, 1),
            labelAnchor: new L.Point(-20, 0),
            wrapperAnchor: new L.Point(12, 13),
            labelClassName: 'sweet-deal-label'
        }
    });
    new L.Marker(
        latlng,
        { icon: new SweetIcon({ labelText:dataVal }) }
    ).addTo(labelLayer);
}
function locate2Target(str){
    labelLayer.eachLayer(function(layer){
        var opt = layer.options.icon.options.labelText;
        if(opt === str){
            var point = layer._latlng;
            map.setView(point,13);
            return;
        }
    });
}
//添加重点保障数据
function addImportantData(){
    var time = getCurrentTimeMin(5);
    var bigGroupData = ['游玩场所','商业场所','交通枢纽','高速','寺庙','收费站'];
    var temStr = constructParams(bigGroupData);
    var urlTotalCount = 'http://' + baseUrl + ':8080/stream/totalnum/hotspots?time=' + time + temStr,
        urlData = 'http://' + baseUrl + ':8080/stream/ue/bytes/hotspots-time?time=' + time + temStr;
    //console.log(urlTotalCount)
    //查用户数
    $.ajax({
        url: urlTotalCount,
        type: 'get',
        dataType: 'json'
    })
        .done(function(data){
            var jtsnData,
                sycsData,
                ywcsData,
                gaosuData;
            for(var name in data){
                var targetObj = data[name];
                name === '交通枢纽' && ( jtsnData = (targetObj.total/10000).toFixed(2));
                name === '高速' && ( gaosuData = (targetObj.total/10000).toFixed(2));
                name === '商业场所' && ( sycsData = (targetObj.total/10000).toFixed(2));
                name === '游玩场所' && ( ywcsData = (targetObj.total/10000).toFixed(2));
            }
            var realTime = targetObj.time.substring(11,16);
            $('#jtsn .custom-index-info-left-wx b').html(jtsnData);
            $('#gaosu .custom-index-info-left-wx b').html(gaosuData);
            $('#sycs .custom-index-info-left-wx b').html(sycsData);
            $('#ywcs .custom-index-info-left-wx b').html(ywcsData);
            $('.title_time').html(realTime);
        });
    //查流量
    $.ajax({
        url: urlData,
        type: 'get',
        dataType: 'json'
    })
        .done(function(data){
            var jtsnData,
                sycsData,
                ywcsData,
                gaosuData;
            var indexName = '总流量';
            for(var name in data){
                var targetObj = data[name];
                name === '交通枢纽' && ( jtsnData = (targetObj[indexName]/1024/1024).toFixed(2));
                name === '高速' && ( gaosuData = (targetObj[indexName]/1024/1024).toFixed(2));
                name === '商业场所' && ( sycsData = (targetObj[indexName]/1024/1024).toFixed(2));
                name === '游玩场所' && ( ywcsData = (targetObj[indexName]/1024/1024).toFixed(2));
            }
            $('#jtsn .custom-index-info-right-wx b').html(jtsnData);
            $('#gaosu .custom-index-info-right-wx b').html(gaosuData);
            $('#sycs .custom-index-info-right-wx b').html(sycsData);
            $('#ywcs .custom-index-info-right-wx b').html(ywcsData)
        });
    //*/
}
//重点保障区域详细区域数据
function addDetailedImportantData1(){
    var time = getCurrentTimeMin(5);
    var bigGroupData = ['虹桥枢纽','虹口足球场','上海体育场','上海南站','浦东国际机场','上海港国际客运中心'];
    var temStr = constructParams(bigGroupData);
    var urlTotalCount = 'http://' + baseUrl + ':8080/stream/totalnum/hotspots?time=' + time + temStr;
    //查用户数
    $.ajax({
        url: urlTotalCount,
        type: 'get',
        dataType: 'json'
    })
        .done(function(data){
            var hqsn = (data['虹桥枢纽'].total/10000).toFixed(2),
                hqzqc = (data['虹口足球场'].total/10000).toFixed(2),
                shnz = (data['上海南站'].total/10000).toFixed(2),
                shtyc = (data['上海体育场'].total/10000).toFixed(2),
                pdgjjc = (data['浦东国际机场'].total/10000).toFixed(2),
                shggjkyzx = (data['上海港国际客运中心'].total/10000).toFixed(2);
            $('#jtsnDetailed tr td.t2').eq(0).html('<span>' + hqsn + '</span>'+ '&nbsp' + '万');
            $('#jtsnDetailed tr td.t2').eq(1).html('<span>' + hqzqc + '</span>'+ '&nbsp' + '万');
            $('#jtsnDetailed tr td.t2').eq(2).html('<span>' + shtyc + '</span>'+ '&nbsp' + '万');
            $('#jtsnDetailed tr td.t2').eq(3).html('<span>' + shnz + '</span>'+ '&nbsp' + '万');
            $('#jtsnDetailed tr td.t2').eq(4).html('<span>' + pdgjjc + '</span>'+ '&nbsp' + '万');
            $('#jtsnDetailed tr td.t2').eq(5).html('<span>' + shggjkyzx + '</span>'+ '&nbsp' + '万');
        });
}
function addDetailedImportantData(){
    var time = getCurrentTimeMin(5);
    var bigGroupData = calculateDetailedParas();
    var temStr = constructParams(bigGroupData);
    var urlTotalCount = 'http://' + baseUrl + ':8080/stream/totalnum/hotspots?time=' + time + temStr;
    //查用户数
    $.ajax({
        url: urlTotalCount,
        type: 'get',
        dataType: 'json'
    })
        .done(function(data){
            for(var i= 0,lenI=bigGroupData.length; i<lenI; ++i){
                var temVal = (data[bigGroupData[i]].total/10000).toFixed(2);
                $('.norm_table tr td.t2').eq(i).html('<span>' + temVal + '</span>'+ '&nbsp' + '万');
            }
        });
}
function calculateDetailedParas(){
    var detailedData = $('.norm_table tr td.t1');
    var parasArr = [];
    for(var i= 0,lenI=detailedData.length; i<lenI; ++i){
        var temStr = detailedData[i].innerHTML;
        temStr = temStr.replace('<span>','');
        temStr = temStr.replace('</span>','');
        parasArr.push(temStr);
    }
    return parasArr;
}
//拼接url参数
function constructParams(arr){
    var temStr = '&hotspot=';
    for(var i= 0,lenI=arr.length; i<lenI; ++i){
        temStr += encodeURIComponent(arr[i]);
        i <lenI-1 && (temStr += '&hotspot=');
    }
    return temStr;
}
//控制导航菜单显示
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
//动态加载导航菜单
function addDynamicMenu(arr){
    var headMenuArr = [],
        idArr = [];
    for(var i= 0,lenI=arr.length; i<lenI; ++i){
        var temObj = arr[i];
        headMenuArr.push(temObj.name);
        var secondMenuArr = temObj.infos;
        var id = addSecondMenu(secondMenuArr,i);
        idArr.push(id);
    }
    addHeadMenu(headMenuArr,idArr);
    $('#secondMenu :button').on('click',function(){
        console.log(this.value)
    })
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
function addXQ2MapPolygon(str){
    markersLayer && (map.removeLayer(markersLayer),markersLayer.clearLayers(),switchControl.removeLayer(markersLayer));
    heatMapLayer && (switchControl.removeLayer(heatMapLayer), map.removeLayer(heatMapLayer));
    var urlCluster = "http://"+baseUrl+":8080/services/ws/rest/bchol/select_cellinfo?name="+encodeURIComponent(str)+"&page=1&limit=10000";
    addMarkerClusters(urlCluster,str);
	addPolygonPopup(str);
}
function addPolygonPopup(str){
	var loc;
	str === '交通枢纽' && (loc = [31.197825,121.345367]);
	str === '高速' && (loc = [31.251552,121.313781]);
	str === '商业场所' && (loc = [31.238049,121.483039]);
	str === '游玩场所' && (loc = [31.240691,121.509733]);
	var heatPopup = L.popup({maxWidth:800,maxHeight:800,offset:L.point(0, 5),closeButton:true, closeOnClick:false})
        .setLatLng(loc);
    heatPopup.setContent('<iframe width="410px" frameborder=no height="300px" src='+"pages/queryImportantInfo.html?name=" + encodeURIComponent(str) + '></iframe>');
    map.openPopup(heatPopup);
}
function addXQ2Map(str){
    markersLayer && (map.removeLayer(markersLayer),markersLayer.clearLayers(),switchControl.removeLayer(markersLayer));
    heatMapLayer && (switchControl.removeLayer(heatMapLayer), map.removeLayer(heatMapLayer));
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
            isEmpty(data) && alert('暂无数据!');
            for(var i= 0, len = data.rows.length; i<len;++i){
                if (data.rows[i].cellLatitude !="" && data.rows[i].cellLongitude != "") {
                    var latHeatMap = parseFloat(data.rows[i].cellLatitude),
                        lngHeatMap = parseFloat(data.rows[i].cellLongitude);
                    //var point = L.latLng(latHeatMap,lngHeatMap);
                    //根据小区原坐标产生随机坐标
                    if(isNumber(latHeatMap) && isNumber(lngHeatMap)){
                        var latMin = latHeatMap-0.0008,
                            latMax = latHeatMap+0.0008,
                            lngMin = lngHeatMap-0.0008,
                            lngMax = lngHeatMap+0.0008;
                        var point = L.latLng(Math.random()*(latMax-latMin)+latMin, Math.random()*(lngMax-lngMin)+lngMin);
                        var lac = data.rows[i].lac;
                        var ci = data.rows[i].ci;
                        var lacci = lac + ':' + ci;
                        var name = data.rows[i].cellName;
                        var type = data.rows[i].cellNt;
                        var temObj = {
                            lacci: lacci,
                            name: name,
                            lat: point.lat,
                            lng: point.lng,
                            type: type
                        };
                        heatMap.push(temObj);
                    }else{
                        continue;
                    }
                }
            }
            //console.log(heatMap)
            addResultNow(heatMap,hotspot);//当前热力图渲染
            beginAddXQ(heatMap,hotspot);
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
        type === '4G' && (L.marker([lat,lng],{title: name, icon: marker4G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer));
        type === '3G' && (L.marker([lat,lng],{title: name, icon: marker3G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer));
        type === '2G' && (L.marker([lat,lng],{title: name, icon: marker2G, keepInView:true}).bindPopup(heatPopup).addTo(markersLayer));
    }
    var center = [lat,lng];
    hotspot === '交通枢纽' && (center = [31.195769,121.338157]);
    map.setView(center,13);
    //map.addLayer(markersLayer);
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
function heatMapRender (heatMap,radius) {
    //console.log(heatMap)
    cacheHeatMapData = [];
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
    //ifHeatMapLayer=true;
    //addLegend(maxHeatValue,minHeatValue,aveHeatValue);//添加热点图例
}
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
function showAllIndexInfo(disName){
    $('#userData').empty();
    $('#dataThroughPut').empty();
    $('#hotTerminal').empty();
    $('#hotApp').empty();
    $('#netQuality').empty();
    var src1 = "pages/yhs.html?name=";
    constructDomTrend(disName,'userData',src1);
    var src2 = "pages/ll.html?name=";
    constructDomTrend(disName,'dataThroughPut',src2);
    var src3 = "pages/rmzd.html?name=";
    constructDomTrend(disName,'hotTerminal',src3);
    var src4 = "pages/rmyy.html?name=";
    constructDomTrend(disName,'hotApp',src4);
    var src5 = "pages/wlzlzb.html?name=";
    constructDomTrend(disName,'netQuality',src5);
}
function constructDomTrend(disName,divId,src){
    var myiframe=document.createElement("iframe");
    myiframe.name="showframe" ;
    myiframe.width="100%";
    myiframe.height="100%";
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