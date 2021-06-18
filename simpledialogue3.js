

//SimpleDialogue2.js


//Dialogue handling constructor

function ActiveDialogue(objRef)
{
this.dialogueDIV = objRef;		//DIV element object found via document.getElementById()
this.zIndex = 6;			//Provisional z-index

//End constructor
}


//Function to activate a given dialogue & add it to the active dialogue array ...
//Arguments:

//objRef: reference to the DIV element containing the dialogue
//dlgArray : reference to the array within which the current list of active dialogues is stored

function ActivateDialogue(objRef, dlgArray)
{
var prevDlg = null;
var prevIndex = -1;

//If there is a previous entry in the dialogue array, disable it ...

prevIndex = dlgArray.length;

if (prevIndex > 0)
{
	prevDlg = dlgArray[prevIndex - 1];
	prevDlg.dialogueDIV.disabled = true;

//End if
}

//Now add the new dialogue to the dialogue array, and launch it ...

var newD = new ActiveDialogue(objRef);			//create new active dialogue object
var numActive = dlgArray.length;			//Find out how many active dialogues there are BEFORE adding the new
							//one to the list

//dlgArray[numActive] = newD;				//Append new one to end of array

dlgArray.push(newD);					//Append new one to end of array

//If there already exist active dialogues in the list, make sure this one is rendered on top of the others, and that the
//dialogue immediately preceding this one is diabled completely ...

if (numActive !== 0)
{
	newD.zIndex = (dlgArray[numActive-1].zIndex + 1);
	objRef.style.zIndex = newD.zIndex.toString().trim();
}
else

	objRef.style.zIndex = newD.zIndex.toString().trim();

objRef.style.display = "block";

//End function
}


//function to deactivate the topmost dialogue in the dialogue array ...

function DeactivateTopDialogue(dlgArray)
{
var numActive = dlgArray.length;

if (numActive > 0)	//Only do this if there are actually any dialogues in the active list!
{
	dlgArray[numActive-1].dialogueDIV.style.display = "none";
	dlgArray.splice(numActive-1, 1);
	numActive = dlgArray.length;

	if (numActive > 0)
		dlgArray[numActive-1].dialogueDIV.disabled = false;	//Re-enable previous dialogue

//End if
}

//End function
}


//Function to handle the "cancel" option for a dialogue, to be invoked as an event handler for the "cancel" button
//in question on the dialogue. Takes as arguments the following:

//event		: whatever Event object is passed to the event handler by the JavaScript event system

//dlgArray	: reference to the array containing the ActiveDialogue objects for the currently extant dialogues on the web page

//cExec		: initialised Exec object from BasicSupport.js, or NULL if no function needs to be supplied.

function DoDialogueCancel(event, dlgArray, cExec)
{
//First, dismiss the dialogue ...

DeactivateTopDialogue(dlgArray);

//Now, execute whatever cancel function has been supplied, if one has been supplied ...

if (IsGenuineObject(cExec, Exec))
{
	cExec.run();

//End if
}

//End event handler
}


//Validator constants object

function ValidatorConstants()
{
this.VC_SUCCESS = 0;			//Signal data validation succeeded
this.VC_SUCCESSANDDISMISS = 1;		//Signal data validation succeeded, AND dismiss the dialogue
this.VC_FAIL = 2;			//Signal data validation failed
this.VC_FAILANDDMISMISS = 3;		//Signal data validation failed, AND dismiss the dialogue

//End constructor
}


//ValidatorResult object

function ValidatorResult()
{
this.exitStatus = -1;
this.userData = null;

//End constructor
}



//Function to handle the "commit" option for a dialogue, to be invoked as an event handler for the "commit" button
//in question on the dialogue.

//Takes the following arguments:

//event		: whatever Event object is passed to the event handler by the JavaScript event system

//dlgArray	: reference to the array containing the ActiveDialogue objects for the currently extant dialogues on the web page

//vExec		: Initialised Exec object corresponding to a validator function, to validate data on the dialogue. The user
//		  supplied function in question MUST return a ValidatorResult object (see above), and the exitStatus property
//		  of the ValldatorResult object MUST be set to one of the ValidatorConstants given above, according to the action
//		  to be taken in each instance.

//		  If no validator function is required in the application design, supply NULL for this argument.

//		  Note that the userData entry of the ValidatorResult object is provided, so that a validator function can return
//		  in addition, an object containing data to be used after the invocation of the validator function elsewhere.

//sExec		: initialised Exec object corresponding to the function to be executed, if the validator returns with a successful
//		  data validation completed. Set this argument to NULL if no such function is needed.

//fExec		: initialised Exec object corresponding to the function to be executed, if the validator returns with a failed
//		  data validation. Set this argument to NULL if no such function is needed.

//passTo	: set to TRUE if the ValidatorResult object is to be passed to the failure function specified in fExec above,
//		  set to FALSE if this is not required. NOTE: this argument MUST be set to false, if the vExec argument is set
//		  to NULL!!!!


function DoDialogueCommit(event, dlgArray, vExec, sExec, fExec, passTo)
{
var c = new ValidatorConstants();		//get our Validator constants

var result = null;				//ValidatorResult object returned by validator function goes here

var newArgs = null;

var tmpArgs = null;

if (IsGenuineObject(vExec, Exec))			//Do we have an actual validator function to run?
{
//Here, we have a genuine Exec object for the Validator function. We now run that function ...

	result = vExec.runWithReturn();		//Execute the validator function if so

}
else
{
//Otherwise, if there is no validator function to run, generate a default ValidatorResult object for what follows ...

	result = new ValidatorResult();
	result.exitStatus = c.VC_SUCCESSANDDISMISS;

//End if/else
}

//Here, we check the passTo variable, to see if the ValidatorResult object generated above is to be appended to the argument
//list for the failure function. If so, we append that argument to the list ...

if (passTo)
{
	tmpArgs = fExec.getArguments();		//Get failure function argument list
	
	tmpArgs = tmpArgs.concat([result]);	//Append the validator result to the argument list

	fExec.setArguments(tmpArgs);		//And change the argument list for the failure function prior to launch

//End if
}

//Now, run either the success or failure functions, according to the result contained in the ValidatorResult ...

switch(result.exitStatus)
{
	case c.VC_SUCCESS :

		if (IsGenuineObject(sExec, Exec))
		{
			sExec.run();

		//End if
		}

	break;

	case c.VC_SUCCESSANDDISMISS :

		DeactivateTopDialogue(dlgArray);

		if (IsGenuineObject(sExec, Exec))
		{
			sExec.run();

		//End if
		}

	break;

	case c.VC_FAIL :

		if (IsGenuineObject(fExec, Exec))
		{
			fExec.run();

		//End if
		}

	break;

	case c.VC_FAILANDDISMISS :

		DeactivateTopDialogue(dlgArray);

		if (IsGenuineObject(fExec, Exec))
		{
			fExec.run();

		//End if
		}

	break;

//End switch
}

//End event handler
}


//End code


