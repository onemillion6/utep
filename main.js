/* ======================================================
 *  VARIABLES
 * ======================================================
 */
var player ={
	lvl: 1,
	exp: 0,
	stat_points: 0,
	stats: [0, 0, 0, 0],
	total_reflections: 0,
	resources: [0, 0, 0, 0],
	lesson_plans: 0,
	atk_lvl: 0,
	def_lvl: 0,
	hp_lvl: 0,
	map: "0",
	name: "Name",
	day: 1,
	revealed: []
};

var stats_ids = ["introspection", "goalorientation", "datadrive", "creativity"];
var resource_ids = ["reflections", "objectives", "assessments", "activities"];

var resource_rates = [0,0,0,0]; // Rates are resources per second
var auto_collect; // setInterval for resource gathering

var lp_stats = [0,0,0,0]; // atk, def, maxhp, current hp
var s_stats = [1,1,10];  // atk, def, maxhp
var map_days = [7, 30, 30];

// Base Numbers
var lp_reqs = [20, 3, 5, 10] // Reflections, objectives, assessments, objectives

var bool_lp_alive = false;

var original_choice = 0; // Resource index of currently gathering resource

/* ======================================================
 *  GET FUNCTIONS
 * ======================================================
 */
function get_lvl_threshold() {
	var x = player.lvl
	var new_threshold = Math.round(2*x*x/10)*10+10;		
	return new_threshold;
}

/* ======================================================
 *  SET FUNCTIONS
 * ======================================================
 */
// Sets base resource collection rates based on player stats
function set_resource_rates(index, addition) {
	var new_rate = player.stats[index] * 1 + addition;
	resource_rates[index] = new_rate;	
};

//Calculate student health, attack, and defense for a given day
function set_s() {
	var constant = 0;
	var map_num = parseInt(player.map);
	if (map_num == 1) {
		constant = 7;
	} else if (map_num == 2) {
		constant = 37;
	}
	var day = player.day + constant;
	s_stats[0] = Math.ceil(day*day/15); 					  	// ATK		1/15  x^2
	s_stats[1] = Math.ceil(day*day/20); 						// DEF		1/20 x^2
	s_stats[2] = Math.round(0.25 * Math.pow(day-1, 2)  + 10); 	// HP		round( 0.25 *  (x-1)^2 + 10  )
};

// Calculate lesson plan health, attack, and defense
function set_lp_atk() {
	lp_stats[0] = 5 + player.atk_lvl * 5;
};
function set_lp_def () {
	lp_stats[1] = 0 + player.def_lvl * 5;
};
function set_lp_hp() {
	lp_stats[2] = 10 + player.hp_lvl * 5; // each level --> +5 hp
}; 

/* ======================================================
 *  UPDATE FUNCTIONS
 * ======================================================
 */
// Update Hidden Divs
function reveal_hidden() {
	for (i=0; i<player.revealed.length; i++){
		$( player.revealed[i] ).removeClass("hidden");
	} 
};

// Update Player Level
function update_lvl() {
	$( "#player_lvl" ).html(player.lvl);
}

function update_exp() {
	var new_threshold = get_lvl_threshold();
	var percent = Math.round(player.exp/new_threshold * 100).toString()+"%";
	
	$( "#exp_bar" ).width( percent );
	$( "#exp_label").html( player.exp+"/"+new_threshold);
}

//Update player's unused stat points
function update_unused_points(point_count) {
	player.stat_points = player.stat_points + point_count;
	document.getElementById("stat_points").innerHTML = player.stat_points;
};

//Update Player Stats
function update_stats(index) {
	var element_id = stats_ids[index];
	var e = document.getElementById(element_id);
	e.innerHTML = player.stats[index];
};

// Update Player Resources on Screen
function update_resources(index) {
	var element_id = resource_ids[index];
	var e = document.getElementById(element_id);
	e.innerHTML = player.resources[index];
};

// Update Player Resource Collect Rates on Screen
function update_rates(index) {
	var element_id = resource_ids[index].concat("_rate");
	var e = document.getElementById(element_id);
	e.innerHTML = resource_rates[index];
};

