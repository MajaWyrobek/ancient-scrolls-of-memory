//importing necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";
 
// web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBdVWxbamVQnZBVqfoE1CIyGrefWheixYs",
    authDomain: "cordovacthulu.firebaseapp.com",
	databaseURL: "https://cordovacthulu-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cordovacthulu",
    storageBucket: "cordovacthulu.appspot.com",
    messagingSenderId: "893879003774",
    appId: "1:893879003774:web:4f86689745984850d5062f"
};

// initializing Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const loc = ref(db, "temp");

//necessary data variables
var allUsersJSON = {};
var allUsernamesJSON = {};
var numOfUsers = 0;
var user = null;
var newNotifications = [];
var notifMess = "";
var allEntries = [];
var allBranches = [];
var userBranches = [];
var userMindMap = {};
var entryId;
var branchID;
var editedBranch = "";
var GMpermissions = false;
var showAllEntriesBtnAppended = false;
var showAllBranchesBtnAppended = false;
var chart = null;
var testMindMap = {
    chart: {
        container: "#tree-simple",
		rootOrientation: "WEST"
    },
    
    nodeStructure: {
        text: { 
			name: "Investigation"
		},
		HTMLclass: "mainNode",		
		
        children: [
            {
                text: { name: "Click me!" },
				HTMLclass: "testNode",
            }
        ]
    }
};

var mindMap = {};

//getting all modals from HTML document  
var loginModal = new bootstrap.Modal(document.getElementById('LoginModal'))
var signUpModal = new bootstrap.Modal(document.getElementById('SignUpModal'))
var editCharacterModal = new bootstrap.Modal(document.getElementById('EditPlayersInfoModal'))
var newEntryModal = new bootstrap.Modal(document.getElementById('createNewEntryModal'))
var editEntryModal = new bootstrap.Modal(document.getElementById('editEntryModal'))
var readEntryModal = new bootstrap.Modal(document.getElementById('readEntryModal'))
var GMAllEntriesModal = new bootstrap.Modal(document.getElementById('GMAllEntriesModal'))
var newBranchModal = new bootstrap.Modal(document.getElementById('createNewBranchModal'))
var editBranchModal = new bootstrap.Modal(document.getElementById('editBranchModal'))
var readBranchModal = new bootstrap.Modal(document.getElementById('readBranchModal'))
var ownerBranchOptionsModal = new bootstrap.Modal(document.getElementById('ownerBranchOptionsModal'))
var sharedBranchOptionsModal = new bootstrap.Modal(document.getElementById('sharedBranchOptionsModal'))
var mainNodeOptionsModal = new bootstrap.Modal(document.getElementById('mainNodeOptionsModal'))
var testNodeOptionsModal = new bootstrap.Modal(document.getElementById('testNodeOptionsModal'))
var GMAllBranchesModal = new bootstrap.Modal(document.getElementById('GMAllBranchesModal'))
var notificationsModal = new bootstrap.Modal(document.getElementById('notificationsModal'))

	
$(document).ready(function() { //showing login modal when the website loads
	loginModal.show();
	getAllUsernames();
});



/*---------------------- LOGIN SYSTEM ----------------------*/

$("#goToSignUpBtn").on("click", ()=>{ //opening signUpModal from loginModal
	signUpModal.show();
	loginModal.hide();
});
	
$("#goToLoginBtn").on("click", ()=>{ //opening loginModal from signUpModal
	loginModal.show();
	signUpModal.hide();
});

