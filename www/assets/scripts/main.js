// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
  
// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBdVWxbamVQnZBVqfoE1CIyGrefWheixYs",
    authDomain: "cordovacthulu.firebaseapp.com",
	databaseURL: "https://cordovacthulu-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cordovacthulu",
    storageBucket: "cordovacthulu.appspot.com",
    messagingSenderId: "893879003774",
    appId: "1:893879003774:web:4f86689745984850d5062f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const loc = ref(db, "temp");
var allUsersJSON = {};
var allUsernamesJSON = {};
var numOfUsers = 0;
var newEntryModalLoaded = false;
var editEntryModalLoaded = false;
var user = null;
var allEntries = [];
var entryId;
var GMpermissions = false;
var showAllEntriesBtnAppended = false;
var allEntriesLoaded = false;
 
 
onValue(loc, (snapshot) => {
	const rand = Math.floor(Math.random() * 100)
	const oldRand = snapshot.val();
	console.log(`${oldRand} --> ${rand}`)
	set(loc, rand)
}, {
	onlyOnce: true
});
  
var loginModal = new bootstrap.Modal(document.getElementById('LoginModal'))
var signUpModal = new bootstrap.Modal(document.getElementById('SignUpModal'))
var editCharacterModal = new bootstrap.Modal(document.getElementById('EditPlayersInfoModal'))
var newEntryModal = new bootstrap.Modal(document.getElementById('createNewEntryModal'))
var editEntryModal = new bootstrap.Modal(document.getElementById('editEntryModal'))
var readEntryModal = new bootstrap.Modal(document.getElementById('readEntryModal'))
var newMindMapModal = new bootstrap.Modal(document.getElementById('createNewMindMapModal'))
var GMAllEntriesModal = new bootstrap.Modal(document.getElementById('GMAllEntriesModal'))

$(window).on('load', function() {
	loginModal.show()
	getAllUsernames()
});
		
$(document).ready(function() {
	loginModal.show()
});
		
$("#goToSignUpBtn").on("click", ()=>{
	loginModal.hide()
	signUpModal.show()
});
	
$("#goToLoginBtn").on("click", ()=>{
	signUpModal.hide()
	loginModal.show()
});

$("#logOutBtn").on("click", ()=>{
	hideData();
	auth.signOut();
});

$("#editCharacterBtn").on("click", ()=>{
	//const user = auth.currentUser;
	loadEditCharacterModal(user, db);
	editCharacterModal.show()
});

$("#saveChangesBtn").on("click", ()=>{
	//const user = auth.currentUser;
	update(ref(db, 'users/' + user.uid), {
		email: $('#emailEdit').val(),
		charactersName: $('#charactersNameEdit').val(),
		playersName: $('#playersNameEdit').val(),
		occupation: $('#occupationEdit').val(),
		age: $('#ageEdit').val(),
		gender: $('#genderEdit').val(),
		residence: $('#residenceEdit').val(),
		birthplace: $('#birthplaceEdit').val(),
		str: $('#strEdit').val(),
		con: $('#conEdit').val(),
		siz: $('#sizEdit').val(),
		dex: $('#dexEdit').val(),
		app: $('#appEdit').val(),
		idea: $('#ideaEdit').val(),
		pow: $('#powEdit').val(),
		edu: $('#eduEdit').val(),
		moveRate: $('#moveRateEdit').val(),
		hitPoints: $('#hitPointsEdit').val(),
		sanity: $('#sanityEdit').val(),
		luck: $('#luckEdit').val(),
		magicPoints: $('#magicPointsEdit').val()
	})
	
	onValue(ref(db, 'users/' + user.uid + '/userNumber'), (snapshot) => {
		var userNum = snapshot.val() + 1;
		update(ref(db, 'allUserslist/user' + userNum), {
			username: $('#charactersNameEdit').val()
		});
	}, {
		onlyOnce: true
	});
		
	editCharacterModal.hide()
});
	
$("#closeEditInfoModalBtn").on("click", ()=>{
	editCharacterModal.hide()
});
	
$("#createNewEntryBtn").on("click", ()=>{
	if (!newEntryModalLoaded) {
		for (const x in allUsersJSON) {
			console.log(allUsersJSON[x]);
			if (allUsersJSON[x].uid != user.uid) {
				var createEntryUser = '<input type="checkbox" id="createEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createEntryUser"> ' + allUsersJSON[x].username + '</input><br>';
				$("#createNewEntryShare").prepend(createEntryUser);
					
				//var createMindMapUser = '<input type="checkbox" id="createMindMapUser' + i + 'value="' + username + '"> ' + username + '</input><br>';
				//$("#createNewMindMapShare").after(createMindMapUser);
			}
		}
		newEntryModalLoaded = true;
	}
	newEntryModal.show()
});
	
