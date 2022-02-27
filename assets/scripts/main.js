//importing necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";
 
//web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBdVWxbamVQnZBVqfoE1CIyGrefWheixYs",
    authDomain: "cordovacthulu.firebaseapp.com",
	databaseURL: "https://cordovacthulu-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cordovacthulu",
    storageBucket: "cordovacthulu.appspot.com",
    messagingSenderId: "893879003774",
    appId: "1:893879003774:web:4f86689745984850d5062f"
};

//initializing Firebase
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

$("#goToSignUpBtn").on("click", ()=>{ //when goToSignUpBtn button is clicked...
	signUpModal.show(); //show signUpModal modal
	loginModal.hide(); //hide loginModal modal
});
	
$("#goToLoginBtn").on("click", ()=>{ //when goToLoginBtn button is clicked...
	loginModal.show(); //show loginModal modal
	signUpModal.hide(); //hide signUpModal modal
});

$("#logOutBtn").on("click", ()=>{ //when logOutBtn button is clicked...
	if (user) { //if a user is logged in..
		try {
		hideData(); //execute the method for hiding the data of previous user
		auth.signOut(); //execute a Firebase method to sign out the user
		}
		catch (error) { //if there are any errors...
			alert(error.message); //display an error message
		}
	}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});

$("#signUp").on("click", () => { //when signUp button is clicked...
	//get values of fields
	var username = $('#signUpInputUsername').val();
	var email = $('#signUpInputEmail').val();
	var password = $('#signUpInputPassword').val();
	var cb = document.querySelector('#GM-permissions');
	var appliedForGM = cb.checked;
	
	createUserWithEmailAndPassword(auth, email, password) //execute a Firebase method for creating the account
		.then((userCredential) => { //user is signed in 
			user = userCredential.user;
			const id = user.uid;
			
			
			onValue(ref(db, 'allUsersCount'), (snapshot) => { //get the number of registered users
				numOfUsers = snapshot.val() + 1; //increase number of registered users
				set(ref(db, 'allUsersCount'), numOfUsers);
				set(ref(db, 'allUserslist/user' + numOfUsers), { //create the allUserList for easier search of username
					uid: user.uid,
					username: username
				});
			}, {
				onlyOnce: true
			});
			
			set(ref(db, 'users/' + user.uid), { //set all necessary database values
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
			
			loadUserInfo(user, db); //a method to load the info about the user
			getAllEntries(); //a method to get all entries from the database
			getAllBranches(); //a method to get all branches from the database

			$('#headerPermissions').text("Player");
			$('#headerUsername').text(username);
		})
		.catch((error) => { //if errors are catched...
			const errorCode = error.code;
			const errorMessage = error.message;
			
			if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
				alert("Please check your internet connection and try again");
			}
			else if (error.message.includes("auth/auth/invalid-email")) {
				alert("Please check the spelling of your email address");
			}
			else {
				alert(errorMessage); 
			}	
		});
	});
  
$("#signIn").on("click", () => { //when signIn button is clicked...
	//get values of the fields
	var email = $('#loginInputEmail').val();
	var password = $('#loginInputPassword').val();	
	
	signInWithEmailAndPassword(auth, email, password) //execute a Firebase method for logging in the user
	.then((userCredential) => { //user is signed in
		user = userCredential.user;
		
		const dt = new Date();
		update(ref(db, 'users/' + user.uid), { //add last login date to the database
			last_login: dt
		})
		
		onValue(ref(db, 'users/' + user.uid + '/GMpermissionsGranted'), (snapshot) => { //check the user's permissions (Game Master or Player)
			GMpermissions = snapshot.val();
		}, {
			onlyOnce: true
		});
		
		onValue(ref(db, 'users/' + user.uid + '/notifications'), (snapshot) => { //get user's notifications from the database
			newNotifications = snapshot.val();
			if (newNotifications != null && newNotifications.length != 0) { //if there are new notifications...
				//showing number of new notifications on the button
				$('#bellIcon').removeClass("bi-bell");
				$('#bellIcon').addClass("bi-bell-fill");
				$('#notifBadge').text(newNotifications.length);
				$('#notifBadge').removeClass("invisible");
				
				$('#notificationDiv').empty();
				
				notifMess = "";
				for (var x in newNotifications) { //create a string to be inputted into notificationDiv
					notifMess += (newNotifications[x] + '<br>');
				}
				$('#notificationDiv').append(notifMess); //append new notifications' messages into the modal
			}
			else { //if there are no new notifications...
				$('#notificationDiv').empty();
				$('#notificationDiv').prepend("<p>No new notifications</p>"); //add info about no new notifications
			}
		}, {
			onlyOnce: true
		});
		
		alert('User logged in');
		
		$('#loginInputEmail').text("");
		$('#loginInputPassword').text("");
		
		loginModal.hide();
		
		loadUserInfo(user, db); //execute a method to load user's info
		getAllEntries(); //execute a method to get all encyclopedia entries
		getAllBranches(); //execute a method to get all mind map branches
		getUsersAccessibleEntries(); //execute a method to get entries which user has access to

		if (GMpermissions) { //if user has GM permissions...
			$('#headerPermissions').text("Game Master"); //set the textfield to "Game Master"
			if (!showAllBranchesBtnAppended) { //and if the allBranchesBtn is not shown...
				$('#reloadMindMapBtn').before('<button class="btn btn-outline-secondary right" id="showAllBranchesBtn">show all branches</button>'); //show it
				showAllBranchesBtnAppended = true;
			}
		}
		else { //if user doesn't have GM permissions...
			$('#headerPermissions').text("Player"); //set the text field to "Player"
		}
	})
	.catch((error) => { //if there are catched errors...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else if (error.message.includes("auth/user-not-found")) {
			alert("There is no such user in the system");
		}
		else if (error.message.includes("auth/wrong-password")) {
			alert("Wrong password! Please try again");
		}
		else if (error.message.includes("auth/auth/invalid-email")) {
			alert("Please check the spelling of your email address");
		}
		else {
			alert(error.message); //show error message
		}
	});
});
  