$("#logOutBtn").on("click", ()=>{ //logging the user out
	hideData();
	auth.signOut(); //the Firebase method to sign out the user
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
			
			$('#notificationDiv').empty();
			
			signUpModal.hide();
			
			loadUserInfo(user, db);
			getAllEntries();
			getAllBranches();

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
		
		onValue(ref(db, 'users/' + user.uid + '/notifications'), (snapshot) => {
			newNotifications = snapshot.val();
			if (newNotifications != null && newNotifications.length != 0) {
				$('#bellIcon').removeClass("bi-bell");
				$('#bellIcon').addClass("bi-bell-fill");
				$('#notifBadge').text(newNotifications.length);
				$('#notifBadge').removeClass("invisible");
				
				$('#notificationDiv').empty();
				notifMess = "";
				for (var x in newNotifications) {
					notifMess += (newNotifications[x] + '<br>');
				}
				$('#notificationDiv').append(notifMess);
			}
			else {
				$('#notificationDiv').empty();
				$('#notificationDiv').prepend("<p>No new notifications</p>");
			}
		}, {
			onlyOnce: true
		});
		
		alert('User logged in');
		
		$('#loginInputEmail').text("");
		$('#loginInputPassword').text("");
		
		loginModal.hide();
		
		loadUserInfo(user, db);
		getAllEntries();
		getAllBranches();
		getUsersAccessibleEntries();
		

		$('#headerUsername').text();
		if (GMpermissions) {
			$('#headerPermissions').text("Game Master");
			if (!showAllBranchesBtnAppended) {
				$('#reloadMindMapBtn').before('<button class="btn btn-outline-secondary right" id="showAllBranchesBtn">show all branches</button>');
				showAllBranchesBtnAppended = true;
			}
		}
		else {
			$('#headerPermissions').text("Player");
		}
	})
	.catch((error) => {
		const errorCode = error.code;
		const errorMessage = error.message;
		
		alert(errorMessage);
	});
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
  
onAuthStateChanged(auth, (user) => {
	if (user) {
		const uid = user.uid;
	} else {
		$('#loginInputEmail').text("");
		$('#loginInputPassword').text("");
		loginModal.show()
	}
});

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
	
	$('#notificationDiv').empty();
	$('#loginInputEmail').text("");
	$('#loginInputPassword').text("");
	$('#signUpInputUsername').text("");
	$('#signUpInputEmail').text("");
	$('#signUpInputPassword').text("");
	$('#headerUsername').text("");
	$('#headerPermissions').text("");
	
	$('#createNewEntryShare').empty();
	$('#sharedEntriesList').empty();
	$('#ownEntriesList').empty();
	$('#GMAllEntriesModalDiv').empty();
	
	$('#tree-simple').empty();
	
	user = null;
	GMpermissions = false;
	if (showAllEntriesBtnAppended) {
		$('#showAllEntriesBtn').remove();
	}
	showAllEntriesBtnAppended = false;
	
	if (showAllBranchesBtnAppended) {
		$('#showAllBranchesBtn').remove();
	}
	showAllBranchesBtnAppended = false;
	
	userBranches = null;
	
	newNotifications = [];
	$('#notifBadge').addClass("invisible");
};



/*---------------------- NOTIFICATION SYSTEM ----------------------*/

$('#notificationBtn').on("click", ()=>{
	$('#notifBadge').addClass("invisible");
		
	newNotifications = [];
	update(ref(db, 'users/' + user.uid), {
		notifications: []
	});
	
	notificationsModal.show();
	
	$('#bellIcon').removeClass("bi-bell-fill");
	$('#bellIcon').addClass("bi-bell");
});

function savingNotifState(type, sharedArr, title, author){
	var newNotif = "<p>New " + type + " titled \"" + title + "\" shared with you by " + author + "!</p>";
	for (var x in sharedArr) {
		getNotifications(sharedArr[x], newNotif);
	}
}

$('#closeNotificationsModalBtn').on("click", ()=>{
	notificationsModal.hide();
});

function getNotifications(userFromArr, newNotif) {
	onValue(ref(db, "users/" + userFromArr + "/notifications"), (snapshot) => {
		var oldNotif = snapshot.val();
		
		if (oldNotif == null) {
			oldNotif = [newNotif];
		}
		else {
			oldNotif.push(newNotif);
		}
		
		
		update(ref(db, "users/" + userFromArr), {
			notifications: oldNotif
		});
	}, {
		onlyOnce: true
	});
}



