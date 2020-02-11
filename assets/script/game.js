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

function removePlayer() {
    console.log('remove');
}

connectedRef.on("value", function(snap) { // when connection state changes
    if(numOfUsr > 2) {
        console.warn("too many users");
    }
    if (snap.val()) { // if connected
        var con = connRef.push(true);
        con.onDisconnect().remove(removePlayer);
    }
});

allConn.on("value", function(snap) { 
    console.log('allConn numofchildren: ' + snap.numChildren())
    numOfUsr = snap.numChildren();
    $("#numOfUsr").text(numOfUsr);
    let player = {
        player: numOfUsr,
        id: conInfo.usrID,
    };
    playersRef.push(player);
});

allPlayer.on("child_added", function(snap) {
    players.push(snap.val());
    console.log('Players Array: ');
    console.log(players);
});

// REMOVE ENTRY FROM PLAYERS WHEN CON HAS DISCONNECTION