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

let winnerRef = database.ref("mpRPS/winner");

let numOfUsr = 0;

let conInfo = {
    isConnected: true,
    usrID: usrID,
}

let players = [];

let gameInProg = false;

let toolContainer = $('.tool-container');

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
    winnerRef.remove();
    let num = 5;
    var countDown = setInterval(function() {
        $('#infoText').text('Game will begin in ' + num + ' seconds...');
        if(num === 0) {
            clearInterval(countDown);
            $('#infoText').text('Game has begun! Make a selection on your keyboard!');
            if(toolContainer.attr("data-hide") === "true") {
                toolContainer.css('display', 'block');
                toolContainer.attr("data-hide", "false");
                gameInProg = true;
            }
        }
        num--;
    }, 1000);
}


function gameOver(winner) {
    winnerRef.push(winner);
    console.log('Winner: ' + winner);
    if(winner === usrID.toString()) {
        alert("You've Won!");
    } else {
        alert("You've lost :(");
    }
    // let localUrl = 'http://127.0.0.1:5500/';
    let url = 'https://soundwubz.github.io/Multiplayer-RPS/';
    window.location.replace(url + "game-over.html")
}

function pushSelection(key) {
    playersRef.update({
        keySelected: key
    });

    allPlayer.once('value', (snap) => { // get players from db
        let playerObj = snap.val();
        let keyFlag = 0;
        let selectedKeys = [];
        $.each( playerObj, (key, value) => { // check each keySelected value of player
            console.log(key + ": ");
            console.log(value);
            if(value.keySelected != null || value.keySelected != undefined) {
                keyFlag++;
                console.log('keyFlag: ' + keyFlag);
                selectedKeys.push({
                    id: key,
                    selection: value.keySelected
                });
            }
        });
        if(keyFlag === 2) { // if both player made selection
            console.log('both players selected a key');
            let winner = compareKeys(selectedKeys);
            gameOver(winner);
        } else { // if player is waiting for opposite player to make selection 
            console.log('a player still needs to make a selection');
            winnerRef.once("child_added", (snap) => {
                let winner = snap.val();
                console.log('Winner recieved from server.');
                gameOver(winner);
            });
            // make new db ref to list winner of the game
            // or make it a property on the player
            // when winner is listed run gameOver function
        }
    });
}

function compareKeys(keys) {

    keyScenarios = [
        { id: "r", winsAgainst: "s" },
        { id: "p", winsAgainst: "r" },
        { id: "s", winsAgainst: "p" }
    ]

    if(keys[0].selection === keys[1].selection) {
        console.log('game tie');
    } else {
        // game not tied
        for(i = 0; i < keyScenarios.length; i++) {
            if(keys[0].selection === keyScenarios[i].id) { // checks for correct key scenario
                if(keys[1].selection === keyScenarios[i].winsAgainst) { // keys[0] beats keys[1];
                    return keys[0].id;
                } else { // keys[1] beats keys[0]
                    return keys[1].id;
                }
            }
        }

    }
}

function transitionKey(key) {
    let keyContainer = $('#' + key);
    let keyClasses = keyContainer.attr('class');
    let staticClasses = keyClasses;
    let animatedClasses = keyClasses + " tool-pressed";
    keyContainer.attr('class', animatedClasses);
    setTimeout(function() {
        keyContainer.attr('class', staticClasses);
    }, 1000);
}

document.onkeyup = function(event) {
    let key = event.key
    if(gameInProg) {
        console.log(key);
        switch(key) {
            case "r":
                transitionKey(key);
                pushSelection(key);
                break;
            case "p":
                transitionKey(key);
                pushSelection(key);
                break;
            case "s":
                transitionKey(key);
                pushSelection(key);
                break;
            default:
                return false;
        }
    }
}