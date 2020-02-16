$("#visu").hide();
let endpoint = "http://localhost:3030/Ontologie/sparql";
let cityName = [];
let localisation = [];
let localisation10 = [];
let localisation50 = [];
let localisation100 = [];
let res = {};
var map;
let markerArray = {};

function setupVisualisation(id) {
    //switch used to know if we need to load a map or something else...
    switch (id) {
        case 1:
            $("#query").hide();
            $("#visu").show();
            $("#myChart").hide();
            $("#mapSelect").show();
            $("#legend3").hide();
            let query1 = "PREFIX ar: <http://localhost:3333/> \n\
                SELECT (count(?desc) as ?countDesc) ?countryName\n\
                where {\n\
                       ?y ar:city ?countryName. \n\
                       ?y ar:description ?desc.\n\
                }\n\
                 GROUP BY ?countryName\n\
                 ORDER BY DESC(?countDesc)";

            let queryLatLong = "PREFIX ar: <http://localhost:3333/> \n\
            prefix geo:   <http://www.w3.org/2003/01/geo/wgs84_pos#> \n\
                SELECT ?lat ?long ?cityName\n\
                where {\n\
                       ?z ar:GeographicInformation ?y. \n\
                       ?y ar:city ?cityName.\n\
                       ?z ar:Coord ?i.\n\
                       ?i geo:lat ?lat.\n\
                       ?i geo:long ?long.\n\
                }";
            // RETRIEVE LAT / LONG for cityName
            let localisation = [];
            let cityName = [];
            $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: queryLatLong,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function (data) {
                    data.results.bindings.forEach(element => {
                        if (!cityName.includes(element.cityName.value)) {
                            cityName.push(element.cityName.value)
                            localisation.push({ "lat": element.lat.value, "long": element.long.value, "name": element.cityName.value });
                        }
                    });

                    $.ajax({
                        url: endpoint,
                        dataType: 'json',
                        data: {
                            queryLn: 'SPARQL',
                            query: query1,
                            limit: 'none',
                            infer: 'true',
                            Accept: 'application/sparql-results+json'
                        },
                        success: function (data) {
                            let labels = [];
                            let dataz = [];
                            res = data;
                            //console.log(data.results.bindings);
                            data.results.bindings.forEach(function(element,index,data) {
                                localisation.forEach(function(elem, index2,localisation) {
                                    if (elem.name == element.countryName.value){
                                        if(element.countDesc.value > 10 &&  element.countDesc.value < 50 ){
                                            localisation10.push({"lat":elem.lat,"long" :elem.long, "name": elem.name, "number": element.countDesc.value})
                                        } if (element.countDesc.value > 50 &&  element.countDesc.value < 100 ) {
                                            localisation50.push({"lat":elem.lat,"long" :elem.long, "name": elem.name, "number": element.countDesc.value})
                                        } if (element.countDesc.value > 100 ) {
                                            localisation100.push({"lat":elem.lat,"long" :elem.long, "name": elem.name, "number": element.countDesc.value})
                                        }
                                        localisation[index2] = {"lat":elem.lat,"long" :elem.long, "name": elem.name, "number": element.countDesc.value}
                                    }
                                })
                            });
                            $('#10').attr("value",JSON.stringify(localisation10));
                            $('#50').attr("value",JSON.stringify(localisation50));
                            $('#100').attr("value",JSON.stringify(localisation100));
                            $('#inlineRadio3').attr("value",JSON.stringify(localisation));
                            map = L.map("map");
                            L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

                            map.setView([39, -100], 5);

                            var myRenderer = L.canvas({ padding: 0.5 });
                            let radiusSize;
                            localisation.forEach(element => {
                                switch (true) {
                                    case (element.number <= 2):
                                        radiusSize = 2;
                                        break;
                                    case (element.number <= 5):
                                        radiusSize = 4;
                                        break;
                                    case (element.number <= 10):
                                        radiusSize = 8;
                                        break;
                                    case (element.number <= 50):
                                        radiusSize = 12;
                                        break;
                                    case (element.number <= 100):
                                        radiusSize = 16;
                                        break;
                                    case (element.number <= 300):
                                        radiusSize = 22
                                        break;
                                    case (element.number > 300):
                                        radiusSize = 28;
                                        break;
                                }
                                L.circleMarker([Number(element.lat), Number(element.long)], {
                                    renderer: myRenderer,
                                    radius: radiusSize
                                }).addTo(map).bindPopup('Ville :  ' + element.name + ' Nombre d\'accidents' + element.number);
                            });
                        },
                        error: function (error) {
                            console.log("Error:");
                            console.log(error);
                        }
                    });
                    //saveLocalisation(data);
                    //console.log(data.results.bindings);
                    /*data.results.bindings.forEach(element => {
                        if (!cityName.includes(element.cityName.value)){
                            cityName.push(element.cityName.value)
                            localisation.push({"lat":element.lat.value,"long" :element.long.value, "name": element.cityName.value});
                        }
                    });*/
                },
                error: function (error) {
                    console.log("Error:");
                    console.log(error);
                }
            });

            /*$.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: query1 ,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function(data){
                    let labels = [];
                    let dataz = [];
                    res = data;
                    console.log(res);
                    //console.log(data.results.bindings);
                    data.results.bindings.forEach(element => {
                        //console.log(element)
                    });
                },
                error: function(error){
                    console.log("Error:");
                    console.log(error);
                }
            });*/

            break;
        case 2:
            $("#query").hide();
            $("#visu").show();
            $("#myChart").show();
            $("#mapSelect").hide();
            $("#legend3").hide();
            let query2 = "PREFIX ar: <http://localhost:3333/> \n\
                SELECT (count(?y) as ?countMeteo) ?meteoName\n\
                where {\n\
                       ?x ar:MeteoMetrics ?y. \n\
                       ?y ar:weatherCondition ?meteoName.\n\
                }\n\
                 GROUP BY ?severity ?meteoName\n\
                 ORDER BY DESC(?countMeteo)";

            $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: query2,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function (data) {
                    let labels = [];
                    let dataz = [];
                    let datam=[]
                    console.log(data.results.bindings);
                    data.results.bindings.forEach(element => {
                        if(element.countMeteo.value>2)
                        {
                            dataz.push(element.countMeteo.value);
                            labels.push(element.meteoName.value);
                        }

                    });


                    dataz.forEach(function(element,index,data) {
                        dataz[index] =Math.log2(dataz[index])
                    });


                    var ctx = document.getElementById('myChart').getContext('2d');
                    var myChart = new Chart(ctx, {
                        type: 'horizontalBar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Densité d\'accidents en fonction des conditions météorologiques sur le territoire Etats-Unien',
                                data: dataz,
                                borderWidth: 1,
                                backgroundColor : 'rgba(0, 181, 204, 1)',
                                borderColor : 'rgba(44, 62, 80, 1)'}],
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                },
                error: function (error) {
                    console.log("Error:");
                    console.log(error);
                }
            });
            break;
        case 3:
            $("#query").hide();
            $("#visu").show();
            $("#myChart").show();
            $("#mapSelect").hide();
            $("#legend3").show();
            let query3 = "PREFIX ar: <http://localhost:3333/> \n\
                SELECT  ?severity ?visibilityName (count(?visibilityName) as ?countVisibility) \n\
                where {\n\
                       ?x ar:MeteoMetrics ?y. \n\
                       ?x ar:severity ?severity.\n\
                       ?y ar:visibility ?visibilityName.\n\
                }\n\
                 GROUP BY ?severity ?visibilityName\n\
                 ORDER BY DESC(?countVisibility)";

            $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: query3,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function (data) {
                    console.log(data.results.bindings);
                    datas = []
                    data.results.bindings.forEach(element => {
                        datas.push({
                            v: element.severity.value,
                            y: element.visibilityName.value,
                            x: Math.log(element.countVisibility.value)
                        })
                    });

                    console.log(datas);

                    function colorize(opaque, context) {
                        var value = context.dataset.data[context.dataIndex];
                        switch (value.v) {
                            case '1':
                                return 'rgba(44,163,59,255)';
                            case '2':
                                return 'rgba(240,223,86,255)';
                            case '3':
                                return 'rgba(245,121,0,255)';
                            case '4':
                                return 'rgba(204,0,0,255)';
                        }


                    }

                    var options = {
                        aspectRatio: 1,
                        legend: false,
                        scales: {
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Log (Number of accidents)'
                                }
                            }],
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Visibility'
                                }
                            }]
                        },
                        elements: {
                            point: {
                                backgroundColor: colorize.bind(null, false),

                                borderColor: colorize.bind(null, true),

                                borderWidth: function (context) {
                                    return Math.min(Math.max(1, context.datasetIndex + 1), 8);
                                },

                                hoverBackgroundColor: 'transparent',


                                hoverBorderWidth: function (context) {
                                    var value = context.dataset.data[context.dataIndex];
                                    return 5;
                                },

                                radius: function (context) {
                                    var value = context.dataset.data[context.dataIndex];
                                    var size = context.chart.width;
                                    var base = Math.log(value.v) / 30;
                                    return 5;
                                }
                            }
                        }
                    };
                    const arrayColumn = (arr, n) => arr.map(x => x[n]);
                    var ctx = document.getElementById('myChart').getContext('2d');

                    var d = { datasets: [{ label: 'Severity', data: datas }] }

                    var myChart = new Chart(ctx, {
                        type: 'bubble',
                        data: d,
                        options: options
                    });
                },
                error: function (error) {
                    console.log("Error:");
                    console.log(error);
                }
            });
            break;
        case 4:
            $("#query").hide();
            $("#visu").show();
            $("#myChart").show();
            $("#mapSelect").hide();
            $("#legend3").hide();

            var arrayfor0_4 = [];
            var arrayfor4_8 = [];
            var arrayfor8_12 = [];
            var arrayfor12_16 = [];
            var arrayfor16_20 = [];
            var arrayfor20_24 = [];
            let query4 = "PREFIX ar: <http://localhost:3333/> \n\
                SELECT ?horaireStart ?horaireEnd \n\
                where {\n\
                       ?z ar:startTime ?horaireStart. \n\
                }";

            $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: query4,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function(data){
                    console.log(data.results.bindings);
                    data.results.bindings.forEach(element => {
                        currentDate = new Date(element.horaireStart.value);
                        console.log(currentDate.getHours());
                        if(currentDate.getHours() > 0 && currentDate.getHours() <=4 ){
                            arrayfor0_4.push(element)
                        } if(currentDate.getHours() > 4 && currentDate.getHours() <=8 ){
                            arrayfor4_8.push(element)
                        } if(currentDate.getHours() > 8 && currentDate.getHours() <=12 ){
                            arrayfor8_12.push(element)
                        } if(currentDate.getHours() > 12 && currentDate.getHours() <= 16 ){
                            arrayfor12_16.push(element)
                        } if(currentDate.getHours() > 16 && currentDate.getHours() <= 20 ){
                            arrayfor16_20.push(element)
                        } if(currentDate.getHours() > 20 && currentDate.getHours() <= 24 ){
                            arrayfor20_24.push(element)
                        }
                    });

                    data = [];
                    labels = ["Entre 00h et 4h","Entre 4h et 8h","Entre 8h et 12h","Entre 12h et 16h","Entre 16h et 20h","Entre 20h et 24h"];
                    data[0] = arrayfor0_4.length
                    data[1] = arrayfor4_8.length
                    data[2] = arrayfor8_12.length
                    data[3] = arrayfor12_16.length
                    data[4] = arrayfor16_20.length
                    data[5] = arrayfor20_24.length
                    console.log(data)
                    var ctx = document.getElementById('myChart').getContext('2d');
                    var myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Nombre d\'accidents',
                                data: data,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                },
                error: function(error){
                    console.log("Error:");
                    console.log(error);
                }
            });
            break;

    }
}