// Update Player Lesson Plans on Screen
function update_lessonplans() {
	var e = document.getElementById("lesson_plans");
	e.innerHTML = player.lesson_plans;
}

// Update Student Atk and Def
function update_s() {
	$( "#s_atk" ).html(s_stats[0]);
	$( "#s_def" ).html(s_stats[1]);
}

// Update Player Attack Level on Screen
function update_atk_lvl() {
	$( "#atk_lvl" ).html(player.atk_lvl);
}
// Update Player Defense Level on Screen
function update_def_lvl() {
	$( "#def_lvl" ).html(player.def_lvl);
}
// Update Player Health Level on Screen
function update_hp_lvl() {
	$( "#hp_lvl" ).html(player.hp_lvl);
}

// Updates all variables on screen
function update_view() {
	document.getElementById("name").innerHTML = player.name; // Take this out and put it somewhere else
	
	for(i=0; i<4; i++) {
		update_stats(i);
		update_resources(i);
		update_rates(i);
	}
	
	update_lessonplans();
	update_atk_lvl();
	update_def_lvl();
	update_hp_lvl();
	update_lvl();
	update_exp();
};

/* ======================================================
 *  CLICK EVENTS
 * ======================================================
 */

// STAT UP BUTTONS
// -------------------------------------------------------
function stat_up(stat_index) {
	// Remove 1 unused stat point
	update_unused_points(-1);
	// Increase the chosen stat
	player.stats[stat_index] = player.stats[stat_index] + 1;
	
	if (original_choice == stat_index) {
		set_resource_rates(stat_index, 0.5);
	} else {
		set_resource_rates(stat_index, 0);
	}
	update_rates(stat_index);
};

document.getElementById("up_reflections").onclick = function() {
	if (player.stat_points > 0) {
		// Updates player variable 
		stat_up(0);
		// Updates stat on screen
		update_stats(0);
	}
};
document.getElementById("up_objectives").onclick = function() {
	if (player.stat_points > 0) {
		stat_up(1);
		update_stats(1);
	}
};
document.getElementById("up_assessments").onclick = function() {
	if (player.stat_points > 0) {
		stat_up(2);
		update_stats(2);
	}
};
document.getElementById("up_activities").onclick = function() {
	if (player.stat_points > 0) {
		stat_up(3);
		update_stats(3);
	}
};

// RESOURCE BUTTONS
// -------------------------------------------------------
document.getElementById( "bttn_reflect" ).onclick = function() {  
    player.total_reflections++;
    player.resources[0] = player.resources[0] + 1;
    update_resources(0);  //updates the text
    exp_up(1);
    
    if ( $( "#objectives_box" ).hasClass("hidden") && player.resources[0] > 5) {
    	$( "#objectives_box" ).removeClass("hidden");
    	$( "#stat_objectives" ).removeClass("hidden");
    	$( "#dialogue" ).prepend("> When you lesson plan, be sure to first identify your objectives. </br>");
    	player.revealed.push("#objectives_box");
    	player.revealed.push("#stat_objectives");
    }
};

function toggle_work(resource_index) {
	clearInterval(auto_collect);
	
	// If player is not already collecting this resource
	if (original_choice != resource_index) {
				
		// Set and Update interface to show new rates
		set_resource_rates(original_choice, 0);
		set_resource_rates(resource_index, 0.5);
		
		update_rates(original_choice);
		update_rates(resource_index);

		original_choice = resource_index;
		
	} else { // Player is already collecting this resource, stop collecting
		original_choice = 0;
		
		// Reset rates to default
		for (i=0; i<4; i++) {
			set_resource_rates(i, 0);
		}
		
		update_rates(resource_index);
	}
	
	auto_collect = setInterval(function () {
		for (i=0; i<4; i++) {
			player.resources[i] = player.resources[i] + resource_rates[i];
			update_resources(i);
		}
		
		if ( $( "#assessments_box" ).hasClass("hidden") && player.resources[1] > lp_reqs[1]) {
	    	$( "#assessments_box" ).removeClass("hidden");
	    	$( "#dialogue" ).prepend("> Next, create assessments that align to your objectives. </br>");
	    	player.revealed.push("#assessments_box");
	    	
	    	$( "#stat_assessments" ).removeClass("hidden");
	    	player.revealed.push("#stat_assessments");
	    }
		
		if ( $( "#activities_box" ).hasClass("hidden") && player.resources[2] > lp_reqs[2]) {
	    	$( "#activities_box" ).removeClass("hidden");
	    	$( "#dialogue" ).prepend("> Last, create activites that support students to reach your objectives. </br>");
	    	player.revealed.push("#activities_box");
	    	
	    	$( "#stat_activities" ).removeClass("hidden");
	    	player.revealed.push("#stat_activities");
	    }
		
		if ( $( "#lessonplans_box" ).hasClass("hidden") && player.resources[3] > 5 ) {
	    	$( "#lessonplans_box" ).removeClass("hidden");
	    	$( "#dialogue" ).prepend("> What progress! Now you know how to lesson plan...UbD style! </br>");
	    	player.revealed.push("#lessonplans_box");
	    }
	}, 1000);
};