$("#saveNewEntryBtn").on("click", ()=>{
	const encyclopediaEntriesListRef = ref(db, 'encyclopediaEntries');
	const newEncyclopediaEntryRef = push(encyclopediaEntriesListRef);
	const keyOfEntry = newEncyclopediaEntryRef.key;
	var sharedWith = [];
	var id = user.uid;
	
	$.each($("input[name='createEntryUser']:checked"), function(){
        sharedWith.push($(this).val());
    });
	
	set(newEncyclopediaEntryRef, {
		author: id,
		keyOfEntry: keyOfEntry,
		type: $('#newEntryType option:selected').text(),
		title: $('#newEntryTitle').val(),
		notes: $('#newEntryNotes').val(),
		sharedWith: sharedWith
	})
	
	newEntryModal.hide()
	$('#newEntryType option[value=person]').attr('selected', 'selected');
	$('#newEntryTitle').val('');
	$('#newEntryNotes').val('');
	
	getAllEntries();
});

$("#closeCreateNewEntryModalBtn").on("click", ()=>{
	newEntryModal.hide()
});

$('#ownEntriesList').on("click","button", function(e){
	if (!editEntryModalLoaded) {
		for (const x in allUsersJSON) {
			console.log(allUsersJSON[x]);
			if (allUsersJSON[x].uid != user.uid) {
				var editEntryUser = '<br><input type="checkbox" id="editEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editEntryUser"> ' + allUsersJSON[x].username + '</input>';
				$("#editNewEntryShare").append(editEntryUser);
			}
		}
		editEntryModalLoaded = true;
	}
	entryId = e.target.id;
	console.log(entryId);
	console.log(allEntries);
	console.log(allEntries[entryId].type);
	console.log(allEntries[entryId].title);
	$('#editEntryType option:selected').val(allEntries[entryId].type);
	$('#editEntryTitle').val(allEntries[entryId].title);
	$('#editEntryNotes').val(allEntries[entryId].notes);
	editEntryModal.show();
});

$('#allEntriesList').on("click","button", function(e){
	if (!editEntryModalLoaded) {
		for (const x in allUsersJSON) {
			console.log(allUsersJSON[x]);
			if (allUsersJSON[x].uid != user.uid) {
				var editEntryUser = '<br><input type="checkbox" id="editEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editEntryUser"> ' + allUsersJSON[x].username + '</input>';
				$("#editNewEntryShare").append(editEntryUser);
			}
		}
		editEntryModalLoaded = true;
	}
	entryId = e.target.id;
	console.log(entryId);
	console.log(allEntries);
	console.log(allEntries[entryId].type);
	console.log(allEntries[entryId].title);
	$('#editEntryType option:selected').val(allEntries[entryId].type);
	$('#editEntryTitle').val(allEntries[entryId].title);
	$('#editEntryNotes').val(allEntries[entryId].notes);
	editEntryModal.show();
});

$('#saveEditedEntryBtn').on("click", ()=>{
	var oldSharedWith = [];
	var updatedSharedWith = [];
	var id = user.uid;
	
	onValue(ref(db, 'encyclopediaEntries/' + entryId + '/sharedWith'), (snapshot) => {
		oldSharedWith = snapshot.val();
	}, {
		onlyOnce: true
	});	
	
	$.each($("input[name='createEntryUser']:checked"), function(){
        updatedSharedWith.push($(this).val());
    });
	
	console.log($('#editEntryTitle').val());
	console.log($('#editEntryNotes').val());
	console.log($('#editEntryType option:selected').text());
	console.log(updatedSharedWith);
	
	set(ref(db, 'encyclopediaEntries/' + entryId), {
		author: id,
		keyOfEntry: entryId,
		title: $('#editEntryTitle').val(),
		notes: $('#editEntryNotes').val(),
		type: $('#editEntryType option:selected').text(),
		sharedWith: updatedSharedWith
	});
	
	editEntryModal.hide();
	getAllEntries();
});