/*---------------------- CHARACTER MANAGER ----------------------*/

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



/*---------------------- LOADING ENCYCLOPEDIA ENTRIES ----------------------*/

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

$("#reloadEntriesBtn").on("click", ()=>{
	reloadEntries();
});

function reloadEntries() {
	$('#ownEntriesList').empty();
	$('#sharedEntriesList').empty();
	getAllEntries();
	getUsersAccessibleEntries();
}



/*---------------------- NEW ENCYCLOPEDIA ENTRY ----------------------*/
	
$("#createNewEntryBtn").on("click", ()=>{

	$("#createNewEntryShare").empty();
	for (const x in allUsersJSON) {
		if (allUsersJSON[x].uid != user.uid) {
			var createEntryUser = '<input type="checkbox" id="createEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createEntryUser"> ' + allUsersJSON[x].username + '</input><br>';
			$("#createNewEntryShare").prepend(createEntryUser);
		}
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
	
	savingNotifState("encyclopedia entry", sharedWith, $('#newEntryTitle').val(), $('#charactersName').text());
	
	set(newEncyclopediaEntryRef, {
		author: id,
		keyOfEntry: keyOfEntry,
		type: $('#newEntryType option:selected').text(),
		title: $('#newEntryTitle').val(),
		notes: $('#newEntryNotes').val(),
		sharedWith: sharedWith
	})
	
	$('#newEntryType option[value=person]').attr('selected', 'selected');
	
	reloadEntries();
	
	newEntryModal.hide()

	$('#newEntryTitle').val(""),
	$('#newEntryNotes').val(""),
	$.each($("input[name='createEntryUser']:checked"), function(){
        $(this).prop('checked', false);
    });
});

$("#closeCreateNewEntryModalBtn").on("click", ()=>{
	newEntryModal.hide()
});



/*---------------------- OWN/EDIT ENCYCLOPEDIA ENTRY ----------------------*/

$('#ownEntriesList').on("click","button", function(e){
	try {
		$("#editNewEntryShare").empty();
		for (const x in allUsersJSON) {
			if (allUsersJSON[x].uid != user.uid) {
				var editEntryUser = '<br><input type="checkbox" id="editEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editEntryUser"> ' + allUsersJSON[x].username + '</input>';
				$("#editNewEntryShare").append(editEntryUser);
			}
		}
		entryId = e.target.id;

		$('#editEntryType option:selected').val(allEntries[entryId].type);
		$('#editEntryTitle').val(allEntries[entryId].title);
		$('#editEntryNotes').val(allEntries[entryId].notes);
		editEntryModal.show();
	}
	catch(error) {
		const errorMessage = error.message;
		
		alert(errorMessage + "\nThe entry you're trying to access does not exist. Please reload your entries.");
	}
});

$('#saveEditedEntryBtn').on("click", ()=>{
	var sharedWith = [];
	var id = user.uid;
	
	$.each($("input[name='editEntryUser']:checked"), function(){
        sharedWith.push($(this).val());
    });
	
	savingNotifState("encyclopedia entry", sharedWith, $('#editEntryTitle').val(), $('#charactersName').text());
	
	set(ref(db, 'encyclopediaEntries/' + entryId), {
		author: id,
		keyOfEntry: entryId,
		title: $('#editEntryTitle').val(),
		notes: $('#editEntryNotes').val(),
		type: $('#editEntryType option:selected').text(),
		sharedWith: sharedWith
	});
	
	reloadEntries();
	
	editEntryModal.hide();
	
	$('#editEntryTitle').val(""),
	$('#editEntryNotes').val(""),
	$.each($("input[name='editEntryUser']:checked"), function(){
        $(this).prop('checked', false);
    });
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
		
		reloadEntries();
		editEntryModal.hide();
		
		$('#editEntryTitle').val(""),
		$('#editEntryNotes').val(""),
		$.each($("input[name='editEntryUser']:checked"), function(){
			$(this).prop('checked', false);
		});
	}
});