function getAllUsernames() { //a method to get all user uid and the corresponding usernames
	try {
		onValue(ref(db, 'allUserslist'), (snapshot) => { //getting the list with user uids and usernames
			allUsersJSON = snapshot.val();
		}, {
			onlyOnce: true
		});
		
		onValue(ref(db, 'allUsersCount'), (snapshot) => { //getting the number of registered users
			numOfUsers = snapshot.val();
		}, {
			onlyOnce: true
		});
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
}
  
onAuthStateChanged(auth, (user) => { //when the authorization state of the user changes (a Firebase method)
	if (user) { //if a user is logged in...
		const uid = user.uid; //set uid as the user's ID
	} else { //if user is not logged in...
		$('#loginInputEmail').text(""); //hide info about previous user in the fields
		$('#loginInputPassword').text("");
		loginModal.show() //show login modal
	}
});

function hideData() { //a method to hide previous user's info on logout
	const fieldsIds = ['charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'hitPoints', 'sanity', 'luck', 'magicPoints'];
	const halvesAndFives = ['str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate'];
	
	for (let i = 0; i < fieldsIds.length; i++) { //set all fields from Character's section as empty
		$('#' + fieldsIds[i]).text("");
	}
		
	for (let i = 0; i < halvesAndFives.length; i++) { //set fields with calculated points as empty
		$('#' + halvesAndFives[i]).text("");
		$('#' + halvesAndFives[i] + 'Half').text("");
		$('#' + halvesAndFives[i] + 'Fifth').text("");
	}
	
	//set all fields as empty
	$('#loginInputEmail').text("");
	$('#loginInputPassword').text("");
	$('#signUpInputUsername').text("");
	$('#signUpInputEmail').text("");
	$('#signUpInputPassword').text("");
	$('#headerUsername').text("");
	$('#headerPermissions').text("");
	
	//clear all divs and lists
	$('#notificationDiv').empty();
	$('#createNewEntryShare').empty();
	$('#sharedEntriesList').empty();
	$('#ownEntriesList').empty();
	$('#GMAllEntriesModalDiv').empty();
	$('#tree-simple').empty();
	
	//set all necessary variables as null
	user = null;
	GMpermissions = false;
	showAllEntriesBtnAppended = false;
	showAllBranchesBtnAppended = false;
	userBranches = null;
	
	//hide Game Master's elements
	if (showAllEntriesBtnAppended) {
		$('#showAllEntriesBtn').remove();
	}
	
	if (showAllBranchesBtnAppended) {
		$('#showAllBranchesBtn').remove();
	}
	
	//hide all notifications
	newNotifications = [];
	$('#notifBadge').addClass("invisible");
};



/*---------------------- NOTIFICATION SYSTEM ----------------------*/

$('#notificationBtn').on("click", ()=>{ //when the notification button is clicked...
	if (user) { //if a user is logged in...
		$('#notifBadge').addClass("invisible"); //hide a badge with number of new notifications
			
		newNotifications = [];
		update(ref(db, 'users/' + user.uid), { //delete new notifications from the database
			notifications: []
		});

		notificationsModal.show(); //show modal with notifications

		//change visuals of the notification button
		$('#bellIcon').removeClass("bi-bell-fill");
		$('#bellIcon').addClass("bi-bell");
		}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});

function savingNotifState(type, sharedArr, title, author){ //a method to save info about notification to a user's data in the database
	var newNotif = "<p>New " + type + " titled \"" + title + "\" shared with you by " + author + "!</p>"; //a info message about new notification
	for (var x in sharedArr) { //for each user uid in sharedArr...
		getNotifications(sharedArr[x], newNotif); //execute method to save info in the user's database (separate method for proper data porcessing)
	}
}

function getNotifications(userFromArr, newNotif) { //a method to save info in the user's database
	try {
		onValue(ref(db, "users/" + userFromArr + "/notifications"), (snapshot) => { //get notifications that are already in the database
			var oldNotif = snapshot.val();
			
			if (oldNotif == null) { //if there are no previous notifications...
				oldNotif = [newNotif]; //set old notifications as an array with one element - new notification
			}
			else { //if there are previous notifications...
				oldNotif.push(newNotif); //push new notification at the end of the array of notifications
			}
			
			update(ref(db, "users/" + userFromArr), { //update the array with notifications in the database
				notifications: oldNotif
			});
		}, {
			onlyOnce: true
		});
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
}

$('#closeNotificationsModalBtn').on("click", ()=>{ //when closeNotificationsModalBtn button is clicked...
	notificationsModal.hide(); //hide the notificationsModal modal
});



/*---------------------- CHARACTER MANAGER ----------------------*/

$("#editCharacterBtn").on("click", ()=>{ //when editCharacterBtn button is clicked...
	if (user) { //if a user is logged in...
		loadEditCharacterModal(user, db); //load the info about the user into the editCharacterModal modal
		editCharacterModal.show() //show the editCharacterModal modal
	}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});

$("#saveChangesBtn").on("click", ()=>{ //when saveChangesBtn button is clicked...
	try {
		update(ref(db, 'users/' + user.uid), { //update the user's data in the database with the values from the fields
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
		
		onValue(ref(db, 'users/' + user.uid + '/userNumber'), (snapshot) => { //get the number of user entry in the array with uids and usernames
			var userNum = snapshot.val() + 1;
			update(ref(db, 'allUserslist/user' + userNum), { //update the username in the array
				username: $('#charactersNameEdit').val()
			});
		}, {
			onlyOnce: true
		});
			
		editCharacterModal.hide() //hide the editCharacterModal modal
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
});
	
$("#closeEditInfoModalBtn").on("click", ()=>{ //when closeEditInfoModalBtn button is clicked...
	editCharacterModal.hide() //hide the editCharacterModal modal
});

function loadUserInfo(user, db) { //a method to load the user's info
	const id = user.uid;
	
	getUserInfo(id, db); //a method to get the user's info from the database
	calcHalvesAndFifths(id, db); //a method to calculate halves and fifths of the character's attributes
};
	
function getUserInfo(id, db) { //a method to get user's info from the database 
	const fieldsIds = ['charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate', 'hitPoints', 'sanity', 'luck', 'magicPoints']; //an array with attributes
	  
	for (let i = 0; i < fieldsIds.length; i++) { //for each element in the fieldsIds array...
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]); //set a reference to proper element
		try {
			onValue(refToDb, (snapshot) => { //get the values from the reference
				var data = snapshot.val();
				$('#' + fieldsIds[i]).text(data); //set the text of the proper field
				if (i == 1) { //if the element is the player's name...
					$('#headerUsername').text(data + " (user id: " + id + ")"); //set the field in the header to the username
				}
			});
		}
		catch (error) { //if there is an error...
			if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
				alert("Please check your internet connection and try again");
			}
			else {
				alert(error.message); //show error message
			}
		}
	}
};
	
function calcHalvesAndFifths(id, db) { //a method to calculate halves and fifths of the character's attributes
	const fieldsIds = ['str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate']; //an array with attributes
		
	for (let i = 0; i < fieldsIds.length; i++) { //for each element in the fieldsIds array...
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]); //set the reference to proper element in the database
		try {
			onValue(refToDb, (snapshot) => { //get the values from the reference
				var data = snapshot.val();
				$('#' + fieldsIds[i] + 'Half').text(parseInt(data/2)); //set proper field as the half of the got value
				$('#' + fieldsIds[i] + 'Fifth').text(parseInt(data/5)); //set proper field as the fifth of the got value
			});
			}
		catch (error) { //if there is an error...
			if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
				alert("Please check your internet connection and try again");
			}
			else {
				alert(error.message); //show error message
			}
		}
	}
};

