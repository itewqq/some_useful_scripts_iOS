const headers = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "X-Forwarded-For": random_ip(),
    Cookie: "",
    Host: "91porn.com",
    Origin: "http://91porn.com",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604"
  };
  
  const title = [
    "all",
    "hot",
    "rp",
    "md",
    "tf",
    "mf",
    "rf",
    "top",
    "top&m=-1",
    "fr"
  ];
  
  /*
  {
    当前最热: "hot",
    最近得分: "rp",
    本月讨论: "md",
    本月收藏: "tf",
    收藏最多: "mf",
    最近加精: "rf",
    本月最热: "top",
    上月最热: "top&m=-1"
  };
  */
  
  function main() {
    $cache.set("pg", 1);
    $ui.render({
      props: {
        title: "91Video"
      },
      views: [
        {
          type: "menu",
          props: {
            items: [
              "所有视频",
              "当前最热",
              "最近得分",
              "本月讨论",
              "本月收藏",
              "收藏最多",
              "最近加精",
              "本月最热",
              "上月最热",
              "我的收藏"
            ],
            bgcolor: $color("#FFD700")
          },
          layout: function(make) {
            make.left.top.right.equalTo(0);
            make.height.equalTo(40);
          },
          events: {
            changed: function(sender) {
              var index = sender.index;
              var option = title[index];
  
              $cache.set("pg", 1);
              $cache.set("option", option);
              getlist(option);
              $("list").scrollTo({
                indexPath: $indexPath(0, 0),
                animated: false // 默认为 true
              });
            }
          }
        },
        {
          type: "list",
          props: {
            rowHeight: 100,
            bgcolor: $color("#161616"),
            actions: [
              {
                title: "delete",
                color: $color("gray"), // default to gray
                handler: function(sender, indexPath) {
                  remove(indexPath);
                }
              }
            ],
            template: {
              props: {
                bgcolor: $color("#111")
              },
              views: [
                {
                  type: "image",
                  props: {
                    id: "img",
                    radius: 1,
                    bgcolor: $color("#111")
                  },
                  layout: function(make, view) {
                    make.left.top.bottom.inset(8);
                    make.width.equalTo(120);
                  }
                },
                {
                  type: "label",
                  props: {
                    id: "title",
                    font: $font("bold", 17),
                    textColor: $color("#FFBA00"),
                    lines: 0
                  },
                  layout: function(make, view) {
                    make.left.equalTo($("img").right).offset(10);
                    make.top.inset(10);
                  }
                },
                {
                  type: "label",
                  props: {
                    id: "time",
                    font: $font(15),
                    textColor: $color("#fff")
                  },
                  layout: function(make) {
                    make.left.equalTo($("title"));
                    make.top.equalTo($("title").bottom).inset(8);
                  }
                },
                {
                  type: "label",
                  props: {
                    id: "date",
                    font: $font(15),
                    textColor: $color("gray")
                  },
                  layout: function(make) {
                    make.left.equalTo($("time"));
                    make.top.equalTo($("time").bottom).inset(12);
                  }
                }
              ]
            }
          },
          layout: function(make) {
            make.top.equalTo($("menu").bottom).offset(0);
            make.right.left.bottom.inset(0);
          },
          events: {
            didSelect: function(sender, indexPath, data) {
              playVideo(data);
            },
            didReachBottom: function(sender) {
              sender.endFetchingMore();
              var page = $cache.get("pg") + 1;
              $cache.set("pg", page);
              var option = $cache.get("option");
  
              getlist(option);
            },
            swipeEnabled: function(sender, indexPath) {
              var option = $cache.get("option");
              if (option == "fr") {
                return indexPath.row >= 0;
              }
            }
          }
        }
      ]
    });
    $cache.set("option", "all");
    getlist(title[0]);
  }
  
  function getlist(option) {
    $ui.loading(true);
    $ui.toast("Loading...", 0.7);
    var url;
    if (option == "fr") {
      localData = $file.read("Favorite.txt").string;
      $("list").data = JSON.parse(localData);
      $ui.loading(false);
    } else {
      var pg = $cache.get("pg");
      if (option == "all") {
        url = "http://91porn.com/v.php?next=watch&page=" + pg;
      } else {
        url =
          "http://91porn.com/video.php?category=" +
          option +
          "&viewtype=basic&page=" +
          pg;
      }
      $http.request({
        method: "GET",
        url: url,
        header: headers,
        handler: function(resp) {
          $ui.loading(false);
          var status = resp.response;
          if (status == null) {
            $ui.error("Internet Disconnect");
          } else if (status.statusCode != 200) {
            $ui.error("Internet Error");
          } else {
            var html = resp.data.replace(/\n|\s|\r/g, "");
            var list = html.match(
              /<divclass=\"listchannel\">(\S*?)<\/div><\/div>/g
            );
            if (pg == 1) {
              var data = [];
            } else {
              var data = $("list").data;
            }
            for (i in list) {
              var a = list[i];
              data.push({
                img: { src: a.match(/<imgsrc=\"(\S*?)\"/)[1].replace("1_", "") },
                title: { text: a.match(/title=\"(\S*?)\"/)[1] },
                time: { text: a.match(/时长:<\/span>(\S*?)<br\/>/)[1] },
                date: { text: a.match(/添加时间:<\/span>(\S*?)<br\/>/)[1] },
                id: { text: a.match(/blankhref=\"(\S*?)&/)[1] }
              });
            }
            $("list").data = data;
            $("list").endFetchingMore();
            // $("jzz").alpha = 0;
            $device.taptic(1.5);
          }
        }
      });
    }
  }
  
  function playVideo(videodata) {
    $ui.toast("Loading", 0.7);
    $ui.loading(true);
    var url = videodata.id.text;
    var title = videodata.title.text;
    $http.request({
      method: "GET",
      url: url,
      header: headers,
      handler: function(resp) {
        $ui.loading(false);
        var data = resp.data;
        data = data.match(/strencode\((.*)(?=\))/)[1];
        data = data.replace(/\"/g, "").split(",");
        var key1 = data[0];
        var key2 = data[1];
        var link = strencode(key1, key2);
        data=resp.data;
        if (data.match(/你每天只可观看/g)) {
          $ui.error("观看次数限制");
          headers.Cookie = "";
        } else {
          data = data.replace(/\n|\s|\r/g, "");
          var img = data.match(/poster=\"(\S*?)\"/)[1];
          var video=link.match(/\<source src='(\S*?)'/)[1];
          $ui.push({
            props: {
              title: title,
              bgcolor: $color("#161616")
            },
            views: [
              {
                type: "video",
                props: {
                  src: video,
                  poster: img
                },
                layout: function(make, view) {
                  make.left.right.equalTo(0);
                  make.centerY.equalTo(view.super);
                  make.height.equalTo(512);
                }
              },
              {
                type: "button",
                props: {
                  title: "Favorite",
                  bgcolor: $color("red"),
                  titleColor: $color("white"),
                  font: $font(20)
                },
                layout: function(make, view) {
                  make.top.equalTo($("video").bottom).offset(12);
                  make.right.left.bottom.inset(0);
                },
                events: {
                  tapped: function(sender) {
                    favorite(videodata);
                    //console.info(videodata)
                  }
                }
              }
            ]
          });
        }
      }
    });
  }
  
  function favorite(data) {
    var dataId = data.id.text;
    var list = [];
    var localData = $file.read("Favorite.txt");
    if (localData == null) {
      list.push(data);
    } else {
      var str = localData.string;
      list = JSON.parse(str);
      for (var i = 0; i < list.length; i++) {
        if (list[i].id.text == dataId) {
          $ui.error("已存在");
          return;
        }
      }
      list.push(data);
    }
    write(list);
    $ui.toast("Favorited");
  }
  
  function remove(index) {
    var localData = $file.read("Favorite.txt");
    var list = JSON.parse(localData.string);
    list.splice(index, 1);
    write(list);
  }
  
  function write(list) {
    $file.write({
      data: $data({ string: JSON.stringify(list.reverse()) }),
      path: "Favorite.txt"
    });
  }
  
  function random_ip() {
    a = Math.floor(Math.random() * 255);
    b = Math.floor(Math.random() * 255);
    c = Math.floor(Math.random() * 255);
    d = Math.floor(Math.random() * 255);
    if (a == 0 || b == 0 || c == 0 || d == 0) {
      random_ip();
    } else {
      return a + "." + b + "." + c + "." + d;
    }
  }
  
  var encode_version = "sojson.v5",
    lbbpm = "__0x33ad7",
    __0x33ad7 = "QMOTw6XDtVE= w5XDgsORw5LCuQ== wojDrWTChFU= dkdJACw= w6zDpXDDvsKVwqA= ZifCsh85fsKaXsOOWg== RcOvw47DghzDuA== w7siYTLCnw==".split(
      " "
    );
  (function(d, f) {
    for (var a = ++f; --a; ) d.push(d.shift());
  })(__0x33ad7, 143);
  var _0x5b60 = function(d, f) {
    d -= 0;
    var a = __0x33ad7[d];
    void 0 === _0x5b60.initialized &&
      ((function() {
        var a =
          "undefined" !== typeof window
            ? window
            : "object" === typeof process &&
              "function" === typeof require &&
              "object" === typeof global
            ? global
            : this;
        a.atob ||
          (a.atob = function(a) {
            a = String(a).replace(/=+$/, "");
            for (
              var c = 0, e, d, m = 0, b = "";
              (d = a.charAt(m++));
              ~d && ((e = c % 4 ? 64 * e + d : d), c++ % 4)
                ? (b += String.fromCharCode(255 & (e >> ((-2 * c) & 6))))
                : 0
            )
              d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(
                d
              );
            return b;
          });
      })(),
      (_0x5b60.rc4 = function(a, d) {
        var c = [],
          e = 0,
          f = "";
        var g = "";
        a = atob(a);
        for (var b = 0, h = a.length; b < h; b++)
          g += "%" + ("00" + a.charCodeAt(b).toString(16)).slice(-2);
        //a = decodeURIComponent(g);
        for (b = 0; 256 > b; b++) c[b] = b;
        for (b = 0; 256 > b; b++)
          (e = (e + c[b] + d.charCodeAt(b % d.length)) % 256),
            (g = c[b]),
            (c[b] = c[e]),
            (c[e] = g);
        for (h = e = b = 0; h < a.length; h++)
          (b = (b + 1) % 256),
            (e = (e + c[b]) % 256),
            (g = c[b]),
            (c[b] = c[e]),
            (c[e] = g),
            (f += String.fromCharCode(a.charCodeAt(h) ^ c[(c[b] + c[e]) % 256]));
        return f;
      }),
      (_0x5b60.data = {}),
      (_0x5b60.initialized = !0));
    var l = _0x5b60.data[d];
    void 0 === l
      ? (void 0 === _0x5b60.once && (_0x5b60.once = !0),
        (a = _0x5b60.rc4(a, f)),
        (_0x5b60.data[d] = a))
      : (a = l);
    return a;
  };
  if ("undefined" !== typeof encode_version && "sojson.v5" === encode_version)
    var strencode = function(d, f) {
      for (
        var a = {
            MDWYS: "0|4|1|3|2",
            uyGXL: function(a, c) {
              return a(c);
            },
            otDTt: function(a, c) {
              return a < c;
            },
            tPPtN: function(a, c) {
              return a % c;
            }
          },
          l = a[_0x5b60("0x0", "cEiQ")][_0x5b60("0x1", "&]Gi")]("|"),
          m = 0;
        ;
  
      ) {
        switch (l[m++]) {
          case "0":
            d = a[_0x5b60("0x2", "ofbL")](atob, d);
            continue;
          case "1":
            code = "";
            continue;
          case "2":
            return a[_0x5b60("0x3", "mLzQ")](atob, code);
          case "3":
            for (
              i = 0;
              a[_0x5b60("0x4", "J2rX")](i, d[_0x5b60("0x5", "Z(CX")]);
              i++
            )
              (k = a.tPPtN(i, len)),
                (code += String.fromCharCode(
                  d[_0x5b60("0x6", "s4(u")](i) ^ f.charCodeAt(k)
                ));
            continue;
          case "4":
            len = f[_0x5b60("0x7", "!Mys")];
            continue;
        }
        break;
      }
    };
  else alert("");
  
  main();
  
