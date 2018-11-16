/*
	This is the JavaScript file for the Baby Names website.
*/

"use strict";

(function() {

	var URL = "https://webster.cs.washington.edu/cse154/babynames.php"; // name retrieval server
	var CHOSEN_NAME = "";
	var GENDER;

	// method to grab all possible names to choose from and update the page with them
	function getList() {
		// prepares and sends the request for the name list
		var ajax = new XMLHttpRequest();
		ajax.onload = processList;
		var listUrl = URL + "?type=list";
		ajax.open("GET", listUrl, true);
		ajax.send();
		
		// method to process the Ajax request and add names to the options for the user
		function processList() {
			if (this.status == 200) {
				var response = this.responseText;
				var responseArray = response.split("\n");
				
				// adds each name to the select box to choose from
				for (var i = 0; i < responseArray.length; i++) {
					var newOption = document.createElement("option");
					newOption.value = responseArray[i];
					newOption.innerHTML = responseArray[i];
					document.getElementById("allnames").appendChild(newOption);
				}
				document.getElementById("allnames").removeAttribute("disabled");
			} else {
				handleError(this.status); // handles the error
			}
			document.getElementById("loadingnames").style.display = "none"; // hides loading
		}
	}
	
	// method to process and grab the meanings of the name for the user
	function getMeaning() {
		// prepares and sends the request for the meaning
		var ajax = new XMLHttpRequest();
		ajax.onload = processMeaning;
		CHOSEN_NAME = document.getElementById("allnames").value;
		var listUrl = URL + "?type=meaning&name=" + CHOSEN_NAME + "";
		ajax.open("GET", listUrl, true);
		ajax.send();
		
		// called upon loading and places the meaning on the page
		function processMeaning() {
			if (this.status == 200) {
				var meaning = document.getElementById("meaning");
				meaning.innerHTML = this.responseText; // displays loading on screen
				document.getElementById("loadingmeaning").style.display = "none"; // hides loading
			} else {
				handleError(this.status); // handles the error
			}
		}
	}
	
	// method to get the popularity of the name
	function getRank() {
		// prepares and sends ajax request
		var ajax = new XMLHttpRequest();
		ajax.onload = processRank;
		var genders = document.getElementsByName("gender");
		for (var i = 0; i < genders.length; i++) {
			if (genders[i].checked) {
				GENDER = genders[i].value; // finds the specified gender
			}
		}
		var listUrl = URL + "?type=rank&name=" + CHOSEN_NAME + "&gender=" + GENDER + "";
		ajax.open("GET", listUrl, true);
		ajax.send();
		
		// processes the population and displays data for the user
		function processRank() {
			if (this.status == 200) {
				var rankings = this.responseXML.getElementsByTagName("rank");
				var graph = document.getElementById("graph");

				// shows the popularity for each year and all years as cells
				var dataRow = document.createElement("tr");
				var yearRow = document.createElement("tr");
				for (var i = 0; i < rankings.length; i++) {

					// show all the years
					var yearCell = document.createElement("th");
					yearCell.innerHTML = rankings[i].getAttribute("year");
					yearRow.appendChild(yearCell);


					// show popularity for each year
					var popularCell = document.createElement("td");
					var popularInnerCell = document.createElement("div");
					
					// determines height/popularity display of each name in each time period
					var rank = rankings[i].innerHTML;
					if (rank > 0 && rank <= 999) {
						popularInnerCell.style.height = parseInt((1/4) * (1000 - rank)) + "px";
					} else {
						rank = 0;
						popularInnerCell.style.height = 0 + "px";
					}
					if (rank > 0 && rank <= 10) {
						popularInnerCell.className = popularInnerCell.className + " topten";
					}
					popularInnerCell.innerHTML = rank;
					popularCell.appendChild(popularInnerCell);
					dataRow.appendChild(popularCell);
				}

				// adds the new rows to the graph
				graph.appendChild(yearRow);
				graph.appendChild(dataRow);
				document.getElementById("loadinggraph").style.display = "none"; // hides loading
			} else if (this.status == 410) { 
				// case for name/gender match not found
				document.getElementById("graph").innerHTML = "";
				document.getElementById("norankdata").style.display = "inline";
				document.getElementById("loadinggraph").style.display = "none";
			} else {
				handleError(this.status); // handles the error
			}
		}
	}
	
	// method to find celebs with the given name
	function getCelebs() {
		// prepares and sends the request for celebs
		var ajax = new XMLHttpRequest();
		ajax.onload = processCelebs;
		var listUrl = URL + "?type=celebs&name=" + CHOSEN_NAME + "&gender=" + GENDER + "";
		ajax.open("GET", listUrl, true);
		ajax.send();
		
		// processes the data for celebrities returned from the server
		function processCelebs() {
			if (this.status == 200) {
				var json = JSON.parse(this.responseText);
				var list = document.getElementById("celebs");
				for (var i = 0; i < json.actors.length; i++) {
					var first = json.actors[i].firstName;
					var last = json.actors[i].lastName;
					var films = json.actors[i].filmCount;
					var item = document.createElement("li");
					item.innerHTML = "" + first + " " + last + " (" + films + " films)";
					list.appendChild(item); // adds each celeb to screen
				}
				document.getElementById("loadingcelebs").style.display = "none"; // hides loading
			} else {
				handleError(this.status); // handles the error
			}
		}
	}

	// function to handle errors and display a message to the user. Loading gifs are
	// suspended during this
	function handleError(e) {
		document.getElementById("errors").innerHTML = "Sorry, error " + e + " has occurred";
		document.getElementsByClassName("loading").style.display = "none";
	}
	
	// prepare the page for the search inquiry by the user
	function searchClicked() {
		if (document.getElementById("allnames").value) { // if a valid name is chosen

			// prepare the page for a new search
			document.getElementById("resultsarea").style.display = "inline";
			document.getElementById("loadingmeaning").style.display = "inline";
			document.getElementById("loadinggraph").style.display = "inline";
			document.getElementById("loadingcelebs").style.display = "inline";
			document.getElementById("meaning").innerHTML = "";
			document.getElementById("graph").innerHTML = "";
			document.getElementById("celebs").innerHTML = "";
			document.getElementById("errors").innerHTML = "";
			document.getElementById("norankdata").style.display = "none";
			
			// conducts the new search
			getMeaning();
			getRank();
			getCelebs();
		}
	}
	
	// prepares the page upon loading for the user
	window.onload = function() {
		getList(); // gets the name list
		document.getElementById("search").onclick = searchClicked;
	};
})();