$('#deleteEditedEntryBtn').on("click", ()=>{
	if(window.confirm("Do you really want to delete your entry? This cannot be undone")) {
		set(ref(db, 'encyclopediaEntries/' + entryId), {
			author: null,
			keyOfEntry: null,
			title: null,
			notes: null,
			type: null,
			sharedWith: null
		});
		
		editEntryModal.hide()
		getAllEntries();
	}
});

$('#closeEditEntryModalBtn').on("click", ()=>{
	editEntryModal.hide();
});

$('#sharedEntriesList').on("click","button", function(e){
	var entryId = e.target.id;
	var author = allEntries[entryId].author;
	
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readEntryAuthor').text(allUsersJSON[x].username);
		}
	}
	
	console.log(entryId);
	console.log(allEntries);
	$('#readEntryTitle').text(allEntries[entryId].title);
	$('#readEntryType').text(allEntries[entryId].type);
	$('#readEntryNotes').text(allEntries[entryId].notes);
	readEntryModal.show();
});

$('#closeReadEntryModalBtn').on("click", ()=>{
	readEntryModal.hide();
});
	
$("#createNewMindMapBtn").on("click", ()=>{
	newMindMapModal.show()
});

$("#closeCreateNewMindMapModalBtn").on("click", ()=>{
	newMindMapModal.hide()
});

$("#reloadEntriesBtn").on("click", ()=>{
	$('#ownEntriesList').empty();
	$('#sharedEntriesList').empty();
	console.log(allEntries);
	getAllEntries();
	getUsersAccessibleEntries();
});

$("#allEntriesTypeBtn").on("click", ()=>{
	filterSelection('all');
});

$("#personOrSpecialistEntriesTypeBtn").on("click", ()=>{
	filterSelection('Person/specialist');
});

$("#placeEntriesTypeBtn").on("click", ()=>{
	filterSelection('Place');
});

$("#monsterEntriesTypeBtn").on("click", ()=>{
	filterSelection('Monster');
});

$("#mythEntriesTypeBtn").on("click", ()=>{
	filterSelection('Myth');
});

$("#godEntriesTypeBtn").on("click", ()=>{
	filterSelection('God');
});
  
$("#anyoneEntriesAuthorBtn").on("click", ()=>{
	filterSelectionAuthor('all');
});

$("#meEntriesAuthorBtn").on("click", ()=>{
	filterSelectionAuthor('own');
});

$("#sharedEntriesAuthorBtn").on("click", ()=>{
	filterSelectionAuthor('shared');
});

$('#cardHeader').on("click","#showAllEntriesBtn", function(e){
	if (!allEntriesLoaded) {
		for (var entry in allEntries) {
			var authorId = allEntries[entry].author;
			var authorName = allEntries[entry].author;
			
			for (var x in allUsersJSON) {
				if (allUsersJSON[x].uid == authorId) {
					authorName = allUsersJSON[x].username;
				}
			}
			var insertAllEntry = '<button type="button" class="btn btn-link" id="' + allEntries[entry].keyOfEntry + '"> ' + allEntries[entry].title + '</button><hr>';
			$("#GMAllEntriesModalDiv").append(insertAllEntry);
		}
		
		allEntriesLoaded = true;
	}
	GMAllEntriesModal.show();
});

$('#GMAllEntriesModalDiv').on("click","button", function(e){
	GMAllEntriesModal.hide();
	var entryId = e.target.id;
	var author = allEntries[entryId].author;
	
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readEntryAuthor').text(allUsersJSON[x].username);
		}
	}
	
	console.log(entryId);
	console.log(allEntries);
	$('#readEntryTitle').text(allEntries[entryId].title);
	$('#readEntryType').text(allEntries[entryId].type);
	$('#readEntryNotes').text(allEntries[entryId].notes);
	readEntryModal.show();
});

$('#closeGMAllEntriesModalBtn').on("click", ()=>{
	GMAllEntriesModal.hide();
});