$('#closeEditEntryModalBtn').on("click", ()=>{
	editEntryModal.hide();
});



/*---------------------- SHARED ENCYCLOPEDIA ENTRY ----------------------*/

$('#sharedEntriesList').on("click","button", function(e){
	var entryId = e.target.id;
	var author = allEntries[entryId].author;
	
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readEntryAuthor').text(allUsersJSON[x].username);
		}
	}
	
	$('#readEntryTitle').text(allEntries[entryId].title);
	$('#readEntryType').text(allEntries[entryId].type);
	$('#readEntryNotes').text(allEntries[entryId].notes);
	readEntryModal.show();
});

$('#closeReadEntryModalBtn').on("click", ()=>{
	readEntryModal.hide();
});




/*---------------------- FILTERING ENCYCLOPEDIA ENTRIES ----------------------*/

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
  
var btnContainer = document.getElementById("entriesTypesBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
	btns[i].addEventListener("click", function() {
		var current = document.getElementsByClassName("active");
		current[0].className = current[0].className.replace(" active", "");
		this.className += " active";
	});
}

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


/*---------------------- ALL/GM ENCYCLOPEDIA ENTRIES ----------------------*/

$('#cardHeader').on("click","#showAllEntriesBtn", function(e){
	$("#GMAllEntriesModalDiv").empty();
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

	$('#readEntryTitle').text(allEntries[entryId].title);
	$('#readEntryType').text(allEntries[entryId].type);
	$('#readEntryNotes').text(allEntries[entryId].notes);
	readEntryModal.show();
});

$('#closeGMAllEntriesModalBtn').on("click", ()=>{
	GMAllEntriesModal.hide();
});



/*---------------------- LOADING MIND MAP BRANCHES ----------------------*/

function getAllBranches() {
	onValue(ref(db, 'mindMap/nodeStructure/children'), (snapshot) => {
		allBranches = snapshot.val();
	}, {
		onlyOnce: true
	});
}

function getUserBranches() {
	getAllBranches();
	
	userBranches = allBranches;
	
	createUsersBranches(userBranches);
	
	
	if (userBranches == null || userBranches.length == 0) {
		userMindMap = testMindMap;
	}
	else {
		userMindMap = {
			chart: {
				container: "#tree-simple",
				rootOrientation: "WEST"
			},
			
			nodeStructure: {
				text: { 
					name: "Investigation"
				},
				HTMLclass: "mainNode",		
				
				children: userBranches
			}
		}
	}
}

function createUsersBranches(userBranchesJSON) {
	var id = user.uid;
	
	for (var x in userBranchesJSON) {		
		if(userBranchesJSON[x] != null && typeof userBranchesJSON[x] == "object") {
			var sharedTest = false;
			
			if (userBranchesJSON[x].text["data-sharedWith"] != null) {
				if (userBranchesJSON[x].text["data-sharedWith"].includes(id)) {						
					sharedTest = true;
				}
			}
			
			if ((userBranchesJSON[x].text["data-author"] != id) && (!sharedTest)) {
				userBranchesJSON.splice(x, 1);
				createUsersBranches(userBranchesJSON);
			}
			
			if (userBranchesJSON[x] != null && userBranchesJSON[x].children != null) {
				createUsersBranches(userBranchesJSON[x].children);
			}
		}
	}
}

$("#reloadMindMapBtn").on("click", ()=>{
	reloadMindMap();
});

function reloadMindMap() {
	$('#tree-simple').empty();
	getAllBranches();
	getUserBranches();
	chart = new Treant(userMindMap, function() {}, $ );
}



/*---------------------- MIND MAP BRANCH OPTIONS ----------------------*/

$('#tree-simple').on("click",".openBranchOptions", function(e){
	branchID = e.target.id;
	if ($(e.target).attr('data-author') == user.uid) {
		ownerBranchOptionsModal.show();
	}
	else {
		sharedBranchOptionsModal.show();
	}
});