document.getElementById( "bttn_objectives" ).onclick = function() {
	toggle_work(1);
	$( "#bttn_assessments" ).removeClass("active");
	$( "#bttn_activities" ).removeClass("active");
};
document.getElementById( "bttn_assessments" ).onclick = function() {
	toggle_work(2);
	$( "#bttn_objectives" ).removeClass("active");
	$( "#bttn_activities" ).removeClass("active");
};
document.getElementById( "bttn_activities" ).onclick = function() {
	toggle_work(3);
	$( "#bttn_objectives" ).removeClass("active");
	$( "#bttn_assessments" ).removeClass("active");
};


// LESSON PLAN FORGE BUTTON
// -------------------------------------------------------
document.getElementById( "bttn_lessonplans" ).onclick = function() {
	if (player.resources[0] >= lp_reqs[0] && player.resources[1] >= lp_reqs[1] && 
			player.resources[2] >= lp_reqs[2] && player.resources[3] >= lp_reqs[3]) {
		player.resources[0] = player.resources[0] - lp_reqs[0];
		player.resources[1] = player.resources[1] - lp_reqs[1];
		player.resources[2] = player.resources[2] - lp_reqs[2];
		player.resources[3] = player.resources[3] - lp_reqs[3];
		player.lesson_plans++;
		update_lessonplans();
		exp_up(2);
	}
	
	if( $( "#map_box" ).hasClass("hidden") && player.lesson_plans > 0) {
		$( "#map_box" ).removeClass("hidden");
		$( "#dialogue" ).prepend("> Try teaching your shiny new lesson plan to a student...</br>");
		player.revealed.push("#map_box");
	}
}

// TEACH BUTTON
// -------------------------------------------------------
$( "#bttn_fight" ).click( function() {
	// Check that a fight is not already in progress
	if ( !$( "#bttn_fight" ).hasClass("disabled") ) {
		// If there is a current LP alive
		if (bool_lp_alive) {
			fight();
			$( "#bttn_fight" ).addClass("disabled");
		// If there is no life LP, but there are reserves
		} else if(player.lesson_plans > 0) {
			player.lesson_plans = player.lesson_plans - 1;
			update_lessonplans();
			bool_lp_alive = true;
			fight();
			$( "#bttn_fight" ).addClass("disabled");
		} 
		// Do nothing if there is no LP alive and no reserves
	}
});

// UPGRADE BUTTONS
// -------------------------------------------------------
$( "#bttn_atk" ).click( function() {
	var lp_required = Math.pow(player.atk_lvl + 2, 2); // (x+2)^2
	if (player.lesson_plans >= lp_required) {
		player.atk_lvl++;
		player.lesson_plans = player.lesson_plans - lp_required;
		update_lessonplans();
		update_atk_lvl();
		
		// Update Button
		lp_required = Math.pow(player.atk_lvl + 2, 2);
		$( "#bttn_atk" ).html("Buy for "+lp_required+" LP");
	}
});

