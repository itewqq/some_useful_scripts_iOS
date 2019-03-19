var link = $context.link || $clipboard.link
if (!link) {
    $ui.toast($l10n("link-not-found"))
    return
}
function getRealAd(url) {
    // $ui.alert(url)
    $http.request({
        method: "GET",
        url: url,
        header: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        },
        handler: function (resp) {
            var data = resp.data
            var tmp;  
            var patt1=new RegExp("var\\s+\\w+\\s+=\\s+(.*);\\s+var player_mp4_seek");
            tmp=patt1.exec(data)
            tmp=tmp[tmp.length-1]
            var obj = JSON.parse(tmp);
            
            for (var i=0;;i++)
            {
                if(obj['mediaDefinitions'][i]["videoUrl"]!="")
                {
                    uurl=obj['mediaDefinitions'][i]["videoUrl"];
                    break;
                }
            }
            $http.download({
                url: uurl,
                handler: function (resp) {
                    $share.sheet(resp.data)
                }
            })
        }
    })
}

getRealAd(link)