$('#tree-simple').on("click",".mainNode", function(e){
	branchID = "mainNode";
	mainNodeOptionsModal.show();
});

$('#tree-simple').on("click",".testNode", function(e){
	testNodeOptionsModal.show();
});

$('#closeOwnerBranchOptionsModalBtn').on("click", ()=>{
	ownerBranchOptionsModal.hide();
});

$('#closeSharedBranchOptionsModalBtn').on("click", ()=>{
	sharedBranchOptionsModal.hide();
});

$('#closeMainNodeOptionsModalBtn').on("click", ()=>{
	mainNodeOptionsModal.hide();
});

$('#closeTestNodeOptionsModalBtn').on("click", ()=>{
	testNodeOptionsModal.hide();
});



/*---------------------- NEW MIND MAP BRANCH ----------------------*/

$('#createNewBranchBtn').on("click", ()=>{
	$("#createNewBranchShare").empty();
	for (const x in allUsersJSON) {
		if (allUsersJSON[x].uid != user.uid) {
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>';
			$("#createNewBranchShare").prepend(createBranchUser);
		}
	}
	
	ownerBranchOptionsModal.hide();
	newBranchModal.show();
});

$('#createNewBranchFromMNBtn').on("click", function(e){
	$("#createNewBranchShare").empty();
	for (const x in allUsersJSON) {
		if (allUsersJSON[x].uid != user.uid) {
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>';
			$("#createNewBranchShare").prepend(createBranchUser);
		}
	}

	mainNodeOptionsModal.hide();
	newBranchModal.show();
});

$('#createNewBranchFromSharedBtn').on("click", ()=>{
	$("#createNewBranchShare").empty();
	for (const x in allUsersJSON) {
		if (allUsersJSON[x].uid != user.uid) {
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>';
			$("#createNewBranchShare").prepend(createBranchUser);
		}
	}
	
	sharedBranchOptionsModal.hide();
	newBranchModal.show();
});

$('#closeCreateNewBranchModalBtn').on("click", ()=>{
	newBranchModal.hide();
});

$("#saveNewBranchBtn").on("click", function(e){
	const branchesListRef = ref(db, 'mindMapBranchesList');
	const newMindMapBranchRef = push(branchesListRef);
	const keyOfBranch = newMindMapBranchRef.key;
	var sharedWith = [];
	var id = user.uid;
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	
	$.each($("input[name='createBranchUser']:checked"), function(){
        sharedWith.push($(this).val());
    });
	
	var newNodeHTML = '<p class="node-name" id="' + keyOfBranch + '" data-author="' + id + '">' + $('#newBranchTitle').val() + '</p>';
	
	savingNotifState("mind map branch", sharedWith, $('#newBranchTitle').val(), $('#charactersName').text());

	var newNode = {
		text: {
			"name": $('#newBranchTitle').val(),
			"data-author": id,
			"data-notes": $('#newBranchNotes').val(),
			"data-sharedWith": sharedWith,
			"data-state": "active"
		},
		innerHTML: newNodeHTML,
		HTMLclass: "openBranchOptions active",
		HTMLid: keyOfBranch,
		children: []
    };
	
	
	if (allBranches == null) {
		allBranches = [newNode];
	}
	else {
		if (branchID == "mainNode") {
			allBranches.push(newNode);
		}
		else {	
			insertNode(newNode, branchID, allBranches);
		}
	}
	
	set(ref(db, 'mindMap'), {
		chart: {
			container: "#tree-simple",
			rootOrientation: "WEST"
		},
		
		nodeStructure: {
			innerHTML: mainNodeHTML,
			text: { name: "Investigation" },
			HTMLid: "mainNode",
			children: allBranches, 
		}
	});
	
	newBranchModal.hide();
	$('#newBranchTitle').val('');
	$('#newBranchNotes').val('');
	$.each($("input[name='createBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap();
});

function insertNode(node, parentBranchID, branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			if (branchesJSON[x].HTMLid == parentBranchID) {
				if (branchesJSON[x].children == null) {
					branchesJSON[x].children = [node];
				}
				else {
					branchesJSON[x].children.push(node);
				}
			}
			else {
				insertNode(node, parentBranchID, branchesJSON[x].children);
			}
		}
	}
}