signUp.addEventListener('click', (e) => {
	var username = $('#signUpInputUsername').val();
	var email = $('#signUpInputEmail').val();
	var password = $('#signUpInputPassword').val();
	var cb = document.querySelector('#GM-permissions');
	var appliedForGM = cb.checked;
	
	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in 
			user = userCredential.user;
			const id = user.uid;
			
			onValue(ref(db, 'allUsersCount'), (snapshot) => {
				numOfUsers = snapshot.val() + 1;
				console.log(numOfUsers);
				set(ref(db, 'allUsersCount'), numOfUsers);
				set(ref(db, 'allUserslist/user' + numOfUsers), {
					uid: user.uid,
					username: username
				});
			}, {
				onlyOnce: true
			});
			
			set(ref(db, 'users/' + user.uid), {
				userNumber: numOfUsers,
				email: email,
				appliedForGM: appliedForGM,
				GMpermissionsGranted: false,
				picture: "assets/img/characters-photos/person.jpg",
				charactersName: username,
				playersName: "unknown",
				occupation: "unknown",
				age: "0",
				gender: "unknown",
				residence: "unknown",
				birthplace: "unknown",
				str: "0",
				con: "0",
				siz: "0",
				dex: "0",
				app: "0",
				idea: "0",
				pow: "0",
				edu: "0",
				moveRate: "0",
				hitPoints: "0",
				sanity: "0",
				luck: "0",
				magicPoints: "0"
			})		
			  
			alert('User account created');
			
			signUpModal.hide();
			
			loadUserInfo(user, db);
			getAllEntries();
			getUsersAccessibleEntries();

			$('#headerPermissions').text("Player");
			$('#headerUsername').text(username);
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			
			alert(errorMessage);
		});
	});
  
signIn.addEventListener('click', (e) => {
	  
	var email = $('#loginInputEmail').val();
	var password = $('#loginInputPassword').val();	
	
	signInWithEmailAndPassword(auth, email, password)
	.then((userCredential) => {
		// Signed in 
		user = userCredential.user;
		const dt = new Date();
		var userNum = 0;
		
		update(ref(db, 'users/' + user.uid), {
			last_login: dt
		})
		
		onValue(ref(db, 'users/' + user.uid + '/GMpermissionsGranted'), (snapshot) => {
			GMpermissions = snapshot.val();
		}, {
			onlyOnce: true
		});
		
		alert('User logged in');
		
		$('#loginInputEmail').text("");
		$('#loginInputPassword').text("");
		
		loginModal.hide();
		
		loadUserInfo(user, db);
		getAllEntries();
		getUsersAccessibleEntries();

		$('#headerUsername').text();
		if (GMpermissions) {
			$('#headerPermissions').text("Game Master");
		}
		else {
			$('#headerPermissions').text("Player");
		}
		// ...
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		
		alert(errorMessage);
	});
});
  
onAuthStateChanged(auth, (user) => {
	if (user) {
		const uid = user.uid;
	} else {
		$('#loginInputEmail').text("");
		$('#loginInputPassword').text("");
		loginModal.show()
	}
});
	
function getAllUsernames() {
	onValue(ref(db, 'allUserslist'), (snapshot) => {
		allUsersJSON = snapshot.val();
	}, {
		onlyOnce: true
	});
	
	onValue(ref(db, 'allUsersCount'), (snapshot) => {
		numOfUsers = snapshot.val();
	}, {
		onlyOnce: true
	});
}
	
function loadUserInfo(user, db) {
	const id = user.uid;
	
	getUserInfo(id, db);
	calcHalvesAndFifths(id, db);
};
	
function getUserInfo(id, db) {	  
	const fieldsIds = ['charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate', 'hitPoints', 'sanity', 'luck', 'magicPoints'];
	  
	for (let i = 0; i < fieldsIds.length; i++) {
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]);
		onValue(refToDb, (snapshot) => {
			var data = snapshot.val();
			$('#' + fieldsIds[i]).text(data);
			if (i == 1) {
				$('#headerUsername').text(data + " (user id: " + id + ")");
			}
		});
	}
};
	
function calcHalvesAndFifths(id, db) {
	const fieldsIds = ['str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate'];
		
	for (let i = 0; i < fieldsIds.length; i++) {
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]);
		onValue(refToDb, (snapshot) => {
			var data = snapshot.val();
			$('#' + fieldsIds[i] + 'Half').text(parseInt(data/2));
			$('#' + fieldsIds[i] + 'Fifth').text(parseInt(data/5));
		});
	}
};
	
function loadEditCharacterModal(user, db){
	const fieldsIds = ['email', 'charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate', 'hitPoints', 'sanity', 'luck', 'magicPoints'];
	const userData = [];
	
	const id = user.uid;
	  
	for (let i = 0; i < fieldsIds.length; i++) {
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]);
		onValue(refToDb, (snapshot) => {
			var data = snapshot.val();
			userData[i] = data;
			$('#' + fieldsIds[i] + 'Edit').val(userData[i]);
		}, {
			onlyOnce: true
		});
	}
};

