
//main.js

function GlobalVariables()
{
this.Dialogues = [];
this.EventRegistry = null;

//End "constructor"
}



//**************************** EVENT HANDLERS ****************************


//Pop up the event dialogue

function DoAboutMe(event, g)
{
dlg = document.getElementById("bio_popup");

ActivateDialogue(dlg, g.Dialogues);

//End event handler
}

//Dismiss the dialogue when the user clicks on the "Dismiss" button ...

function DismissBio(event, g)
{
DeactivateTopDialogue(g.Dialogues);

//End event handler
}



function init(g)
{
g.EventRegistry = new EventRegistry();

desc = "About Me Button Click Handler";
de = document.getElementById("about_me");
eType = "click";
func = DoAboutMe;
args = [g];
sObj = null;
opts = {
		capture : true,
		passive : true
	};

g.EventRegistry.registerEventHandler(desc, de, eType, func, args, sObj, opts);


desc = "About Me Dialogue Dismiss Button Click Handler";
de = document.getElementById("dismiss");
eType = "click";
func = DismissBio;
args = [g];
sObj = null;
opts = {
		capture : true,
		passive : true
	};

g.EventRegistry.registerEventHandler(desc, de, eType, func, args, sObj, opts);

//End function
}

GLOBALS = new GlobalVariables();

init(GLOBALS);