function loadEditCharacterModal(user, db){ //a method to load the user's info to be edited
	const fieldsIds = ['email', 'charactersName', 'playersName', 'occupation', 'age', 'gender', 'residence', 'birthplace', 'str', 'con', 'siz', 'dex', 'app', 'idea', 'pow', 'edu', 'moveRate', 'hitPoints', 'sanity', 'luck', 'magicPoints']; //an array with attributes
	const id = user.uid;
	  
	for (let i = 0; i < fieldsIds.length; i++) { //for each element in fieldsIds array...
		var refToDb = ref(db, 'users/' + id + '/' + fieldsIds[i]); //set a reference to an element
		try {
			onValue(refToDb, (snapshot) => {
				var data = snapshot.val();
				$('#' + fieldsIds[i] + 'Edit').val(data); //set proper field the got value 
			}, {
				onlyOnce: true
			});
		}
		catch (error) { //if there is an error...
			if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
				alert("Please check your internet connection and try again");
			}
			else {
				alert(error.message); //show error message
			}
		}
	}
};



/*---------------------- LOADING ENCYCLOPEDIA ENTRIES ----------------------*/

function getAllEntries() { //a method to get all encyclopedia entries from the database
	try {
		onValue(ref(db, 'encyclopediaEntries'), (snapshot) => { //get all encyclopedia entries from the database
			allEntries = snapshot.val();
		}, {
			onlyOnce: true
		});	
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
}

function getUsersAccessibleEntries() { //a method to get the entries which the logged user has the access to
	var ownEntries = [];
	var sharedEntries = [];
	
	for (var entry in allEntries){ //for each existing entry...
		if (allEntries[entry].author == user.uid) { //if the user's uid is the same as the entry's author's...
			ownEntries.push(allEntries[entry]); //add this entry to the array of user's own entries
		}
		else if (allEntries[entry].sharedWith != null && allEntries[entry].sharedWith.includes(user.uid)){ //if sharedWith exists and the user's uid is included in the sharedWith array of the entry...
			sharedEntries.push(allEntries[entry]); //add this entry to the array of user's shared entries
		}
	}
	
	for (var entry in ownEntries) { //for each user's own entry...
		var insertOwnEntry = '<button type="button" class="filterEntries btn btn-link ownEntryBtn ' + ownEntries[entry].type + '" id="' + ownEntries[entry].keyOfEntry + '"> ' + ownEntries[entry].title + '</button><hr>'; //create a button with the entry's info
		$("#ownEntriesList").append(insertOwnEntry); //add this button to a proper div
	}
	
	for (var entry in sharedEntries) { //for each user's shared entry...
		var insertSharedEntry = '<button type="button" class="filterEntries btn btn-link sharedEntryBtn ' + sharedEntries[entry].type + '" id="' + sharedEntries[entry].keyOfEntry + '"> ' + sharedEntries[entry].title + '</button><hr>'; //create a button with the entry's info
		$("#sharedEntriesList").append(insertSharedEntry); //add this button to a proper div
	}
	
	if (GMpermissions && !showAllEntriesBtnAppended) { //if the user has Game Master permissions and the showAllEntries button is not shown...
		$('#reloadEntriesBtn').before('<button class="btn btn-outline-secondary right" id="showAllEntriesBtn">show all entries</button>'); //append the button
		showAllEntriesBtnAppended = true; //set the boolean to true, so the button is appended
	}
}

$("#reloadEntriesBtn").on("click", ()=>{ //when a reloadEntriesBtn button is clicked...
	if (user){ //if a user is logged in...
		reloadEntries(); //execute the method for reloading the entries
	}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});

function reloadEntries() { //a method to reload the entries
	$('#ownEntriesList').empty(); //empty the div with own entries
	$('#sharedEntriesList').empty(); //empty the div with shared entries
	getAllEntries(); //execute the method to get all encyclopedia entries from the database
	getUsersAccessibleEntries(); //execute the method to get the entries which the logged user has the access to
}



/*---------------------- NEW ENCYCLOPEDIA ENTRY ----------------------*/
	
$("#createNewEntryBtn").on("click", ()=>{ //when the createNewEntryBtn button is clicked...
	if (user){ //if a user is logged in...
		$("#createNewEntryShare").empty(); //clear the div with the users which an entry can be shared to
		for (const x in allUsersJSON) { //for each user in the all users array
			if (allUsersJSON[x].uid != user.uid) { //if the user from the array is not the logged user...
				var createEntryUser = '<input type="checkbox" id="createEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createEntryUser"> ' + allUsersJSON[x].username + '</input><br>'; //create an input with the username
				$("#createNewEntryShare").prepend(createEntryUser); //append the username to the list of usernames
			}
		}
		newEntryModal.show() //show the newEntryModal modal
	}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});
	
$("#saveNewEntryBtn").on("click", ()=>{ //when saveNewEntryBtn button is clicked...
	const encyclopediaEntriesListRef = ref(db, 'encyclopediaEntries'); //reference to database encyclopediaEntries element
	const newEncyclopediaEntryRef = push(encyclopediaEntriesListRef); //push a new element into encyclopediaEntries, creating a new random key (a Firbease method)
	const keyOfEntry = newEncyclopediaEntryRef.key; //get the key
	var sharedWith = [];
	var id = user.uid;
	
	$.each($("input[name='createEntryUser']:checked"), function(){ //for each checked input in createNewEntryShare
        sharedWith.push($(this).val()); //push the user uid whom the entry is shared to into the sharedWith array
    });
	
	savingNotifState("encyclopedia entry", sharedWith, $('#newEntryTitle').val(), $('#charactersName').text()); //execute the method to save info about new notification to a user's data in the database
	
	try {
		set(newEncyclopediaEntryRef, { //create a new entry in the database under the random key
			author: id,
			keyOfEntry: keyOfEntry,
			type: $('#newEntryType option:selected').text(),
			title: $('#newEntryTitle').val(),
			notes: $('#newEntryNotes').val(),
			sharedWith: sharedWith
		})
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
	
	$('#newEntryType option[value=person]').attr('selected', 'selected'); //set the newEntryType to person (a default one)
	
	reloadEntries(); //execute the method to reload the entries
	
	newEntryModal.hide() //hide the newEntryModal modal

	//clear the fields in the newEntryModal modal
	$('#newEntryTitle').val(""),
	$('#newEntryNotes').val(""),
	$.each($("input[name='createEntryUser']:checked"), function(){
        $(this).prop('checked', false);
    });
});

$("#closeCreateNewEntryModalBtn").on("click", ()=>{ //when the closeCreateNewEntryModalBtn button is clicked...
	newEntryModal.hide() //hide the newEntryModal modal
});



/*---------------------- OWN/EDIT ENCYCLOPEDIA ENTRY ----------------------*/

$('#ownEntriesList').on("click","button", function(e){ //when the button on the ownEntriesList, representing an own encyclopedia entry, is clicked...
	try {
		$("#editNewEntryShare").empty(); //clear the div with the users which an entry can be shared to
		for (const x in allUsersJSON) {
			if (allUsersJSON[x].uid != user.uid) { //for each user in the all users array
				var editEntryUser = '<br><input type="checkbox" id="editEntryUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editEntryUser"> ' + allUsersJSON[x].username + '</input>'; //create an input with the username
				$("#editNewEntryShare").append(editEntryUser); //append the username to the list of usernames
			}
		}
		entryId = e.target.id; //get the ID of button (entry) which was the trigger

		//get all values (type, title and notes) of the entry
		$('#editEntryType option:selected').val(allEntries[entryId].type);
		$('#editEntryTitle').val(allEntries[entryId].title);
		$('#editEntryNotes').val(allEntries[entryId].notes);
		editEntryModal.show(); //show the editEntryModal modal
	}
	catch(error) { //if an error is catched...
		const errorMessage = error.message;
		
		if (errorMessage == "allEntries[entryId] is undefined") { //display an error message
		alert("The entry you're trying to access does not exist. Please reload your entries."); 
		}
		else {
			alert(errorMessage);
		}
	}
});

$('#saveEditedEntryBtn').on("click", ()=>{ //when saveEditedEntryBtn button is clicked...
	var sharedWith = [];
	var id = user.uid;
	
	$.each($("input[name='editEntryUser']:checked"), function(){ //for each checked input in createNewEntryShare
        sharedWith.push($(this).val()); //push the user uid whom the entry is shared to into the sharedWith array
    });
	
	savingNotifState("encyclopedia entry", sharedWith, $('#editEntryTitle').val(), $('#charactersName').text()); //execute the method to save info about new notification to a user's data in the database
	
	try {
		update(ref(db, 'encyclopediaEntries/' + entryId), { //create a new entry in the database under the entry ID
			author: id,
			keyOfEntry: entryId,
			title: $('#editEntryTitle').val(),
			notes: $('#editEntryNotes').val(),
			type: $('#editEntryType option:selected').text(),
			sharedWith: sharedWith
		});
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
	
	
	reloadEntries(); //execute the method to reload the entries
	
	editEntryModal.hide(); //hide editEntryModal modal
	
	//clear the fields in the editEntryModal modal
	$('#editEntryTitle').val(""),
	$('#editEntryNotes').val(""),
	$.each($("input[name='editEntryUser']:checked"), function(){
        $(this).prop('checked', false);
    });
});

$('#deleteEditedEntryBtn').on("click", ()=>{ //when deleteEditedEntryBtn button is clicked...
	if(window.confirm("Do you really want to delete your entry? This cannot be undone")) { //ask the user whether they're sure they want to delete the entry, if yes, then...
		try {
		set(ref(db, 'encyclopediaEntries/' + entryId), { //set all data of the entry with entry ID to null (equivalent of deleting it)
			author: null,
			keyOfEntry: null,
			title: null,
			notes: null,
			type: null,
			sharedWith: null
		});
		}
		catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
		
		reloadEntries(); //execute the method to reload the entries
		editEntryModal.hide(); //hide editEntryModal modal
		
		//clear the fields in the editEntryModal modal
		$('#editEntryTitle').val(""),
		$('#editEntryNotes').val(""),
		$.each($("input[name='editEntryUser']:checked"), function(){
			$(this).prop('checked', false);
		});
	}
});

$('#closeEditEntryModalBtn').on("click", ()=>{ //when closeEditEntryModalBtn button is clicked...
	editEntryModal.hide(); //hide editEntryModal modal
});



/*---------------------- SHARED ENCYCLOPEDIA ENTRY ----------------------*/

$('#sharedEntriesList').on("click","button", function(e){ //when the button on the sharedEntriesList, representing a shared encyclopedia entry, is clicked...
	var entryId = e.target.id; //get the ID of button (entry) which was the trigger
	var author = allEntries[entryId].author; //get the author of the entry which was the trigger
	
	//find the username of the author of the entry
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readEntryAuthor').text(allUsersJSON[x].username);
		}
	}
	
	try {
		//get all values (type, title and notes) of the entry
		$('#readEntryTitle').text(allEntries[entryId].title);
		$('#readEntryType').text(allEntries[entryId].type);
		$('#readEntryNotes').text(allEntries[entryId].notes);
	}
	catch(error) { //if an error is catched...
		const errorMessage = error.message;
		
		if (errorMessage == "allEntries[entryId] is undefined") { //display an error message
		alert("The entry you're trying to access does not exist. Please reload your entries."); 
		}
		else {
			alert(errorMessage);
		}
	}
	
	readEntryModal.show(); //show the readEntryModal modal
});

$('#closeReadEntryModalBtn').on("click", ()=>{ //when closeReadEntryModalBtn button is clicked...
	readEntryModal.hide(); //hide readEntryModal modal
});




/*---------------------- FILTERING ENCYCLOPEDIA ENTRIES ----------------------*/

$("#allEntriesTypeBtn").on("click", ()=>{ //when allEntriesTypeBtn button is clicked...
	filterSelection('all'); //execute the method to show all entries, regardless of their type
});

$("#personOrSpecialistEntriesTypeBtn").on("click", ()=>{ //when personOrSpecialistEntriesTypeBtn button is clicked...
	filterSelection('Person/specialist'); //execute the method to show entries with type "Person/specialist"
});

$("#placeEntriesTypeBtn").on("click", ()=>{ //when placeEntriesTypeBtn button is clicked...
	filterSelection('Place'); //execute the method to show entries with type "Place"
});

$("#monsterEntriesTypeBtn").on("click", ()=>{ //when monsterEntriesTypeBtn button is clicked...
	filterSelection('Monster'); //execute the method to show entries with type "Monster"
});

$("#mythEntriesTypeBtn").on("click", ()=>{ //when mythEntriesTypeBtn button is clicked...
	filterSelection('Myth'); //execute the method to show entries with type "Myth"
});

$("#godEntriesTypeBtn").on("click", ()=>{ //when godEntriesTypeBtn button is clicked...
	filterSelection('God'); //execute the method to show entries with type "God"
}); 
  
$("#entriesTypesBtnContainer").on("click", ".btn", function(e){ //when a button for choosing the shown entry type is clicked...
	$("#entriesTypesBtnContainer .active").removeClass("active"); //remove class "active" from the previous active button
	$(this).addClass("active"); //add class "active" to a clicked button
});

function filterSelection(filter) { //method to show entries with chosen type
	$.each($(".filterEntries"), function(){ //for each encyclopedia entry (both own and shared ones)...
		if (filter == "all" || $(this).hasClass(filter)){ //if no filter is chosen or the entry is of chosen type...
			$(this).addClass("show");
			$(this).removeClass("hide"); //show the entry
		}
		else {
			$(this).addClass("hide");
			$(this).removeClass("show"); //hide the entry
		}
	});
}



/*---------------------- ALL/GM ENCYCLOPEDIA ENTRIES ----------------------*/

$('#cardHeader').on("click", "#showAllEntriesBtn", function(e){ //when showAllEntriesBtn button is clicked...
	$("#GMAllEntriesModalDiv").empty(); //clear the div with all encyclopedia entries
	for (var entry in allEntries) { //for each entry...
		var authorId = allEntries[entry].author; //get the entry's author uid
		var authorName = "";
		
		for (var x in allUsersJSON) { //for each user...
			if (allUsersJSON[x].uid == authorId) { //if their uid matches the entry's author's one...
				authorName = allUsersJSON[x].username; //get their username
			}
		}
		var insertAllEntry = '<button type="button" class="btn btn-link" id="' + allEntries[entry].keyOfEntry + '"> ' + allEntries[entry].title + '</button><hr>'; //create a button with the entry's info
		$("#GMAllEntriesModalDiv").append(insertAllEntry); //add this button to a proper div
	}
	GMAllEntriesModal.show(); //show GMAllEntriesModal modal
});

$('#GMAllEntriesModalDiv').on("click","button", function(e){  //when the button in GMAllEntriesModalDiv, representing an encyclopedia entry, is clicked...
	GMAllEntriesModal.hide(); //hide the GMAllEntriesModal modal
	var entryId = e.target.id; //get the ID of the entry opened
	var author = allEntries[entryId].author; //get the entry's author uid
	
	for (var x in allUsersJSON) { //for each user...
		if (allUsersJSON[x].uid == author) { //if their uid matches the entry's author's one...
			$('#readEntryAuthor').text(allUsersJSON[x].username); //insert their username into readEntryAuthor field
		}
	}

	//insert the entry data into proper fields
	$('#readEntryTitle').text(allEntries[entryId].title);
	$('#readEntryType').text(allEntries[entryId].type);
	$('#readEntryNotes').text(allEntries[entryId].notes);
	
	readEntryModal.show(); //show the readEntryModal modal
});

$('#closeGMAllEntriesModalBtn').on("click", ()=>{ //when closeGMAllEntriesModalBtn button is clicked...
	GMAllEntriesModal.hide(); //close GMAllEntriesModal modal
});



/*---------------------- LOADING MIND MAP BRANCHES ----------------------*/

function getAllBranches() { //method to get all branches which users can edit
	try {
		onValue(ref(db, 'mindMap/nodeStructure/children'), (snapshot) => { //get the branches JSON from the database
			allBranches = snapshot.val();
		}, {
			onlyOnce: true
		});
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
}

function getUserBranches() { //method to get the logged user's mind map
	getAllBranches(); //execute a method to get all branches which users can edit
	
	userBranches = allBranches; //assign the result of method to different variable for safety
	
	createUsersBranches(userBranches); //execute method to find method to get all branches which user has access to
	
	
	if (userBranches == null || userBranches.length == 0) { //if there are no branches or user has no access to any branches (either no own or no shared ones)...
		userMindMap = testMindMap; //set the userMindMap to a test one (with default help info)
	}
	else { //if user has access to any branches, input branches which they have access to into their mind map
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

function createUsersBranches(userBranchesJSON) { //method to find method to get all branches which user has access to
	var id = user.uid;
	
	for (var x in userBranchesJSON) { //for each element in the argument JSON...
		if(userBranchesJSON[x] != null && typeof userBranchesJSON[x] == "object") { //if the element exists and is an object...
			var sharedTest = false;
			
			if (userBranchesJSON[x].text["data-sharedWith"] != null) { //if the branch is shared to anyone...
				if (userBranchesJSON[x].text["data-sharedWith"].includes(id)) {	//if the branch is shared to the logged user...			
					sharedTest = true; //set sharedTest as true
				}
			}
			
			if ((userBranchesJSON[x].text["data-author"] != id) && (!sharedTest)) { //if the logged user is not an author of the branch and it is not shared to them...
				userBranchesJSON.splice(x, 1); //delete this branch from the JSON
				createUsersBranches(userBranchesJSON); //iterate through this level of branches again
			}
			
			if (userBranchesJSON[x] != null && userBranchesJSON[x].children != null) { //if the branch exists and has children branches...
				createUsersBranches(userBranchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}

$("#reloadMindMapBtn").on("click", ()=>{ //when reloadMindMapBtn is clicked...
	if (user) { //if a user is logged in...
	reloadMindMap(); //execute a method to reload the mind map
	}
	else { //if a user is not logged in...
		alert("Please reload the page in order to log in"); //show an alert
	}
});

function reloadMindMap() { //method to reload a mind map
	$('#tree-simple').empty(); //clear the current state of the mind map
	getUserBranches(); //execute a method to get the logged user's mind map
	chart = new Treant(userMindMap, function() {}, $ ); //show the mind map using Treant method
}



/*---------------------- MIND MAP BRANCH OPTIONS ----------------------*/

$('#tree-simple').on("click",".mainNode", function(e){ //when a mind map branch, which is the main one, is clicked...
	branchID = "mainNode"; //set the branch ID as "mainNode"
	mainNodeOptionsModal.show(); //show the mainNodeOptionsModal modal
});

$('#tree-simple').on("click",".testNode", function(e){ //when a mind map branch, which is the test one, is clicked...
	testNodeOptionsModal.show(); //show the testNodeOptionsModal modal
});

$('#tree-simple').on("click",".openBranchOptions", function(e){ //when a mind map branch is clicked...
	branchID = e.target.id; //get the ID of the branch which was the trigger
	
	if ($(e.target).attr('data-author') == user.uid) { //if the logged user is an author of the branch...
		ownerBranchOptionsModal.show(); //show ownerBranchOptionsModal modal
	}
	else { //if logged user is not an author of the branch...
		sharedBranchOptionsModal.show(); //show sharedBranchOptionsModal modal
	}
});

$('#closeOwnerBranchOptionsModalBtn').on("click", ()=>{ //when closeOwnerBranchOptionsModalBtn button is clicked...
	ownerBranchOptionsModal.hide(); //hide ownerBranchOptionsModal modal
});

$('#closeSharedBranchOptionsModalBtn').on("click", ()=>{ //when closeSharedBranchOptionsModalBtn button is clicked...
	sharedBranchOptionsModal.hide(); //hide sharedBranchOptionsModal modal
});

$('#closeMainNodeOptionsModalBtn').on("click", ()=>{ //when closeMainNodeOptionsModalBtn button is clicked...
	mainNodeOptionsModal.hide(); //hide mainNodeOptionsModal modal
});

$('#closeTestNodeOptionsModalBtn').on("click", ()=>{ //when closeTestNodeOptionsModalBtn button is clicked...
	testNodeOptionsModal.hide(); //hide testNodeOptionsModal modal
});



/*---------------------- NEW MIND MAP BRANCH ----------------------*/

$('#createNewBranchBtn').on("click", ()=>{ //when createNewBranchBtn button is clicked...
	$("#createNewBranchShare").empty(); //clear the div with the users which a branch can be shared to
	for (const x in allUsersJSON) { //for each user in the all users array
		if (allUsersJSON[x].uid != user.uid) { //if the user from the array is not the logged user...
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>'; //create an input with the username
			$("#createNewBranchShare").prepend(createBranchUser); //append the username to the list of usernames
		}
	}
	
	ownerBranchOptionsModal.hide(); //hide ownerBranchOptionsModal modal
	newBranchModal.show(); //show newBranchModal modal
});

$('#createNewBranchFromMNBtn').on("click", ()=>{ //when createNewBranchFromMNBtn button is clicked...
	$("#createNewBranchShare").empty(); //clear the div with the users which a branch can be shared to
	for (const x in allUsersJSON) { //for each user in the all users array
		if (allUsersJSON[x].uid != user.uid) { //if the user from the array is not the logged user...
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>'; //create an input with the username
			$("#createNewBranchShare").prepend(createBranchUser); //append the username to the list of usernames
		}
	}

	mainNodeOptionsModal.hide(); //hide mainNodeOptionsModal modal
	newBranchModal.show(); //show newBranchModal modal
});

$('#createNewBranchFromSharedBtn').on("click", ()=>{ //when createNewBranchFromSharedBtn button is clicked...
	$("#createNewBranchShare").empty(); //clear the div with the users which a branch can be shared to
	for (const x in allUsersJSON) { //for each user in the all users array
		if (allUsersJSON[x].uid != user.uid) { //if the user from the array is not the logged user...
			var createBranchUser = '<input type="checkbox" id="createBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="createBranchUser"> ' + allUsersJSON[x].username + '</input><br>'; //create an input with the username
			$("#createNewBranchShare").prepend(createBranchUser); //append the username to the list of usernames
		}
	}
	
	sharedBranchOptionsModal.hide(); //hide sharedBranchOptionsModal modal
	newBranchModal.show(); //show newBranchModal modal
});

$('#closeCreateNewBranchModalBtn').on("click", ()=>{ //when closeCreateNewBranchModalBtn button is clicked...
	newBranchModal.hide(); //hide newBranchModal modal
});

$("#saveNewBranchBtn").on("click", function(e){ //when saveNewBranchBtn button is clicked...
	//create a random ID of the branch
	const branchesListRef = ref(db, 'mindMapBranchesList');
	const newMindMapBranchRef = push(branchesListRef);
	const keyOfBranch = newMindMapBranchRef.key;
	
	var sharedWith = [];
	var id = user.uid;
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	
	$.each($("input[name='createBranchUser']:checked"), function(){ //for each checked input in createBranchUser
        sharedWith.push($(this).val()); //push the user uid whom the branch is shared to into the sharedWith array
    });
	
	var newNodeHTML = '<p class="node-name" id="' + keyOfBranch + '" data-author="' + id + '">' + $('#newBranchTitle').val() + '</p>'; //create an HTML string of the new branch
	
	savingNotifState("mind map branch", sharedWith, $('#newBranchTitle').val(), $('#charactersName').text()); //execute the method to save info about new notification to a user's data in the database

	var newNode = { //create a new node JSON
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
	
	
	if (allBranches == null) { //if there are no branches existing...
		allBranches = [newNode]; //set newNode as the one-element array in allBranches
	}
	else { //if there are branches in the mind map...
		if (branchID == "mainNode") { //if the branch is created from the main node...
			allBranches.push(newNode); //push new branch into the JSON of all branches
		}
		else { //if the branch is created from different node...
			insertNode(newNode, branchID, allBranches); //execute a method for inserting the node into its proper place
		}
	}
	
	try {
		set(ref(db, 'mindMap'), { //set new node in the database
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
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
	
	newBranchModal.hide(); //hide newBranchModal modal
	
	//clear the fields in the newBranchModal modal
	$('#newBranchTitle').val('');
	$('#newBranchNotes').val('');
	$.each($("input[name='createBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap(); //execute a method to reload a mind map
});

function insertNode(node, parentBranchID, branchesJSON) { //method for inserting the node into its proper place
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			if (branchesJSON[x].HTMLid == parentBranchID) { //if the id passed as the argument is the same as the one of the current branch...
				if (branchesJSON[x].children == null) { //if the branch has no children...
					branchesJSON[x].children = [node]; //set new branch as the one-element array in children of the parent branch
				}
				else { //if parent branch has children already...
					branchesJSON[x].children.push(node); //add new branch to an array of children branches
				}
			}
			else { //if the id passed as the argument is different than the one of the current branch...
				insertNode(node, parentBranchID, branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}



/*---------------------- OWN/EDIT MIND MAP BRANCHES ----------------------*/

$('#editBranchBtn').on("click", ()=>{ //when editBranchBtn button is clicked...
	$("#editBranchShare").empty(); //clear the div with the users which a branch can be shared to
	for (const x in allUsersJSON) { //for each user in the all users array
		if (allUsersJSON[x].uid != user.uid) { //if the user from the array is not the logged user...
			var editBranchUser = '<input type="checkbox" id="editBranchUser' + allUsersJSON[x].uid + '" value="' + allUsersJSON[x].uid + '" name="editBranchUser"> ' + allUsersJSON[x].username + '</input><br>'; //create an input with the username
			$("#editBranchShare").append(editBranchUser); //append the username to the list of usernames
		}
	}
	
	getEditedBranch(branchID, userBranches); //execute method for finding the branch which is to be edited
	
	//get all values (title and notes) of the branch
	$('#editBranchTitle').val(editedBranch.text["name"]);
	$('#editBranchNotes').val(editedBranch.text["data-notes"]);
	
	ownerBranchOptionsModal.hide(); //hide ownerBranchOptionsModal modal
	editBranchModal.show(); //show editBranchModal modal
});

function getEditedBranch(branchID, branchesJSON) { //method for finding the branch which is to be edited or read
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			if (branchesJSON[x].HTMLid == branchID) { //if the id passed as the argument is the same as the one of the current branch...
				editedBranch = branchesJSON[x]; //get the branch from the JSON as the one edited
			}
			else { //if the id passed as the argument is different than the one of the current branch...
				getEditedBranch(branchID, branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}

$('#closeEditBranchModalBtn').on("click", ()=>{ //when closeEditBranchModalBtn button is clicked...
	editBranchModal.hide(); //hide editBranchModal modal
});

$("#saveEditedBranchBtn").on("click", function(e){ //when saveEditedBranchBtn button is clicked...
	var sharedWith = [];
	var id = user.uid;
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	var editedNode;
	
	$.each($("input[name='editBranchUser']:checked"), function(){ //for each checked input in editBranchUser
        sharedWith.push($(this).val()); //push the user uid whom the branch is shared to into the sharedWith array
    });
	
	var editedNodeHTML = '<p class="node-name active" id="' + branchID + '" data-author="' + id + '">' + $('#editBranchTitle').val() + '</p>'; //create an HTML string of the edited branch
	
	savingNotifState("mind map branch", sharedWith, $('#editBranchTitle').val(), $('#charactersName').text()); //execute the method to save info about new notification to a user's data in the database
	
	if (editedBranch.children != null) { //if the edited branch has children branches...
		var nodeChildren = editedBranch.children;
		
		editedNode = { //set editedNode.children as the children of the branch
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
	else { //if the edited branch has no children...
		editedNode = { //set the edited branch without children
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
	
	updateNode(editedNode, branchID, allBranches); //execute method for inputing an edited branch back to its place
	
	try {
		set(ref(db, 'mindMap'), { //set new updated mind map in the database
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
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
	
	editBranchModal.hide(); //hide editBranchModal modal
	
	//clear the fields in the editBranchModal modal
	$('#editBranchTitle').val('');
	$('#editBranchNotes').val('');
	$.each($("input[name='editBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap(); //execute a method to reload a mind map
});

function updateNode(node, editedBranchID, branchesJSON) { //method for inputing an edited branch back to its place
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			if (branchesJSON[x].HTMLid == editedBranchID) { //if the id passed as the argument is the same as the one of the current branch...
				branchesJSON[x] = node; //replace an old branch with an updated one
			}
			else { //if the id passed as the argument is different than the one of the current branch...
				updateNode(node, editedBranchID, branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}

$('#deleteEditedBranchBtn').on("click", ()=>{ //when deleteEditedBranchBtn button is clicked...
	if(window.confirm("Do you really want to delete this branch? This cannot be undone and will delete all children branches, including ones created by other users!")) { //ask the user whether they're sure they want to delete the branch, if yes, then...
		var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
		
		deleteNode(branchID, allBranches); //execute the method to find and delete a proper branch
		
		try {
			set(ref(db, 'mindMap'), { //set new updated mind map in the database
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
		}
		catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
		
		editBranchModal.hide(); //hide editBranchModal modal
		
		//clear the fields in the editBranchModal modal
		$('#editBranchTitle').val('');
		$('#editBranchNotes').val('');
		$.each($("input[name='editBranchUser']:checked"), function(){
			$(this).prop('checked', false);
		});
		
		reloadMindMap(); //execute a method to reload a mind map
	}
});

function deleteNode(editedBranchID, branchesJSON) { //method to find and delete a proper branch
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			if (branchesJSON[x].HTMLid == editedBranchID) { //if the id passed as the argument is the same as the one of the current branch...
				branchesJSON.splice(x); //remove a branch from the array
			}
			else { //if the id passed as the argument is different than the one of the current branch...
				deleteNode(editedBranchID, branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}

$('#archiveEditedBranchBtn').on("click", ()=>{ //when archiveEditedBranchBtn button is clicked...
	var mainNodeHTML = '<p class="node-name" id="mainNode">Investigation</p>';
	
	archiveNode(branchID, allBranches); //execute a method to set the branch and its children as archived
	
	try {
		set(ref(db, 'mindMap'), { //set new updated mind map in the database
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
	}
	catch (error) { //if there is an error...
		if (error.message.includes("auth/network-request-failed")) { //show correct error message depeding on type of error
			alert("Please check your internet connection and try again");
		}
		else {
			alert(error.message); //show error message
		}
	}
	
	editBranchModal.hide(); //hide editBranchModal modal
	
	//clear the fields in the editBranchModal modal
	$('#editBranchTitle').val('');
	$('#editBranchNotes').val('');
	$.each($("input[name='editBranchUser']:checked"), function(){
		$(this).prop('checked', false);
	});
	
	reloadMindMap(); //execute a method to reload a mind map
});

function archiveNode(editedBranchID, branchesJSON) { //method to set the branch as archived
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			if (branchesJSON[x].HTMLid == editedBranchID) { //if the id passed as the argument is the same as the one of the current branch...
				//set innerHTML class, HTMLclass and state of the branch as "archived"
				branchesJSON[x].text["data-state"] = "archived";
				branchesJSON[x].HTMLclass = "openBranchOptions archived";
				var oldHTML = branchesJSON[x].innerHTML;
				var newHTML = oldHTML.replace("active", "archived");
				branchesJSON[x].innerHTML = newHTML;
				if (branchesJSON[x].children != null) { //if branch has children branches...
					archiveChildren(branchesJSON[x].children); //execute a method to set children of the branch as archived
				}
			}
			else { //if the id passed as the argument is different than the one of the current branch...
				archiveNode(editedBranchID, branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}

function archiveChildren(branchesJSON) { //method to set children of the branch as archived
	for (var x in branchesJSON) { //for each element in the argument JSON...
		if(branchesJSON != null && typeof branchesJSON == "object") { //if the element exists and is an object...
			//set innerHTML class, HTMLclass and state of the branch as "archived"
			branchesJSON[x].text["data-state"] = "archived";
			branchesJSON[x].HTMLclass = "openBranchOptions archived";
			var oldHTML = branchesJSON[x].innerHTML;
			var newHTML = oldHTML.replace("active", "archived");
			branchesJSON[x].innerHTML = newHTML;
			if (branchesJSON[x].children != null) { //if branch has children branches...
				archiveChildren(branchesJSON[x].children); //iterate through children of the branch
			}
		}
	}
}



/*---------------------- SHARED MIND MAP BRANCHS ----------------------*/

$('#readBranchBtn').on("click", ()=>{ //when readBranchBtn button is clicked...
	getEditedBranch(branchID, userBranches); //method for finding the branch which is to be read
	
	var author = editedBranch.text["data-author"]; //get the branch's author uid
	
	//find the username of the author of the entry
	for (var x in allUsersJSON) {
		if (allUsersJSON[x].uid == author) {
			$('#readBranchAuthor').text(allUsersJSON[x].username);
		}
	}
	
	//get all values (title and notes) of the entry
	$('#readBranchTitle').text(editedBranch.text["name"]);
	$('#readBranchNotes').text(editedBranch.text["data-notes"]);
	
	sharedBranchOptionsModal.hide(); //hide sharedBranchOptionsModal modal
	readBranchModal.show(); //show readBranchModal modal
});

$('#closeReadBranchModalBtn').on("click", ()=>{ //when closeReadBranchModalBtn button is clicked...
	readBranchModal.hide(); //hide readBranchModal modal
});



/*---------------------- ALL/GM MIND MAP BRANCHES ----------------------*/

$('#cardHeaderMindMap').on("click","#showAllBranchesBtn", function(e){ //when showAllBranchesBtn button is clicked...
	var GMMindMap = { //set the mind map as the one with all branches
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
	
	var chart2 = new Treant(GMMindMap, function() {}, $ ); //show the mind map with all branches visible
});

$('#closeGMAllBranchesModalBtn').on("click", ()=>{ //when closeGMAllBranchesModalBtn is clicked...
	GMAllBranchesModal.hide(); //hide GMAllBranchesModal modal
});