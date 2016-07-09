var parseTorrent = require('parse-torrent')
var fs = require("fs")
var toBuffer = require('blob-to-buffer')
var torrentStream = require("torrent-stream")
var sites = require("./sites")
var supported = ["mp4", "m4v", "mp3", "ogv", "ogm", "ogg", "oga", "webm", "wav"]//"m4a" is supposed to be supported, but is often unplayable, we'll add it if this get fixed
var currentTorrent = {id: -1, name:"", torrent: {}}
var lastSearch = {page:1, query:""}
var lastData = []
var random = false, loop = true, goBack = false
var search = document.querySelector(".search")
var results = document.querySelector(".results")
var buttons = document.querySelectorAll(".btn a")
var player = document.querySelector("audio")
var loadMoreCenter = results.firstChild
var fileId = -1
var lastTime = 0
var currentSize = 0
var lastSize = 0
var lastExt = ""
setInterval(function(){
    /*the timeupdate event is not precise enough(15 to 250ms interval),
    so in order to get an accurate time, we need to check every 1ms*/
    if(player.currentTime !== 0 && player.currentTime !== player.duration){
        lastTime = player.currentTime
    }
}, 1)
player.addEventListener("ended", function(){
    console.log(currentSize,"/",currentTorrent.torrent.files[fileId].length)
    if(currentSize < currentTorrent.torrent.files[fileId].length){
        lastSize = currentSize
        currentSize = fs.statSync("./tmp/current." + lastExt).size
        if(lastSize <= currentSize){
            reloadPlayer()
        }
        else {
             currentTorrent.torrent.on("download", reloadPlayer)
        }
    }
    else{
        if(goBack){
            goBack = false
            if(fileId){
                fileId--
            }
            else{
                fileId = currentTorrent.torrent.files.length - 1
            }
        }
        else if(random){
            fileId = Math.floor(Math.random() * currentTorrent.torrent.files.length)
        }
        else if(fileId < currentTorrent.torrent.files.length - 1){
            fileId++
        }
        else if(loop){
            fileId = 0
        }
        else{
            fileId = -1
        }
        playNextSong()
    }
})
function reloadPlayer(){
    player.src = player.src
    player.currentTime = lastTime
    currentTorrent.torrent.removeListener("download", reloadPlayer)
}
buttons[0].addEventListener("click", function(e){
    goBack = true
    lastTime = player.duration
    player.currentTime = player.duration
})
buttons[1].addEventListener("click", function(e){
    //play the next song
    lastTime = player.duration
    player.currentTime = player.duration
})
buttons[2].addEventListener("click", function(e){
    if(loop){
        loop = false
        this.className = ""
    }
    else{
        loop = true
        this.className = "active"
    }
    e.preventDefault()
})
buttons[3].addEventListener("click", function(e){
    if(random){
        random = false
        this.className = ""
    }
    else{
        random = true
        this.className = "active"
    }
    e.preventDefault()
})
document.querySelector("form").addEventListener("submit", function(e){
    var torrents = document.querySelectorAll(".results > span")
    for(var t = 0; t < torrents.length; t++){
        results.removeChild(torrents[t])
    }
    lastData = []
    lastSearch = {page: 2, query: search.value}
    getResults(1, search.value, showSearchResults)
    e.preventDefault()
})
document.querySelector(".more").addEventListener("click", function(){
    getResults(lastSearch.page++, lastSearch.query, showSearchResults)
})
function showSearchResults(music){
    var offset = lastData.length
    lastData = lastData.concat(music)
    for(var m = 0; m < music.length; m++){
        var span = document.createElement("span")
        var a = document.createElement("a")
        a.href = "#"
        a.id = m + offset
        a.innerText = music[m].title
        a.addEventListener("click", getFiles)
        span.appendChild(a)
        var cont = document.createElement("span")
        cont.id = a.id
        cont.appendChild(span)
        results.insertBefore(cont, loadMoreCenter)
    }
}
function getResults(page, keywords, callback){
    var results = {}
    var r = 0
    var biggest = 0
    var urlBiggest = ""
    var urls = Object.getOwnPropertyNames(sites)
    urls.filter(function(url){
        scrapeasy(replace(url, page, keywords), sites[url].pattern, function(err, data){
            r++
        	if(err){
        		console.log(err)
        	}
        	else{
               results[url] = data.music
               if(biggest <  results[url].length){
                   biggest = results[url].length
                   urlBiggest = url
               }
        	}
            if(r === urls.length){
                results = results[urlBiggest].reduce(function(arr, v, i) {
                    var temp = []
                    urls.filter(function(u){
                        if(typeof results[u][i] !== "undefined"){
                            temp.push(Object.assign({site: u}, results[u][i]))
                        }
                    })
                    return arr.concat(temp);
                }, [])

                callback(results)
            }
        })
    })
}
function replace(url, page, keywords){
    if(sites[url].fromZero){
        page--
    }
    var separator = url.match(/album(.+)album/)[1]
    var query = keywords.replace(/\s+/g, separator)
    return url.replace("album" + separator + "album", query).replace("PAGE_TO_USE", page)
}
function readTorrent(filename, fail, success){
    fs.readFile(__dirname + "/torrent-stream/" + filename, function(err, torrent){
        if(err){
            fail(success)
        }
        else{
            success(torrent)
        }
    })
}
function getTorrent(current){
    if(lastData[current.id].url.slice(0,4) === "http"){
        var filename = encodeURIComponent(lastData[current.id].url) + ".torrent"
        readTorrent(filename, function(success){
            fetch(lastData[current.id].url)
            .then(function(response) {
                return response.blob();
            })
            .then(function(b){
                toBuffer(b, function (err, buffer) {
                    if (err) throw err
                    var torrent = parseTorrent(buffer)
                    fs.writeFileSync(__dirname + "/torrent-stream/" + torrent.infoHash + ".torrent", buffer)
                    success(torrent)
                })
            })
        },
        function(torrent){
            lastData[current.id].torrent = torrent
            keepAudioOnly(current.id)
            showFiles(current)
        })
    }
    else{
        var filename = lastData[current.id].url.split("magnet:?xt=urn:btih:")[1].split("&dn=")[0] + ".torrent"
        readTorrent(filename, function(success){
            success(lastData[current.id].url)
        },
        function(torrent){
            lastData[current.id].torrent = torrentStream(torrent, {tmp: __dirname, path: __dirname + "/torrent-stream/" + filename.split(".torrent")[0]})
            lastData[current.id].torrent.on("ready", function(){
                keepAudioOnly(current.id)
                showFiles(current)
            })
        })
    }
}
function getFiles(e){
    var current = this
    var less = current.parentNode.parentNode.querySelector(".less")
    if(less){
        if(less.parentNode.getAttribute("style") === "display: none;"){
            less.parentNode.setAttribute("style", "")
        }
    }
    getTorrent(current)
    e.preventDefault()
}
function showFiles(current){
    var parent = current.parentNode.parentNode
    var less = parent.querySelector(".less")
    if(!less){
        parent.innerHTML += `<p class="files"><span class="less"><a href="#">―</a></span></p>`
        less = parent.querySelector(".less")
        less.addEventListener("click", function(e){
            this.parentNode.setAttribute("style", "display: none;")
            e.preventDefault()
        })
        var files = less.parentNode
        lastData[current.id].torrent.files.sort(function(a, b){
            if(a.name < b.name){
                return -1
            }
            else if(a.name > b.name){
                return 1
            }
            return 0
        })
        lastData[current.id].torrent.files.filter(function(f){
            var span = document.createElement("span")
            var a = document.createElement("a")
            a.href = "#"
            a.innerText = f.name
            span.appendChild(a)
            files.appendChild(span)
            a.addEventListener("click", getSong)
        })
    }
    parent.querySelector("a").addEventListener("click", getFiles)
}
function keepAudioOnly(id){
    for(var f = lastData[id].torrent.files.length - 1; f > -1;f--){
        if(!supportedFile(lastData[id].torrent.files[f].name)){
            lastData[id].torrent.files.splice(f, 1)
        }
    }
}
function supportedFile(name){
    var support = false
    for(var s = 0; s < supported.length; s++){
        if(name.slice(name.length - supported[s].length) === supported[s]){
            support = true
            break
        }
    }
    return support
}
function getSong(e){
    var id = this.parentNode.parentNode.parentNode.id
    var name = this.innerText
    if(currentTorrent.id === id && currentTorrent.name === lastData[id].title){
        writeSong(name, id)
    }
    else{
        currentTorrent.id = id
        currentTorrent.name = lastData[id].title
        function testCallback(){
            if(lastData[id].url.slice(0, 4) === "http"){
                currentTorrent.torrent = torrentStream(fs.readFileSync(__dirname + "/torrent-stream/" + lastData[id].torrent.infoHash + ".torrent"), {tmp: __dirname, path: __dirname + "/torrent-stream/" + lastData[id].torrent.infoHash})
                currentTorrent.torrent.on('ready', function() {
                    startFetching(name, id)
                })
            }
            else{
                currentTorrent.torrent = lastData[id].torrent
                startFetching(name, id)
            }
        }
        if(typeof currentTorrent.torrent.destroy === "function"){
            currentTorrent.torrent.destroy(testCallback)
        }
        else{
            player.addEventListener("error", function(){
                currentTorrent.torrent.on("download", reloadPlayer)
            })
            testCallback()
        }

    }
    e.preventDefault()
}
function startFetching(name, id){
    for(var f = currentTorrent.torrent.files.length - 1; f > -1;f--){
        if(!supportedFile(currentTorrent.torrent.files[f].name)){
            currentTorrent.torrent.files.splice(f, 1)
        }
        else{
            currentTorrent.torrent.files[f].select()
        }
    }
    currentTorrent.torrent.files.sort(function(a, b){
        if(a.name < b.name){
            return -1
        }
        else if(a.name > b.name){
            return 1
        }
        return 0
    })
    writeSong(name, id)
}
function writeSong(name, id){
    for(var f = 0; f < currentTorrent.torrent.files.length; f++){
        if(name === currentTorrent.torrent.files[f].name){
            fileId = f
            break
        }
    }
    playNextSong()
}
function playNextSong(){
    if(fileId !== -1){
        (document.querySelector(".current") || {}).className = ""
        results.querySelectorAll("span:nth-child(" + (parseInt(currentTorrent.id) + 1)  + ") > .files > span:not(:first-child)")[fileId].className = "current"

        var ext =  currentTorrent.torrent.files[fileId].name.split(".")
        ext = ext[ext.length - 1]
        lastExt = ext
        currentTorrent.torrent.files[fileId].createReadStream().pipe(fs.createWriteStream("./tmp/current." + ext))
        setTimeout(function(){
            currentSize = fs.statSync("./tmp/current." + ext).size
            lastTime = 0
            player.src = "tmp/current." + ext
        },1)

    }
}