$( "#bttn_def" ).click( function() {
	var lp_required = Math.pow(player.def_lvl + 2, 2); // (x+2)^2
	if (player.lesson_plans >= lp_required) {
		player.def_lvl++;
		player.lesson_plans = player.lesson_plans - lp_required;
		update_lessonplans();
		update_def_lvl();
		
		// Update Button
		lp_required = Math.pow(player.def_lvl + 2, 2);
		$( "#bttn_def" ).html("Buy for "+lp_required+" LP");
	}
});

$( "#bttn_hp" ).click( function() {
	var lp_required = Math.pow(player.hp_lvl + 2, 2); // (x+2)^2
	if (player.lesson_plans >= lp_required) {
		player.hp_lvl++;
		player.lesson_plans = player.lesson_plans - lp_required;
		update_lessonplans();
		update_hp_lvl();
		
		// Update Button
		lp_required = Math.pow(player.hp_lvl + 2, 2);
		$( "#bttn_hp" ).html("Buy for "+lp_required+" LP");
	}
});

// RESET BUTTON
// -------------------------------------------------------
document.getElementById("reset").onclick = function() {
	player.lvl = 0;
	player.exp = 0;
	player.stat_points = 0;
	player.stats = [0, 0, 0, 0];
	player.total_reflections = 0;
	player.resources = [0, 0, 0, 0];
	player.lesson_plans = 0;
	player.atk_lvl = 0;
	player.def_lvl = 0;
	player.hp_lvl = 0;
	player.map = "0";
	player.name = "Name";
	player.day = 1;
	
	$( "#bttn_objectives" ).removeClass("active")
	$( "#bttn_assessments" ).removeClass("active");
	$( "#bttn_activities" ).removeClass("active");
	
	var person = prompt("What would you like your students to call you?", " ");
	if (person != null) {
	 	document.getElementById("name").innerHTML = person;
		player.name = person;
	}
	
	for (i=0; i<4; i++) {
		set_resource_rates(i, 0);
	}
	
	update_view();
	$( "#dialogue" ).html("");
	$( "#reflections_box" ).addClass("hidden");
	//$( "#reflections_box").addClass("hidden");
	$( "#toggles").addClass("hidden");
	$( "#map_box").addClass("hidden");
	$( "#lessonstudies_box").addClass("hidden");
	
	//save_game();
}

/* ======================================================
 *  LESSON PLAN vs STUDENT
 * ======================================================
 */
// Update health progress bar
// id: "#s_health" or "#lp_health"
function update_hp(id, current_hp, max_hp) {
	var percent = Math.round((current_hp/max_hp) * 100).toString()+"%";
	
	$( id ).width(percent);
	$( id+"_label" ).html(current_hp+"/"+max_hp);
};

function progress_map() {
	var day_id = "#" + player.map + "_" + player.day;
	$( day_id ).removeClass("current-day");
	
	var map_num = parseInt(player.map);
	// Player is not at the end of a map
	if (player.day < map_days[map_num]) {
		player.day++;
	// Player is progressing to map 1 or 2
	} else if (player.map != "2"){
		// Hide old map, reveal new map
		$( "#map_" + player.map ).addClass("hidden");
		player.map = (map_num+1).toString();
		$( "#map_" + player.map ).removeClass("hidden");
		player.day = 1;
		
	// Player is finishing the final map
	} else {
		alert("Congratulations! You have completed UTEP!");
	}
	
	day_id = "#" + player.map + "_" + player.day;
	$( day_id ).addClass("current-day");
};