function filterSelection(filter) {
	var entriesArr, i;
	
	entriesArr = document.getElementsByClassName("filterEntries");
	
	if(filter == "all") {
		filter = "";
	}
	
	for (i = 0; i < entriesArr.length; i++) {
		addClass(entriesArr[i], "hide");
		removeClass(entriesArr[i], "show");
		if (entriesArr[i].className.indexOf(filter) > -1) {
			removeClass(entriesArr[i], "hide");
			addClass(entriesArr[i], "show");
		}
	}
}

function filterSelectionAuthor(filter) {
	var entriesArr, i;
	
	entriesArr = document.getElementsByClassName("filterEntries");
	
	if(filter == "all") {
		filter = "";
	}
	
	for (i = 0; i < entriesArr.length; i++) {
		addClass(entriesArr[i], "hide");removeClass(entriesArr[i], "show");
		if (entriesArr[i].className.indexOf(filter) > -1) {
			removeClass(entriesArr[i], "hide");
			addClass(entriesArr[i], "show");
		}
	}
}

function addClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		if (arr1.indexOf(arr2[i]) == -1) {
			element.className += " " + arr2[i];
		}
	}
}

function removeClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		while (arr1.indexOf(arr2[i]) > -1) {
		arr1.splice(arr1.indexOf(arr2[i]), 1);
		}
	}
	element.className = arr1.join(" ");
}

var btnContainer = document.getElementById("entriesTypesBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
	btns[i].addEventListener("click", function() {
		var current = document.getElementsByClassName("active");
		current[0].className = current[0].className.replace(" active", "");
		this.className += " active";
	});
}

function getAllEntries() {
	onValue(ref(db, 'encyclopediaEntries'), (snapshot) => {
		allEntries = snapshot.val();
	}, {
		onlyOnce: true
	});	
}

function getUsersAccessibleEntries() {		
	var ownEntries = [];
	var sharedEntries = [];
	
	for (var entry in allEntries){
		if (allEntries[entry].author == user.uid) {
			ownEntries.push(allEntries[entry]);
		}
		else {
			for (var x in allEntries[entry].sharedWith){
				if (allEntries[entry].sharedWith[x] == user.uid) {
					sharedEntries.push(allEntries[entry]);
				}
			}
		}
	}
	
	for (var entry in ownEntries) {
		var insertOwnEntry = '<button type="button" class="filterEntries btn btn-link ownEntryBtn ' + ownEntries[entry].type + '" id="' + ownEntries[entry].keyOfEntry + '"> ' + ownEntries[entry].title + '</button><hr>';
		$("#ownEntriesList").append(insertOwnEntry);
	}
	
	for (var entry in sharedEntries) {
		var insertSharedEntry = '<button type="button" class="filterEntries btn btn-link sharedEntryBtn ' + sharedEntries[entry].type + '" id="' + sharedEntries[entry].keyOfEntry + '"> ' + sharedEntries[entry].title + '</button><hr>';
		$("#sharedEntriesList").append(insertSharedEntry);
	}
	
	if (GMpermissions && !showAllEntriesBtnAppended) {
		$('#reloadEntriesBtn').before('<button class="btn btn-outline-secondary right" id="showAllEntriesBtn">show all entries</button>');
		showAllEntriesBtnAppended = true;
	}
}
	
function hideData() {
	const fieldsIds = ['charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'hitPoints', 'sanity', 'luck', 'magicPoints'];
	const halvesAndFives = ['str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate'];
	
	for (let i = 0; i < fieldsIds.length; i++) {
		$('#' + fieldsIds[i]).text("");
	}
		
	for (let i = 0; i < halvesAndFives.length; i++) {
		$('#' + halvesAndFives[i]).text("");
		$('#' + halvesAndFives[i] + 'Half').text("");
		$('#' + halvesAndFives[i] + 'Fifth').text("");
	}
	
	$('#loginInputEmail').text("");
	$('#loginInputPassword').text("");
	$('#signUpInputUsername').text("");
	$('#signUpInputEmail').text("");
	$('#signUpInputPassword').text("");
	$('#headerUsername').text("");
	$('#headerPermissions').text("");
	
	newEntryModalLoaded = false;
	
	$('#createNewEntryShare').empty();
	$('#sharedEntriesList').empty();
	$('#ownEntriesList').empty();
	
	user = null;
	GMpermissions = false;
	if (showAllEntriesBtnAppended) {
		$('#showAllEntriesBtn').remove();
	}
	showAllEntriesBtnAppended = false;
	allEntriesLoaded = false;
};

	