/*---------------------- OWN/EDIT MIND MAP BRANCHES ----------------------*/

$('#editBranchBtn').on("click", ()=>{
	$("#editBranchShare").empty();
	for (const x in allUsersJSON) {
		if (allUsersJSON[x].uid != user.uid) {
			var editBranchUser = '<input type="checkbox" id="editBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editBranchUser"> ' + allUsersJSON[x].username + '</input><br>';
			$("#editBranchShare").append(editBranchUser);
		}
	}
	
	getEditedBranch(branchID, userBranches);
	
	$('#editBranchTitle').val(editedBranch.text["name"]);
	$('#editBranchNotes').val(editedBranch.text["data-notes"]);
	
	ownerBranchOptionsModal.hide();
	editBranchModal.show();
});

function getEditedBranch(branchID, branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			if (branchesJSON[x].HTMLid == branchID) {
				editedBranch = branchesJSON[x];
			}
			else {
				getEditedBranch(branchID, branchesJSON[x].children);
			}
		}
	}
}

$('#closeEditBranchModalBtn').on("click", ()=>{
	editBranchModal.hide();
});

$("#saveEditedBranchBtn").on("click", function(e){
	var sharedWith = [];
	var id = user.uid;
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	var editedNode;
	
	$.each($("input[name='editBranchUser']:checked"), function(){
        sharedWith.push($(this).val());
    });
	var editedNodeHTML = '<p class="node-name active" id="' + branchID + '" data-author="' + id + '">' + $('#editBranchTitle').val() + '</p>';
	
	savingNotifState("mind map branch", sharedWith, $('#editBranchTitle').val(), $('#charactersName').text());
	
	if (editedBranch.children != null) {
		var nodeChildren = editedBranch.children;
		
		editedNode = {
			text: {
				"name": $('#editBranchTitle').val(),
				"data-author": id,
				"data-notes": $('#editBranchNotes').val(),
				"data-sharedWith": sharedWith,
				"data-state": "active"
			},
			innerHTML: editedNodeHTML,
			HTMLclass: "openBranchOptions active",
			HTMLid: branchID,
			children: nodeChildren
		};
	}
	else {
		editedNode = {
			text: {
				"name": $('#editBranchTitle').val(),
				"data-author": id,
				"data-notes": $('#editBranchNotes').val(),
				"data-sharedWith": sharedWith,
				"data-state": "active"
			},
			innerHTML: editedNodeHTML,
			HTMLclass: "openBranchOptions active",
			HTMLid: branchID
		};
	}
	
	updateNode(editedNode, branchID, allBranches);
	
	set(ref(db, 'mindMap'), {
		chart: {
			container: "#tree-simple",
			rootOrientation: "WEST"
		},
		
		nodeStructure: {
			innerHTML: mainNodeHTML,
			text: { name: "Investigation" },
			HTMLid: "mainNode",
			children: allBranches 
		}
	});
	
	editBranchModal.hide();
	$('#editBranchTitle').val('');
	$('#editBranchNotes').val('');
	$.each($("input[name='editBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap();
});

function updateNode(node, editedBranchID, branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			if (branchesJSON[x].HTMLid == editedBranchID) {
				branchesJSON[x] = node;
			}
			else {
				updateNode(node, editedBranchID, branchesJSON[x].children);
			}
		}
	}
}

