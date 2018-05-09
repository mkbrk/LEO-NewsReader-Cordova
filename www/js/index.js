
window.app = {
    ROOT: "https://news.leonetwork.org/",
    categories : null,
    currentResults:null,
    initialize: function() {
        document.addEventListener('deviceready', function() {
            //start-up code in here...
            $.support.cors = true;

            //$.get("categories.json", null, function(res) {
            //    app.categories = res;
            //    $("#categories").html(app.applyTemplate("category_template", res));
            //}, "json");

            app.runQuery();
        }, false);
    },

    show : function(obsid)
    {
        window.open('https://news.leonetwork.org/en/news/show/' + obsid, "_blank");
        return;

        if (typeof navigator !== "undefined" && navigator.app) {
            navigator.app.loadUrl('https://news.leonetwork.org/en/news/show/' + obsid, {openExternal: true});
        } else {
            window.open('https://news.leonetwork.org/en/news/show/' + obsid);
        }
    },

    working : function(isworking) {
        if(isworking == false)
        {
            $("#working").hide();
        }
        else
        {
            $("#working").show();
        }
    },

    runQuery : function(query, category) {
        app.working();
        var url = app.ROOT + "en/news/find";
        $.get(url, {query:query, category:category}, function(res) {
            app.currentResults = res;
            $("#results").html(app.applyTemplate("result_template", res.Results));
            app.working(false);
        }, "json");
    },

    loadNearby : function (obsID, lat, lng, km) {
        var more = $("#more-" + obsID);
        more.html("<img src='img/ajax-loader.gif' style='max-width:30px;'/>");

        $.get(app.ROOT + "en/news/near", { latitude : lat, longitude: lng, maxdistancekm:km }, function (res) {
            var tt = $("#related-results-template").html();
            Mustache.parse(tt);
            var html = [];
            var hasResults = false;
            for (var i = 0; i < res.Results.length; i++) {
                if (res.Results[i].Document.ObservationID != obsID)
                {
                    html.push(Mustache.render(tt, res.Results[i].Document));
                    hasResults = true;
                }
            }
            if (hasResults)
                more.html(html);
            else
                more.html("<div style='margin-top:20px;'><i>No other articles within " + km + " KM. <a class='btn' href=\"javascript:window.app.loadNearby('" + obsID + "', " + lat + ", " + lng + "," + (km*2) + ");\">Try " + (km*2) + " KM.</a></i></div>");
        }, "json");
    },

    share : function(obsID)
    {
        var block = $("#row-" + obsID);
        var title = block.find(".result-title").html();

        var options = {
          subject: title, // fi. for email
          url: 'https://news.leonetwork.org/en/news/show/' + obsID,
          chooserTitle: 'Choose an App' // Android only, you can override the default share sheet title
        }
 
        window.plugins.socialsharing.shareWithOptions(options);
    },

    showMap : function() {
        Mapbox.show(
          {
            style: 'emerald', // light|dark|emerald|satellite|streets , default 'streets'
            margins: {
              left: 0, // default 0
              right: 0, // default 0
              top: 316, // default 0
              bottom: 50 // default 0
            },
            center: { // optional, without a default
              lat: 52.3702160,
              lng: 4.8951680
            },
            zoomLevel: 12, // 0 (the entire world) to 20, default 10
            showUserLocation: true, // your app will ask permission to the user, default false
            hideAttribution: false, // default false, Mapbox requires this default if you're on a free plan
            hideLogo: false, // default false, Mapbox requires this default if you're on a free plan
            hideCompass: false, // default false
            disableRotation: false, // default false
            disableScroll: false, // default false
            disableZoom: false, // default false
            disablePitch: false, // disable the two-finger perspective gesture, default false
            markers: [
              {
                lat: 52.3732160,
                lng: 4.8941680,
                title: 'Nice location',
                subtitle: 'Really really nice location'
              }
            ]
          },

          // optional success callback
          function(msg) {
            console.log("Success :) " + JSON.stringify(msg));
          },

          // optional error callback
          function(msg) {
            alert("Error :( " + JSON.stringify(msg));
          }
        );
    },

    loadSimilar : function (obsID) {
        var more = $("#more-" + obsID);
        more.html("<img src='img/ajax-loader.gif' style='max-width:30px;'/>");

        $.get(app.ROOT + "en/news/similar/" + obsID, null, function (res) {
            var tt = $("#related-results-template").html();
            Mustache.parse(tt);
            var html = [];
            var hasResults = false;
            for (var i = 0; i < res.length; i++) {
                if (res[i].ObservationID != obsID) {
                    html.push(Mustache.render(tt, res[i]));
                    hasResults = true;
                }
            }
            if (hasResults)
                more.html(html);
            else
                more.html("<div><i>No similar articles.</i></div>");
        }, "json");
    },


    applyTemplate : function(templateID, model)
    {
        var tt = $("#" + templateID).html();
        Mustache.parse(tt);

        if(!$.isArray(model))
            model = [model];

        var html = [];
        for (var i = 0; i < model.length; i++) {
            html.push(Mustache.render(tt, model[i]));
        }

        return html.join("");
    }

};