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
var bool_fighting = false;

var original_choice = 0; // Resource index of currently gathering resource

/* ======================================================
 *  GET FUNCTIONS
 * ======================================================
 */
function get_lvl_threshold() {
	var x = player.lvl
	var new_threshold = Math.round(2*x*x/10)*10+20;		
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
	s_stats[0] = Math.ceil(day*day/30); 					  	// ATK		1/30  x^2
	s_stats[1] = Math.round(day*day/50); 						// DEF		1/50 x^2
	s_stats[2] = Math.round(0.05 * Math.pow(day-1, 2)  + 10); 	// HP		round( 1/20 *  (x-1)^2 + 10  )
};

// Calculate lesson plan health, attack, and defense
function set_lp() {
	lp_stats[0] = 5 + player.atk_lvl * 5;
	lp_stats[1] = 0 + player.def_lvl * 5;
	lp_stats[2] = 10 + player.hp_lvl * 5; // each level --> +5 hp
}

/* ======================================================
 *  UPDATE FUNCTIONS
 * ======================================================
 */
// Update Hidden Divs
function reveal_hidden() {
	for (i=0; i<player.revealed.length; i++){
		var id = player.revealed[i];
		if (id == "#map_1" || id == "#map_2") {
			$( id ).fadeIn();
		} else {
			$( id ).css("visibility", "visible").hide().fadeIn();
		}
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

//Update LP Atk and Def
function update_lp() {
	$( "#lp_atk" ).html(lp_stats[0]);
	$( "#lp_def" ).html(lp_stats[1]);
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
	
	$( "#" + player.map + "_" + player.day).addClass("current-day");
	
	update_lessonplans();
	update_atk_lvl();
	update_def_lvl();
	update_hp_lvl();
	update_lvl();
	update_exp();
	
	set_s();
	update_s();
	set_lp();
	update_lp();
	update_hp("#s_health", s_stats[2], s_stats[2])
	update_hp("#lp_health", lp_stats[2], lp_stats[2])
	
	update_upgrade_button("atk");
	update_upgrade_button("def");
	update_upgrade_button("hp");
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
    
    if ( $( "#objectives_box" ).css("visibility") === "hidden" && player.resources[0] > 5) {
    	
    	$("#objectives_box").css('visibility','visible').hide().fadeIn();
    	$("#stat_objectives").css('visibility','visible').hide().fadeIn();
    	
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
		
		if ( $( "#assessments_box" ).css("visibility") === "hidden" && player.resources[1] > lp_reqs[1]) {
	    	$( "#dialogue" ).prepend("> Next, create assessments that align to your objectives. </br>");
	    	
	    	$( "#assessments_box" ).css('visibility','visible').hide().fadeIn();
	    	player.revealed.push("#assessments_box");
	    	
	    	$( "#stat_assessments" ).css('visibility','visible').hide().fadeIn();
	    	player.revealed.push("#stat_assessments");
	  	    }
		
		if ( $( "#activities_box" ).css("visibility") === "hidden" && player.resources[2] > lp_reqs[2]) {
	    	$( "#activities_box" ).css('visibility','visible').hide().fadeIn();
	    	$( "#dialogue" ).prepend("> Last, create activites that support students to reach your objectives. </br>");
	    	player.revealed.push("#activities_box");
	    	
	    	$( "#stat_activities" ).css('visibility','visible').hide().fadeIn();
	    	player.revealed.push("#stat_activities");
	    }
		
		if ( $( "#lessonplans_box" ).css("visibility") === "hidden" && player.resources[3] > 5 ) {
	    	$( "#lessonplans_box" ).css('visibility','visible').hide().fadeIn();
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


// LESSON PLAN FORGE BUTTON (Press and hold)
// -------------------------------------------------------
function holdit(btn, action, start, speedup) {
    var t;

    var repeat = function () {
        action();
        t = setTimeout(repeat, start);
        start = Math.max(start / speedup, 50);
    }

    btn.onmousedown = function() {
        repeat();
    }

    btn.onmouseup = function () {
        clearTimeout(t);
        start = 400;
        speedup = 1.4;
    }
    
    btn.onmouseout = function () {
        clearTimeout(t);
        start = 400;
        speedup = 1.4;
    }
};

function forge_lp() {
	if (player.resources[0] >= lp_reqs[0] && player.resources[1] >= lp_reqs[1] && 
			player.resources[2] >= lp_reqs[2] && player.resources[3] >= lp_reqs[3]) {
		player.resources[0] = player.resources[0] - lp_reqs[0];
		player.resources[1] = player.resources[1] - lp_reqs[1];
		player.resources[2] = player.resources[2] - lp_reqs[2];
		player.resources[3] = player.resources[3] - lp_reqs[3];
		player.lesson_plans++;
		update_lessonplans();
		exp_up(10);
	}
	
	if( $( "#map_box" ).css("visibility") === "hidden" && player.lesson_plans > 0) {
		$( "#map_box" ).css("visibility", "visible");
		$( "#map_0" ).fadeIn();
		$( "#dialogue" ).prepend("> Try teaching your shiny new lesson plan to a student...</br>");
		player.revealed.push("#map_box");
		player.revealed.push("#map_0");
	}
};

holdit(document.getElementById( "bttn_lessonplans" ), forge_lp, 400, 1.4);

// TEACH BUTTON
// -------------------------------------------------------
$( "#bttn_fight" ).click( function() {
	if ( !bool_fighting ) {
		// If there is no life LP, but there are reserves
		if(player.lesson_plans > 0) {
			player.lesson_plans = player.lesson_plans - 1;
			update_lessonplans();
			bool_lp_alive = true;
		} 
		// If there is a current LP alive
		if (bool_lp_alive) {
			bool_fighting = true;
			fight();
			$( "#bttn_fight" ).addClass("disabled");
		}
	}
	
});

// UPGRADE BUTTONS
// -------------------------------------------------------
// Type: atk, def, hp
function update_upgrade_button(type) {
	var level;
	if (type == "atk") {
		level = player.atk_lvl;
	} else if (type == "def") {
		level = player.def_lvl;
	} else { // type == "hp"
		level = player.hp_lvl;
	}
	var lp_required = Math.pow(level + 2, 2);
	
	$( "#bttn_"+type ).html("Buy for "+lp_required+" LP");
};

$( "#bttn_atk" ).click( function() {
	var lp_required = Math.pow(player.atk_lvl + 2, 2); // (x+2)^2
	if (player.lesson_plans >= lp_required) {
		player.atk_lvl++;
		player.lesson_plans = player.lesson_plans - lp_required;
		update_lessonplans();
		update_atk_lvl();
		
		// Update Button
		update_upgrade_button("atk");
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
		update_upgrade_button("def");
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
		update_upgrade_button("hp");
	}
});

// DAY BUTTONS
// -------------------------------------------------------
$( ".day" ).click(function () {
	var day_clicked = parseInt(this.id.split("_")[1]);
	//console.log(day_clicked);
	if (day_clicked < player.day && !bool_fighting) {
		// Remove "current-day" class from old day
		var day_id = "#" + player.map + "_" + player.day;
		$( day_id ).removeClass("current-day");
		
		// Move to day clicked on map
		player.day = day_clicked;
		day_id = "#" + player.map + "_" + player.day;
		$( day_id ).addClass("current-day");
		
		// Reset to Student from day clicked 
		set_s();
		update_s();	
		update_hp("#s_health", s_stats[2], s_stats[2]);
	} 
})

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
	player.revealed = [];

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
	
	localStorage.clear();
	load_game();
	update_view();
	$( "#dialogue" ).html("");
	$( "#stat_points" ).html("0");
	$( "#reflections_box" ).css("visibility", "hidden");
	$( "#lessonplans_box").css("visibility", "hidden");
	$( "#assessments_box").css("visibility", "hidden");
	$( "#objectives_box").css("visibility", "hidden");
	$( "#activities_box").css("visibility", "hidden");
	$( "#map_box").css("visibility", "hidden");
	$( "#map_0").css("visibility", "hidden");
	$( "#map_1").css("visibility", "hidden");
	$( "#map_2").css("visibility", "hidden");
	$( "#lessonstudies_box").css("visibility", "hidden");
	
	
	resource_rates = [0,0,0,0]; // Rates are resources per second
	lp_stats = [0,0,0,0]; // atk, def, maxhp, current hp
	s_stats = [1,1,10];  // atk, def, maxhp
	bool_lp_alive = false;
	original_choice = 0; // Resource index of currently gathering resource
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
		// Reveal uprades after map 5
		if( player.map+"_"+player.day === "0_6" ) {
			$( "#dialogue" ).prepend("> How about some upgrades? </br>");
			$( "#lessonstudies_box" ).css("visibility", "visible").hide().fadeIn();
			player.revealed.push("#lessonstudies_box");
		}
	// Player is progressing to map 1 or 2
	} else if (player.map != "2"){
		if (player.map == "0") {
			$( "#dialogue" ).prepend("> Congratuations! You've completed O-week! Onto Induction Year~ " +
					"(If you get stuck, you can always return to teaching former students.) </br>");
		} else {
			$( "#dialogue" ).prepend("> Congratuations! You've completed Induction Year! Onto Residency~ </br>");
		}
		
		// Hide old map, reveal new map
		$( "#map_" + player.map ).css("display", "none");
		var index = player.revealed.indexOf("#map_" + player.map);
		if (index !== -1) {
		    player.revealed.splice(index, 1);
		}
		player.map = (map_num+1).toString();
		$( "#map_" + player.map ).fadeIn();
		player.revealed.push("#map_" + player.map);
		player.day = 1;
		
	// Player is finishing the final map
	} else {
		alert("Congratulations! You have completed UTEP!");
	}
	
	day_id = "#" + player.map + "_" + player.day;
	$( day_id ).addClass("current-day");
};

// Calculates randomized damage
function get_damage(enemy_attack, defense) {
	// Generate a random number between -.2 and .2 (20% range)
	var min = -20;
	var max = 20;
	var random_percent = Math.floor(Math.random()*(max-min+1)+min) / 100; 
		
	// Every hit does at least 1 damage
	damage = Math.max(1, Math.round((1+random_percent) * enemy_attack));
	
	// If defense blocks all damage
	if (defense > damage){
		damage = 0;
	}
	
	return damage;
}

function fight() {

	// Lesson Plan Stats
	set_lp();
		
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
	
	update_lp();
	update_hp("#s_health", s_currhp, s_maxhp);
	update_hp("#lp_health", lp_currhp, lp_maxhp);
		
	// Begin fight!
	var fight_interval = setInterval(function () {
		
		// LP attacks
		s_currhp = Math.max( s_currhp - get_damage(lp_atk, s_def), 0);
		update_hp("#s_health", s_currhp, s_maxhp);
		
		// LP wins, S loses
		if(s_currhp <= 0) {
			clearInterval(fight_interval);
			
			// Reset for next fight
			setTimeout( progress_map, 750);
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
			
			var gained_xp = 2* Math.max(student_xp + player.day, 10);
			$( "#dialogue" ).prepend("> Student " + (student_xp + player.day) + " learned! exp+" +gained_xp +"</br>");
			exp_up(gained_xp);
			
			setTimeout( fight, 2000 );
			
		} else {
			setTimeout( function() {
				// S attacks
				lp_currhp = Math.max( lp_currhp - get_damage(s_atk, lp_def), 0);
				update_hp("#lp_health", lp_currhp, lp_maxhp);
				
				// S wins, LP loses
				if(lp_currhp <= 0) {
					clearInterval(fight_interval);
					lp_stats[3] = 0;
					bool_lp_alive = false;
					bool_fighting = false;
					$( "#dialogue" ).prepend("> Your lesson plan failed to teach. </br>")
					$( "#bttn_fight" ).removeClass("disabled");
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
	localStorage['utepgame_save15'] = btoa(JSON.stringify(player));
}
 
function load_game() {
	// No save data, new game!
    if (!localStorage['utepgame_save15']){
    	$( "#dialogue" ).html("> <b>Welcome to Orientation Week of UTEP! </b>");
    	setTimeout(function() {
    		$( "#dialogue" ).prepend("> Hmm...Looks like you have a lot of learning to do... </br>");
    		setTimeout(function() {
    			$( "#dialogue" ).prepend("> Let's get started. The key to teaching and learning is reflecting! </br>");
                $( "#reflections_box" ).css("visibility", "visible");
                player.revealed.push("#reflections_box");
    		}, 2000);
    	}, 2000);
    	
    	return;
    }
 	var save_data = JSON.parse(atob(localStorage['utepgame_save15']));
 	player = save_data;
}

/* ======================================================
 *  LAUNCH GAME
 * ======================================================
 */
load_game(); //attempt to load the game
reveal_hidden();
$( "#" + player.map + "_" + player.day).addClass("current-day");
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

// Saves game every few seconds
//setInterval(function () { save_game(); }, 5000);