function fight() {

	// Lesson Plan Stats
	set_lp_atk();
	set_lp_def();
	set_lp_hp();
		
	var lp_atk = lp_stats[0];
	var lp_def = lp_stats[1];
	var lp_maxhp = lp_stats[2];
	
	var lp_currhp;
	if (lp_stats[3] > 0) {
		lp_currhp = lp_stats[3];
	} else {
		lp_currhp = lp_maxhp;
	}
	
	// Student Stats
	var s_atk = s_stats[0];
	var s_def = s_stats[1];
	var s_maxhp = s_stats[2];
	var s_currhp = s_maxhp;
	
	$( "#lp_atk" ).html(lp_atk);
	$( "#lp_def" ).html(lp_def);
	update_hp("#s_health", s_currhp, s_maxhp);
	update_hp("#lp_health", lp_currhp, lp_maxhp);
		
	// Begin fight!
	var fight_interval = setInterval(function () {
		
		// LP attack
		if (lp_atk > s_def) {
			s_currhp = s_currhp - (lp_atk - s_def);
		}
		if (s_currhp < 0) {
			s_currhp = 0;
		}
		update_hp("#s_health", s_currhp, s_maxhp);
		
		// LP wins, S loses
		if(s_currhp <= 0) {
			clearInterval(fight_interval);
			
			// Reset for next fight
			setTimeout( progress_map(), 1000);
			set_s();
			update_s();	
			lp_stats[3] = lp_currhp;
			
			// Exp Up
			var student_xp = 0;
			var map_num = parseInt(player.map);
			if (map_num == 1) {
				student_xp = 7;
			} else if (map_num == 2) {
				student_xp = 37;
			}
			exp_up(Math.max(student_xp + player.day, 10));
			
			$( "#bttn_fight" ).removeClass("disabled");
		} else {
			// S attacks
			setTimeout( function() {
				
				if (s_atk > lp_def) {
					lp_currhp = lp_currhp - (s_atk - lp_def);
				}
				if (lp_currhp < 0) {
					lp_currhp = 0;
				}
				update_hp("#lp_health", lp_currhp, lp_maxhp);
				
				// S wins, LP loses
				if(lp_currhp <= 0) {
					clearInterval(fight_interval);
					bool_lp_alive = false;
					lp_stats[3] = 0;
					$( "#bttn_fight" ).removeClass("disabled");
					
					if( $( "#0_6" ).hasClass("current-day") ) {
						$( "#dialogue" ).prepend("> How about some upgrades? </br>");
						$( "#lessonstudies_box" ).removeClass("hidden");
						player.revealed.push("#lessonstudies_box");
					}
				}
			}, 1000);
		}
	}, 2000);
	
}

/* ======================================================
 *  EXPERIENCE & LEVELING UP
 * ======================================================
 */

// Levels Up Player
function level_up() {
	player.lvl++;
	update_lvl();
	update_exp();
	
	$( "#dialogue" ).prepend("> Level up! </br>" );
	
	update_unused_points(1);
}

// Increases Player Exp
function exp_up(increase) {
	player.exp = player.exp + increase;
	var lvl_threshold = get_lvl_threshold(); // 5x^2
	
	// Level Up
	if (player.exp >= lvl_threshold) {
		player.exp = player.exp - lvl_threshold;
		level_up();
	} else {
	// Just update exp bar
		update_exp();
	}
}

/* ======================================================
 *  SAVING AND LOADING FUNCTIONS
 * ======================================================
 */
function save_game() {
	localStorage['utepgame_save14'] = btoa(JSON.stringify(player));
}
 
function load_game() {
	// No save data, new game!
    if (!localStorage['utepgame_save14']){
    	$( "#dialogue" ).html("> <b>Welcome to Orientation Week of UTEP! </b>");
    	setTimeout(function() {
    		$( "#dialogue" ).prepend("> Hmm...Look at all those zeroes. </br>");
    		setTimeout(function() {
    			$( "#dialogue" ).prepend("> No matter; we can change that! Start by doing some reflecting. </br>");
                $( "#reflections_box" ).removeClass("hidden");
                player.revealed.push("#reflections_box");
    		}, 2000);
    	}, 2000);
    	
    	return;
    }
 	var save_data = JSON.parse(atob(localStorage['utepgame_save14']));
 	player = save_data;
}

/* ======================================================
 *  LAUNCH GAME
 * ======================================================
 */
load_game(); //attempt to load the game
reveal_hidden();
for (i=0; i<4; i++) {
	set_resource_rates(i, 0);
}

// Begin auto collecting resources
auto_collect = setInterval(function () {
	for (i=0; i<4; i++) {
		player.resources[i] = player.resources[i] + resource_rates[i];
		update_resources(i);
	}
}, 1000);

update_view();

// Saves game every 3 seconds
//setInterval(function () { save_game(); }, 5000);