$('#deleteEditedBranchBtn').on("click", ()=>{
	if(window.confirm("Do you really want to delete this branch? This cannot be undone and will delete all children branches, including ones created by other users!")) {
		var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
		deleteNode(branchID, allBranches);
		
		set(ref(db, 'mindMap'), {
			chart: {
				container: "#tree-simple",
				rootOrientation: "WEST"
			},
			
			nodeStructure: {
				innerHTML: mainNodeHTML,
				text: { name: "Investigation" },
				HTMLid: "mainNode",
				children: allBranches 
			}
		});
		
		editBranchModal.hide();
		$('#editBranchTitle').val('');
		$('#editBranchNotes').val('');
		$.each($("input[name='editBranchUser']:checked"), function(){
			$(this).prop('checked', false);
		});
		
		reloadMindMap();
	}
});

function deleteNode(editedBranchID, branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			if (branchesJSON[x].HTMLid == editedBranchID) {
				branchesJSON.splice(x);
			}
			else {
				deleteNode(editedBranchID, branchesJSON[x].children);
			}
		}
	}
}

$('#archiveEditedBranchBtn').on("click", ()=>{
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	archiveNode(branchID, allBranches);
	
	set(ref(db, 'mindMap'), {
		chart: {
			container: "#tree-simple",
			rootOrientation: "WEST"
		},
		
		nodeStructure: {
			innerHTML: mainNodeHTML,
			text: { name: "Investigation" },
			HTMLid: "mainNode",
			children: allBranches 
		}
	});
	
	editBranchModal.hide();
	$('#editBranchTitle').val('');
	$('#editBranchNotes').val('');
	$.each($("input[name='editBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap();
});

function archiveNode(editedBranchID, branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			if (branchesJSON[x].HTMLid == editedBranchID) {
				branchesJSON[x].text["data-state"] = "archived";
				branchesJSON[x].HTMLclass = "openBranchOptions archived";
				var oldHTML = branchesJSON[x].innerHTML;
				var newHTML = oldHTML.replace("active", "archived");
				branchesJSON[x].innerHTML = newHTML;
				if (branchesJSON[x].children != null) {
					archiveChildren(branchesJSON[x].children);
				}
			}
			else {
				archiveNode(editedBranchID, branchesJSON[x].children);
			}
		}
	}
}

function archiveChildren(branchesJSON) {
	for (var x in branchesJSON) {
		if(branchesJSON != null && typeof branchesJSON == "object") {
			branchesJSON[x].text["data-state"] = "archived";
			branchesJSON[x].HTMLclass = "openBranchOptions archived";
			var oldHTML = branchesJSON[x].innerHTML;
			var newHTML = oldHTML.replace("active", "archived");
			branchesJSON[x].innerHTML = newHTML;
			if (branchesJSON[x].children != null) {
				archiveChildren(branchesJSON[x].children);
			}
		}
	}
}



/*---------------------- SHARED MIND MAP BRANCHS ----------------------*/

$('#readBranchBtn').on("click", ()=>{
	getEditedBranch(branchID, userBranches);
	
	var author = editedBranch.text["data-author"];
	
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readBranchAuthor').text(allUsersJSON[x].username);
		}
	}
	
	$('#readBranchTitle').text(editedBranch.text["name"]);
	$('#readBranchNotes').text(editedBranch.text["data-notes"]);
	
	sharedBranchOptionsModal.hide();
	readBranchModal.show();
});

$('#closeReadBranchModalBtn').on("click", ()=>{
	readBranchModal.hide();
});



/*---------------------- ALL/GM MIND MAP BRANCHES ----------------------*/

$('#cardHeaderMindMap').on("click","#showAllBranchesBtn", function(e){
	var GMMindMap = {
		chart: {
			container: "#tree-simple",
			rootOrientation: "WEST"
		},
		
		nodeStructure: {
			text: { 
				name: "Investigation"
			},
			HTMLclass: "mainNode",		
			
			children: allBranches
		}
	}
	
	var chart2 = new Treant(GMMindMap, function() {}, $ );
});

$('#closeGMAllBranchesModalBtn').on("click", ()=>{
	GMAllBranchesModal.hide();
});