$("#10").click(function(){
    var newLocalisation = JSON.parse($(this).val());
    $("#map").empty()
    var container = L.DomUtil.get('map');
    container.remove()
    console.log(newLocalisation)
    document.getElementById('mapParent').innerHTML = "<div id='map'></div>";
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    map.setView([39, -100], 5);

    var myRenderer = L.canvas({ padding: 0.5 });
    let radiusSize;
    newLocalisation.forEach(element => {
        switch (true) {
            case (element.number <= 2):
                radiusSize = 2;
                break;
            case (element.number <= 5 ):
                radiusSize = 4;
                break;
            case (element.number <= 10):
                radiusSize = 8;
                break;
            case (element.number <= 50):
                radiusSize = 12;
                break;
            case (element.number <= 100):
                radiusSize = 16;
                break;
            case (element.number <= 300):
                radiusSize = 22
                break;
            case (element.number > 300):
                radiusSize = 28;
                break;
        }
        L.circleMarker([Number(element.lat),Number(element.long)], {
            renderer: myRenderer,
            radius: radiusSize
        }).addTo(map).bindPopup('Ville :  ' + element.name + ' Nombre d\'accidents' + element.number );
    });
})

$("#50").click(function(){
    var newLocalisation = JSON.parse($(this).val());
    $("#map").empty()
    var container = L.DomUtil.get('map');
    container.remove()
    console.log(newLocalisation)
    document.getElementById('mapParent').innerHTML = "<div id='map'></div>";
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    map.setView([39, -100], 5);

    var myRenderer = L.canvas({ padding: 0.5 });
    let radiusSize;
    newLocalisation.forEach(element => {
        switch (true) {
            case (element.number <= 2):
                radiusSize = 2;
                break;
            case (element.number <= 5 ):
                radiusSize = 4;
                break;
            case (element.number <= 10):
                radiusSize = 8;
                break;
            case (element.number <= 50):
                radiusSize = 12;
                break;
            case (element.number <= 100):
                radiusSize = 16;
                break;
            case (element.number <= 300):
                radiusSize = 22
                break;
            case (element.number > 300):
                radiusSize = 28;
                break;
        }
        L.circleMarker([Number(element.lat),Number(element.long)], {
            renderer: myRenderer,
            radius: radiusSize
        }).addTo(map).bindPopup('Ville :  ' + element.name + ' Nombre d\'accidents' + element.number );
    });
})

