var canvas;
var ctx;
var fps = 16;
var keys = [];
var ss = new Image();
var back = new Image();
var pos = [];
var vel = [];
var acc = [];
var current = [];
var animations = [];
var gravity = -10;
var world_scale = 30; // pixel/meter
var mass = 2000;
var speed = 2;// m/s
var jump = 4;
var thrust = 26000;
var scale = 2;
var level = 30;

function clear()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loadScene()
{
	ss.src = "dragoon.png";
	
	pos.x = 0;
	pos.y = 0;
	vel.x = 0;
	vel.y = 0;
	acc.x = 0;
	acc.y = 0;
	
	current.animation = "walk_right";
	current.frame = 0;
	current.direction = "right";
	current.elapsed = 0;

	addAnimation(       "walk_right",   1,   1, 53, 53, 26, 26, 26, 3, 8,  80, false);
	addAnimation(        "walk_left",   1,  57, 53, 53, 26, 26, 26, 3, 8,  80, true);
	addAnimation("jet_descend_right",   1, 113, 53, 53, 26, 26, 26, 3, 2, 120, false);
	addAnimation( "jet_ascend_right", 169, 113, 53, 53, 26, 26, 26, 3, 1, 300, false);
	addAnimation( "jet_descend_left", 169, 169, 53, 53, 26, 26, 26, 3, 2, 120, false);
	addAnimation(  "jet_ascend_left",   1, 169, 53, 53, 26, 26, 26, 3, 1, 300, true);
	
	height = 26;
	
	back.src = "galeon.png";
}

function addAnimation(name, sx, sy, width, height, cx, cy, ch, margin, count, frame_duration, reverse)
{
	var x = sx;
	var y = sy;

	animations[name] = [];
	animations[name].frames = [];
	
	for(i = 0; i < count; i++)
	{
		animations[name].frames[i] = [];
		animations[name].frames[i].x = x;
		animations[name].frames[i].y = y;
		animations[name].width = width;
		animations[name].height = height;
		animations[name].cx = cx;
		animations[name].cy = cy;
	    animations[name].frame_duration = frame_duration;
		animations[name].frame_count = count;
		animations[name].ch = height;
		
		x += width + margin;
	}
	
	if(reverse)
		animations[name].frames.reverse();
}

function update(sec, ms)
{
	current.prev_animation = current.animation;
	current.idle = false;
	
	acc.x = 0;
	acc.y = 0;
	
	var ground = pos.y <= 0;
	
	if(keys["right"])
	{
		current.direction = "right";
	}
	else if(keys["left"])
	{
		current.direction = "left";
	}
	
	if(ground)
	{
		if(keys["right"])
		{
			current.animation = "walk_right";
			vel.x = speed;
			current.idle = false;
		}
		else if(keys["left"])
		{
			current.animation = "walk_left";
			vel.x = -speed;
			current.idle = false;
		}
		else
		{
			vel.x = 0;
			current.idle = true;
		}
		
		if(keys["up"])
		{
			current.animation = "walk_" + current.direction;
			vel.y = jump;
			ground = false;
			current.idle = false;
		}
		
		if(keys["space"])
		{
			current.animation = "jet_ascend_" + current.direction;
			vel.y = jump;
			acc.y += thrust / mass;
			ground = false;
			current.idle = false;
		}
	}
	else
	{
		if(keys["space"])
		{
			acc.y += thrust / mass;
			ground = false;
			
			if(keys["right"])
			{
				acc.x = thrust / mass;
			}
			else if(keys["left"])
			{
				acc.x = -thrust / mass;
			}	

			if(vel.y > 0)
			{
				current.animation = "jet_ascend_" + current.direction;
			}
			else
			{
				current.animation = "jet_descend_" + current.direction;
			}			
		}
		else
		{
			if(keys["up"])
			{
				current.animation = "walk_" + current.direction;
				current.idle = false;
			}	
			else
			{
				current.animation = "walk_" + current.direction;
				current.idle = true;
			}	
		}
	}
	
	acc.y += gravity;
	
	vel.x += acc.x * sec;
	vel.y += acc.y * sec;

	pos.x += vel.x * sec;
	pos.y += vel.y * sec;
	 
	if(ground)
	{
		vel.y = 0;
		pos.y = 0;
		current.animation = "walk_" + current.direction;
	}
	
	if(current.prev_animation != current.animation)
	{
		current.elapsed = 0;
		current.frame = 0;
	}

	if(!current.idle)
		updateAnimation(ms);
}

function updateAnimation(ms)
{
	var a = animations[current.animation];	
	current.elapsed += ms;
	
	while(current.elapsed >= a.frame_duration)
	{
		current.elapsed -= a.frame_duration;
		current.frame = (current.frame + 1) % a.frame_count;
	}
}

function drawBackground()
{
	ctx.fillStyle = "#0F0F0F";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.scale(scale, scale);
	ctx.translate(0, canvas.height / scale - 122 - level);
	ctx.drawImage(back, 0, 0);
}

function drawCharacter()
{
	var a = animations[current.animation];
	var f = a.frames[current.frame];
	var px, py;

	ctx.scale(scale, scale);
	px = pos.x * world_scale;
	py = (canvas.height) / scale - a.ch - pos.y * world_scale;
	
	if(px > canvas.width / scale - a.cx)
	{
		px = canvas.width / scale - a.cx;
		pos.x = ((canvas.width / scale)- a.cx) / world_scale;
		vel.x = 0;
	}
	
	if(px < -a.cx)
	{
		px = -a.cx;
		pos.x = -a.cx / world_scale;
		vel.x = 0;
	}	
	
	if(py < -a.cy + level)
	{
		py = -a.cy + level;
		pos.y = -(py - canvas.height / scale + a.ch) / world_scale;
		vel.y = 0;
	}
	
	py -= level;

	ctx.drawImage(
		ss,
		f.x,
		f.y,
		a.width,
		a.height,
		px,
		py,
		a.width,
		a.height);
}

function onKeyDown(key)
{
	switch(key.keyCode)
	{
		case 38: //up
			keys["up"] = true;
		break;
		
		case 40: //down
			keys["down"] = true;
		break;
		
		case 37: //left
			keys["left"] = true;
		break;
		
		case 39: //right
			keys["right"] = true;
		break;
		
		case 32: //space
			keys["space"] = true;
		break;
		
		case 17: //ctrl
			keys["ctrl"] = true;
		break;
	};
}

function onKeyUp(key)
{
	switch(key.keyCode)
	{
		case 38: //up
			keys["up"] = false;
		break;
		
		case 40: //down
			keys["down"] = false;
		break;
		
		case 37: //left
			keys["left"] = false;
		break;
		
		case 39: //right
			keys["right"] = false;
		break;
		
		case 32: //space
			keys["space"] = false;
		break;
		
		case 17: //ctrl
			keys["ctrl"] = false;
		break;		
	};
}

function onResize()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function draw()
{
	ctx.save();
	drawBackground();
	ctx.restore();
	
	ctx.save();
	drawCharacter();
	ctx.restore();
}

function gameLoop(ms)
{
	ctx.imageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	
	clear();
	update(ms * .001, ms);
	draw();
}

function init()
{
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	window.addEventListener("keydown", onKeyDown, true);
	window.addEventListener("keyup", onKeyUp, true);
	window.addEventListener("resize", onResize, false);

    onResize();
	loadScene();
    
	loop = setInterval(function(){gameLoop(fps);}, fps);
}