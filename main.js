var port = 7456
var parseTorrent = require('parse-torrent')
var fs = require("fs")
var toBuffer = require('blob-to-buffer')
var torrentStream = require("torrent-stream")
var http = require("http")
var shuffle = require("./shuffle")
var sites = JSON.parse(fs.readFileSync(__dirname + "/sites.json"))
//"m4a" is supposed to be supported, but is often unplayable, we'll add it if this get fixed
var supported = ["mp4", "m4v", "mp3", "ogv", "ogm", "ogg", "oga", "webm", "wav"]
var currentTorrent = {id: -1, name:"", torrent: {}},
lastSearch = {page:1, query:""}, stream, ext
var random = false, loop = false, goBack = false, goFurther = false, fetched = false, noStreamEvent = false
var searchBar = document.querySelector(".search"), results = document.querySelector(".results"),
buttons = document.querySelectorAll(".btn a"), player = document.querySelector("audio"),
volume = document.querySelector(".btn > input")
var loadMoreCenter = results.firstChild
var lastData = [], randomIds = []
var randomId = 0, randomDlId = 0, dlId = 0, fileId = -1
require("./events")
var file = require("./file")
var getTorrent = require("./getTorrent")
var song = require("./song")
http.createServer(function(req, res){
	if(fileId !== -1){
		var stream = currentTorrent.torrent.files[fileId].createReadStream()
		stream.once('readable', function () {
			stream.pipe(res);
		});
		stream.on('error', function(err) {
			res.end(err);
		});
	}
}).listen(port)
