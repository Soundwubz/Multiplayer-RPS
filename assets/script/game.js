var firebaseConfig = {
    apiKey: "AIzaSyAMsBWCArb3OQhP8rMmGM7wUgcdSe40u7M",
    authDomain: "portfolio-apps-436bd.firebaseapp.com",
    databaseURL: "https://portfolio-apps-436bd.firebaseio.com",
    projectId: "portfolio-apps-436bd",
    storageBucket: "portfolio-apps-436bd.appspot.com",
    messagingSenderId: "599927670946",
    appId: "1:599927670946:web:e34fbaf1b3cf75e8952ffb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let database = firebase.database();

function genUsrID () {
    min = Math.ceil(1000);
    max = Math.floor(10000);
    return Math.floor(Math.random() * (max - min) + min);
}

let usrID = genUsrID();
console.log("USRID:" + usrID);

let allConn = database.ref("mpRPS/connections/");
let connRef = database.ref("mpRPS/connections/" + usrID); // individual connection ref

let connectedRef = database.ref(".info/connected");

let allPlayer = database.ref("mpRPS/players/");
let playersRef = database.ref("mpRPS/players/" + usrID); // individual player ref

let numOfUsr = 0;

let conInfo = {
    isConnected: true,
    usrID: usrID,
}

let players = [];

let gameInProg = false;

connectedRef.on("value", function(snap) { // when connection state changes
    if (snap.val()) { // if connected
        var con = connRef.push(true);
        con.onDisconnect().remove();
    }
});

allConn.on("value", function(snap) { 
    // console.log('allConn numofchildren: ' + snap.numChildren())
    numOfUsr = snap.numChildren();
    if(players.length > 2) {
        console.warn("too many users");
    } else {
        if(numOfUsr > 1) {
            $("#infoText").text("Get ready to play!");
            // run function to start game
            setTimeout(startGame, 2000);
        } else {
            $("#infoText").text("Waiting for second player");
        }
        $("#numOfUsr").text(numOfUsr);
        let player = {
            player: numOfUsr,
            id: conInfo.usrID,
        };
        playersRef.set(player);
        playersRef.onDisconnect().remove();
    }
});

allPlayer.on("child_added", function(snap) {
    players.push(snap.val());
    console.log('Player Added. Updated array: ');
    console.log(players);
});

allPlayer.on("child_removed", function(snap) {
    let id = snap.val().usrID;
    for(i = 0; i < players.length; i++) {
        if(id === players[i].usrID) {
            players.splice(i, 1);
            break;
        }
    }
    console.warn('Player removed from database: ');
    console.log(snap.val());
    console.log('Updated player array');
    console.log(players);
})

// ----------------------------------------

function startGame() {
    let toolContainer = $('.tool-container');
    let num = 5;
    var countDown = setInterval(function() {
        $('#infoText').text('Game will begin in ' + num + ' seconds...');
        num--;
        if(num === 0) {
            clearInterval(countDown);
            $('#infoText').text('Game has begun! Choose your tool!');
            if(toolContainer.attr("data-hide") === "true") {
                toolContainer.css('display', 'block');
                toolContainer.attr("data-hide", "false");
                gameInProg = true;
            }
        }
    }, 1000);
}

function pushSelection(key) {
    playersRef.update({
        keySelected: key
    });

    // add logic to check for other players key selection
    // if both have key, compare and return results
    // else wait for other player
}

document.onkeyup = function(event) {
    let key = event.key
    if(gameInProg) {
        console.log(key);
        switch(key) {
            case "r":
                pushSelection(key);
                break;
            case "p":
                pushSelection(key);
                break;
            case "s":
                pushSelection(key);
                break;
            default:
                return false;
        }
    }
}