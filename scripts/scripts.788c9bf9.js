"use strict";angular.module("myApp",["ui.router","ngAnimate","config","angular-loading-bar","LocalStorageModule"]).config(["$stateProvider","$urlRouterProvider","localStorageServiceProvider",function(a,b,c){c.setPrefix("myApp");var d=["$state","selectedMovie",function(a,b){angular.isDefined(b)||a.go("main.movies")}],e=["moviesData","$stateParams","$filter",function(a,b,c){var d=c("filter")(a,{urlAlias:b.name});return d[0]}];b.otherwise("/movies"),a.state("main",{url:"/","abstract":!0,views:{header:{templateUrl:"views/main/header.html"},footer:{templateUrl:"views/main/footer.html"}}}).state("main.movies",{url:"movies",views:{"content@":{templateUrl:"views/pages/movies/movies.html",controller:"moviesController",controllerAs:"movies"},"preview@main.movies":{templateUrl:"views/pages/movies/movie.preview.html"},"summary@main.movies":{templateUrl:"views/pages/movies/movie.summary.html"}},resolve:{moviesData:["Movies",function(a){return a.gettingMovies()}]}}).state("main.bookmarks",{url:"bookmarks",views:{"content@":{templateUrl:"views/pages/movies/movies.html",controller:"moviesController",controllerAs:"movies"},"preview@main.bookmarks":{templateUrl:"views/pages/movies/movie.preview.html"},"summary@main.bookmarks":{templateUrl:"views/pages/movies/movie.summary.html"}},resolve:{moviesData:["Bookmarks",function(a){return a.getMovies()}]}}).state("main.movie",{url:"movie/{name}?originBookmark","abstract":!0,resolve:{moviesData:["Movies","Bookmarks","$stateParams",function(a,b,c){return parseInt(c.originBookmark)?b.getMovies():a.gettingMovies()}]},data:{trailer:{basePath:"http://www.youtube.com/embed/?listType=search&list=",params:{controls:2,modestbranding:1,rel:0,showinfo:0,autoplay:1,hd:1}}}}).state("main.movie.movieInfo",{url:"^/movie/info/{name}?originBookmark",views:{"content@":{templateUrl:"views/pages/movie/movieInfo.html",controller:"movieController",controllerAs:"movie"}},resolve:{selectedMovie:e},onEnter:d,data:{breadcrumbs:"info"}}).state("main.movie.trailer",{url:"^/movie/trailer/{name}?originBookmark",views:{"content@":{templateUrl:"views/pages/movie/trailer.html",controller:"movieController",controllerAs:"movie"}},resolve:{selectedMovie:e},onEnter:d,data:{breadcrumbs:"trailer"}})}]).run(["$rootScope","$state","$stateParams","localStorageService","Bookmarks",function(a,b,c,d){a.$state=b,a.$stateParams=c,a.parseInt=parseInt,a.console=function(a){return console.log(a)},a.localStorageService=d}]),angular.module("config",[]).constant("Config",{debugUiRouter:!0}).value("debug",!0),angular.module("myApp").controller("moviesController",["moviesData","Bookmarks",function(a,b){var c=this;c.data=a,c.bookmarksService=b}]),angular.module("myApp").controller("movieController",["$state","Movies","selectedMovie","moviesData","Bookmarks",function(a,b,c,d,e){var f=this;f.movies=d,f.bookmarksService=e,f.selectedMovie=c,f.movieTrailerUrl=b.gettingMovieTrailerUrl(f.selectedMovie.trackName,a.current.data.trailer)}]),angular.module("myApp").factory("Movies",["$http","$q","$sce","Bookmarks",function(a,b,c,d){function e(c){var d=b.defer();return a({method:"GET",url:"https://itunes.apple.com/us/rss/topmovies/limit="+c+"/json"}).success(function(a){var b=[];angular.forEach(a.feed.entry,function(a){b.push(a.id.attributes["im:id"])}),d.resolve(b)}),d.promise}function f(c){if(angular.isArray(c)){var e=b.defer();return a.jsonp("https://itunes.apple.com/lookup",{params:{id:c.join(),callback:"JSON_CALLBACK"}}).success(function(a){angular.forEach(a.results,function(a,b){a.id=c[b],a.isBookmarked=d.isMovieBookmarked(a.id),a.originBookmark=0,a.index=b+1,a.artworkUrl600=a.artworkUrl100.replace("100x100","600x600"),a.urlAlias=a.trackName.replace(/ /g,"-").toLowerCase()}),e.resolve(a.results)}),e.promise}}return{gettingMovies:function(a){var c=b.defer();return a=angular.isDefined(a)?a:30,e(a).then(function(a){f(a).then(function(a){c.resolve(a)})}),c.promise},gettingMovieTrailerUrl:function(a,b){var d=[];return angular.forEach(b.params,function(a,b){this.push(b+"="+a)},d),d="&"+d.join("&"),c.trustAsResourceUrl(encodeURI(b.basePath+a+" trailer"+d))}}}]),angular.module("myApp").factory("Bookmarks",["localStorageService","$filter","$q",function(a,b,c){var d=[];return d=a.get("bookmarks"),d=null!=d?d:new Array,{addToBookmarks:function(b){var e=c.defer();b.isBookmarked=!0;var f={};angular.copy(b,f);var g=d;f.originBookmark=1,f.index=g.length?g.length+1:1,g.push(f);var h=a.set("bookmarks",g);return h?e.resolve({saved:h,error:!1}):e.reject({saved:h,error:!0}),e.promise},removeFromBookmarks:function(e){var f=c.defer();e.isBookmarked=!1;var g=d,h=b("filter")(g,{id:e.id});g.splice(h[0].index-1,1),angular.forEach(g,function(a,b){a.index=b+1});var i=a.set("bookmarks",g);return i?f.resolve({deleted:i,error:!1}):f.reject({deleted:i,error:!0}),f.promise},getMovies:function(){var a=c.defer();return a.resolve(d),a.promise},isMovieBookmarked:function(a){var c=d,e=b("filter")(c,{id:a});return e.length?!0:!1}}}]),angular.module("myApp").directive("scrollbar",function(){return{restrict:"EA",link:function(a,b){b.mCustomScrollbar({setHeight:75,theme:"light-thick"})}}}),angular.module("myApp").directive("movieLink",["$state","$filter",function(a,b){return{restrict:"A",scope:{movieLink:"@",selectedMovieIndex:"=",movies:"="},link:function(c,d){var e=c.selectedMovieIndex,f=a.current.name,g=function(){e!=c.movies.length&&"next"==c.movieLink?e+=1:e>1&&"previous"==c.movieLink&&(e-=1);var d=b("filter")(c.movies,{index:e}),d=d[0];a.go(f,{name:d.urlAlias})};d.bind("click",g),d.text(c.movieLink),d.addClass(c.movieLink)}}}]);