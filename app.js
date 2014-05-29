$(function() {

    // google map loads on page load


    // globals are TERRIBLE
    var notFound = new google.maps.LatLng(40.6311281, -73.95836);

    // create a google map on load
    map = new google.maps.Map(document.getElementById('map-canvas'), mapoptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: notFound,
        content: "Somewhere in this crazy world, someone lives here"
    });


    var geoLocator = (function() {

        // private vars
        var latLon = "40.6311281,-73.95836 ";

        var findUser = function() {
            // Try HTMl5 Geolocation

            if (navigator.geolocation) {

                navigator.geolocation.getCurrentPosition(function(position) {

                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var infowindow = new google.maps.InfoWindow({
                        map: map,
                        position: pos,
                        content: "Location found using HTMl5."
                    });

                    map.setCenter(pos);
                    map.setZoom(12);

                    // sets latLon to string of coordinates

                    latLon = String(position.coords.latitude) + ',' + String(position.coords.longitude);
                    console.log(latLon);

                }, function() {
                    handleNeoGeoLocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleNeoGeoLocation(false);
            }



        };
        var getUserLoc = function() {
            return latLon;
        };
        var handleNeoGeoLocation = function(errorFlag) {
            var content = "Somewhere in this crazy world, someone lives here";

            if (errorFlag) {
                content = "Error: The Geolocation service failed.";
            } else {
                content = "Error: Your browser doesn't support geolocation";
            }


            var infowindow = new google.maps.InfoWindow({
                map: map,
                zoom: 16,
                position: new google.maps.LatLng(230, 105),
                content: content
            });
            map.setCenter(options.position);
        };

        return {
            findUser: findUser,
            getUserLoc: getUserLoc
        };

    })();

    /* attempt to find the user on load*/
    geoLocator.findUser();

    // // Handler to locate the user!
    // function removeDefLocMessage() {
    //     $('#defalut-loc').
    // }

    $("#findMe").on("click", function(event) {
        event.preventDefault();
        /* Act on the event */
        geoLocator.findUser();
        oauthModule.setLoc(oauthModule.reqYelpPerm);

        console.log(geoLocator.getUserLoc());
        // console.log(oauthModule.paramMap());
    });

    var oauthModule = (function() {

        // private variables
        var auth = {
            // Updated with my own Yelp auth tokens
            consumerKey: 'hGEUfs4j4qnmYDe8qFteGA',
            consumerSecret: 'fOKVDDB5AKsCSHTFFa-CLRA1gNY',
            accessToken: 'XPELaGGKTEX5zZUgE8B4tTvvM3rMDpD3',
            // This example is a proof of concept for using Yelp's v2 API with javascript. 
            // I wouldnk't actually want to expose my access token secret like this in a real app, but I might have to for my API hack...
            accessTokenSecret: 'zcTu6xvV3hjyGaslbqWSks1y2Ns',
            serviceProvider: {
                signatureMethod: 'HMAC-SHA1'
            }
        };

        var terms = "food+pizza";
        // near = "New+York+City",

        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };

        var parameters = [
            // ['limit', 15],
            ['term', terms],
            /*commented out but will incorporate, test with fixed string vals*/
            ['ll', '40.6311281,-73.95836'],
            // ['location', near],
            // Even if developer doesn't have a call back function defined, user has to pass in a name string for the OAuth signature on the URL
            ['callback', 'cb'],
            ['oauth_consumer_key', auth.consumerKey],
            ['oauth_consumer_secret', auth.consumerSecret],
            ['oauth_token', auth.accessToken],
            ['oauth_signature_method', 'HMAC-SHA1']
        ];

        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)



        // private functions
        var setLoc = function(callback) {
            // sets ll parameter to user geolocation in form of string, resets parameter search (hopefully)

            ll = geoLocator.getUserLoc();
            parameters[1] = ['ll', ll];
            message.parameters = parameters;
            console.log(message.parameters);

            parameterMap = OAuth.getParameterMap(message.parameters);

            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

            // return parameterMap;
            callback();
        };

        var reqYelpPerm = function() {

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
            // console.log(parameterMap);
        };

        var paramMap = function() {
            return parameterMap;
        };

        return {
            paramMap: paramMap,
            setLoc: setLoc,
            message: message,
            accessor: accessor,
            reqYelpPerm: reqYelpPerm
        };
    })();
    /* TODO move global vars/functions into modules */
    var markerGenerator = (function() {

    });

    // var latlng;
    var bounds = new google.maps.LatLngBounds();

    // ======= Function to create a marker

    function createMarker(add, lat, lng) {
        var contentString = add;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map,
            // zIndex: Math.round(latlng.lat() * -100000) << 5
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });

        bounds.extend(marker.position);

    }

    var geocoder = new google.maps.Geocoder();



    function codeAddress(address, next) {
        /* TODO: assign address var to business variables */
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            // sets the current business to geolocate as a jQuery object
            var $businessGeo = $('p#business-' + nextAddress);

            /*if that worked*/
            if (status == google.maps.GeocoderStatus.OK) {
                /*we assume the first Markerer is the one we want*/
                console.log("called codeAddress!");
                // Attach this info to the paragra
                $businessGeo.html($businessGeo.html() + " " + results[0].geometry.location + ' delay ' + delay);
                /* TODO set geomarkers with address*/
                createMarker(address, results[0].geometry.location.lat(), results[0].geometry.location.lng());
            }
            // ========== Decode the error status ===========
            else {
                //  === if we're sending the requests too fast, try this one again and increase the delay
                if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT /*or status == */ ) {
                    nextAddress--;
                    delay++;
                } else {
                    var reason = "Code " + status;

                    // console.log(businessGeo);
                    $businessGeo.html($businessGeo.html() + ' error=' + reason + '(delay = ' + delay + ' ms)');
                }
            }
            next();
        });
    }
    // no no
    var Globaladdresses = [];

    function cb(data) {
        var addresses = [];

        y = data.businesses.length - 1;
        for (var i = 0; i <= y; i++) {
            // assign local variables address and city for geolocation
            var address = data.businesses[i].location.address[0];
            var city = data.businesses[i].location.city;
            var state = data.businesses[i].location.state_code;
            var zip = data.businesses[i].location.postal_code;
            var name = data.businesses[i].name;

            var count = i + 1
            addresses[i] = address + ' ' + city + ' ' + state + ' ' + zip;

            $('#results').append('<p id="business-' + (i + 1) + '">' + count + ') <img src=' +
                data.businesses[i].image_url + ' alt="yelp photo"> ' +
                addresses[i] + ' </p>');
        }



        return addresses
    }

    function theNext() {
        if (nextAddress < Globaladdresses.length) {
            setTimeout(function() {
                codeAddress(Globaladdresses[nextAddress], theNext)
            }, delay);
            nextAddress++;
        } else {
            console.log("finito");
        }
    }
    
    var delay = 100;
    var nextAddress = 0;

 
    // specifically, OAuth will not allow for non specific or randomly generated json call back name by convenience methods i.e. $.get wouldn't work
    // user must specifiy the callback method name 
    $('#findPizza').on('click', function(event) {
        event.preventDefault();
        /* Act on the event */

        oauthModule.setLoc(oauthModule.reqYelpPerm);
        var param2 = oauthModule.paramMap();
        if (param2['ll'].indexOf(',') == -1) {
            console.log("you're not geolocated!");
        } else {
            oauthModule.reqYelpPerm();
            console.log("called yelp permission")
            var parameterMap = oauthModule.paramMap()
            // console.log(parameterMap);

            $.ajax({
                url: oauthModule.message.action,
                data: parameterMap,
                cache: true,
                dataType: 'jsonp',
                // jsonpCallback: 'cb',
                success: function(data, textStats, XMLHttpRequest) {
                }
            })
                .then(function(data) {
                    console.log("success");
                    Globaladdresses = cb(data);
                    console.log(Globaladdresses);
                })
                .done(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");
                    theNext();
                });

        }

    });

});