$("#100").click(function(){
    var newLocalisation = JSON.parse($(this).val());
    $("#map").empty()
    var container = L.DomUtil.get('map');
    container.remove()
    console.log(newLocalisation)
    document.getElementById('mapParent').innerHTML = "<div id='map'></div>";
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    map.setView([39, -100], 5);

    var myRenderer = L.canvas({ padding: 0.5 });
    let radiusSize;
    newLocalisation.forEach(element => {
        switch (true) {
            case (element.number <= 2):
                radiusSize = 2;
                break;
            case (element.number <= 5 ):
                radiusSize = 4;
                break;
            case (element.number <= 10):
                radiusSize = 8;
                break;
            case (element.number <= 50):
                radiusSize = 12;
                break;
            case (element.number <= 100):
                radiusSize = 16;
                break;
            case (element.number <= 300):
                radiusSize = 22
                break;
            case (element.number > 300):
                radiusSize = 28;
                break;
        }
        L.circleMarker([Number(element.lat),Number(element.long)], {
            renderer: myRenderer,
            radius: radiusSize
        }).addTo(map).bindPopup('Ville :  ' + element.name + ' Nombre d\'accidents' + element.number );
    });
})

$("#inlineRadio3").click(function(){
    var newLocalisation = JSON.parse($(this).val());
    $("#map").empty()
    var container = L.DomUtil.get('map');
    container.remove()
    console.log(newLocalisation)
    document.getElementById('mapParent').innerHTML = "<div id='map'></div>";
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    map.setView([39, -100], 5);

    var myRenderer = L.canvas({ padding: 0.5 });
    let radiusSize;
    newLocalisation.forEach(element => {
        switch (true) {
            case (element.number <= 2):
                radiusSize = 2;
                break;
            case (element.number <= 5 ):
                radiusSize = 4;
                break;
            case (element.number <= 10):
                radiusSize = 8;
                break;
            case (element.number <= 50):
                radiusSize = 12;
                break;
            case (element.number <= 100):
                radiusSize = 16;
                break;
            case (element.number <= 300):
                radiusSize = 22
                break;
            case (element.number > 300):
                radiusSize = 28;
                break;
        }
        L.circleMarker([Number(element.lat),Number(element.long)], {
            renderer: myRenderer,
            radius: radiusSize
        }).addTo(map).bindPopup('Ville :  ' + element.name + ' Nombre d\'accidents' + element.number );
    });
})
