
//EventHandler.js


//*************** Event Handler Meta-Closure *******************

//This closure I call a meta-closure, because it takes a function reference as an argument, and in turn, returns an inner
//function that executes the function specified in the closure argument. For the purpose of this documentation, the following
//abbreviations will be used:

//CRF : closure return function : the function that is actually returned by this closure as the event handler when it is
//	invoked

//USF : user supplied function : the function that the user supplies as the actual event handler to be executed, once the
//	CRF above is passed to an addEventListener() call.

//The USF is supplied, along with two other arguments, in an Exec object from the BasicSupport.js library. The protocol is
//as follows:

//newExec = new Exec();			//Generate a new Exec object
//newExec.setFunction(myFunction);	//"myFunction" is the actual function to be executed (the USF)

//args = [];				//Array that will contain the arguments for "myFunction"

//args.push(arg1);			//Do this repeatedly for as many arguments as you need, in the order in which
//args.push(arg2);			//they will appear in the invocation synopsis for "myFunction"
//args.push(arg3);
// ...
// ...

//newExec.setArguments(args);		//"args" is an array of arguments to be passed to "myFunction"
//newExec.setSelfObject(obj);		//"obj" is any object to be referred to using the "this" keyword
					//within the function "myFunction". A typical (though by no means
					//mandatory) choice for "obj" is the Element object to which the
					//event handler is being attached.

//Meanwhile, "myFunction" (the USF) is to be defined using the following invocation synopsis:

//function myFunction(event, arg1, arg2, arg3, ... )
// {
// ... function body goes here ...
// }

//Note the correspondence between the argument list and the push order of the "args" array above!

//Then, the protocol for generating the event handler is as follows (NOTE: the variable "myHandler" here MUST be a
//persistent variable, NOT a local variable within a function, UNLESS you're using the closure method of encapsulating
//your application to avoid cluttering the global namespace, in which case, "myHandler" should be provided as a variable
//within the closure):

//myHandler = EventMetaClosure(newExec);	//Pass the Exec object to the function, and it returns a function reference
						//suitable to be passed to addEventListener() etc

//Once that is done, then do this:

//domElement.addEventListener(eventType, myHandler, options);

//Later on, if the event handler needs to be removed, then simply do this:

//domElement.removeEventListener(eventType, myHandler);


//When the event is triggered on this DOM element, "myFunction" will be called within the event handler, and the arguments
//passed to it so that it can then process them as desired. A standard procedure that can be adopted, in order to make the
//DOM element available to "myFunction" through the "this" keyword, is to supply the DOM element object to "myFunction" within
//the Exec object as follows:

//newExec.setSelfObject(domElement);

//You now have a standard API for attaching any desired function, with any desired set of arguments, to a DOM element as an event
//handler that takes your desired arguments.

//SPECIAL NOTE: The original version generated an anonymous function as the event handler, but this does NOT work with the
//element.removeEventListener() JavaScript method! This revised version uses a named function instead, and this DOES work with
//the removeEventListener() method!



function EventMetaClosure(execObj)
{
var retVal = null;

var newExec = new Exec();

//The function below is the closure return function or CRF:

	function OuterEventClosure(event) {

		if (IsGenuineObject(execObj.arguments, Array))
		{
		//Here, build a NEW Exec object, with slightly modified properties derived from the Exec object
		//passed to the function ... which needs to be done, so that our event handlers can all have
		//"event" as the first argument, in conformity with the standard that applies to JavaScript
		//event handlers ...

			newExec.setFunction(execObj.getFunction());
			newExec.setArguments([event].concat(execObj.getArguments()));
			newExec.setSelfObject(execObj.getSelfObject());

			newExec.run();	//The USF is called by this method of the Exec object

		//End if
		}

	//End function
	}

retVal = OuterEventClosure;	//This is the reference to be passed to addEventListener() and removeEventListener()
				//as needed

return(retVal);	

//End closure
}


//NEW FOR VERSION 5C: EVENT HANDLER REGISTRATION

//So that the user doesn't have to perform manual storage of event handlers, the EventRegistry object is hereby provided to
//perform this task, and attach event listeners as desired to various DOM elements. It also allows for those event listeners
//to be CHANGED at some point in the future, at will.

function EventRegistryEntry()
{
this.descriptor = "";		//User supplied unique string describing the event handler
this.domElement = null;		//The DOM element to which the event listener is to be attached
this.eventType = "";		//Event type, e.g., "click"
this.listener = null;		//The actual event listener function object
this.options = null;		//Whatever options are to be passed to AddEventListener() etc

//End constructor
}


function EventRegistry()
{
this.entries = [];
this.entryCount = 0;

//End constructor
}


//Method to find an EventRegistryEntry in the EventRegistry using the descriptor
//If a matching entry is found, return the EventRegistryObject in question, NULL otherwise

//NOTE: NOT to be called by user code!

EventRegistry.prototype.findEntry = function(desc) {

var i=0;
var entry = null;
var done = false;

if (this.entryCount == 0)

	return(null);

else
{
	while (!done)
	{
		entry = this.entries[i++];

		if (entry.descriptor == desc)

			done = true;

		else if (i >= this.entryCount)
		{
			entry = null;
			done = true;

		//End if/else
		}

	//End while
	}

//End if/else
}

return(entry);

//End method
};


//Method to register an event handler and attach it to a DOM element. Can also be used to change the event handler
//attached to the DOM element, if an existing one associated with the descriptor exists.

//Method arguments:

//desc		: string descriptor associated with this event handler. MUST be unique!
//de		: reference to DOM Element object for the HTML DOM element to which the listener is to be attached
//eType		: string containing the event type, e.g., "click". WARNING!!! ALL EVENT TYPE STRINGS ***MUST*** BE
//		  ALL LOWER CASE, OR ELSE THE EVENT HANDLER WILL NOT FIRE!!!!
//func		: reference to the function that will actually handle the event
//args		: array of arguments to be passed to the function above, in conformity with the requirements for
//			EventMetaClosure() above
//sObj		: reference to the object that will be referred to using the "this" keyword within the event handler function
//			above, in conformity with the requirements for EventMetaClosure() above
//opts		: whatever useCapture parameter for addEventListener() is desired to be associated with this event listener


EventRegistry.prototype.registerEventHandler = function(desc, de, eType, func, args, sObj, opts) {

var entry = this.findEntry(desc);
var eObj = new Exec();
var handler = null;

if (entry === null)
{
//Here, we're registering a new event handler. Create a new EventRegistryEntry object, and set the descriptor ...

	entry = new EventRegistryEntry();

	entry.descriptor = desc;

//Insert the new entry into the Event Registry ...

	this.entries.push(entry);
	this.entryCount = this.entries.length;

//End if
}

//Populate the entry with the new data, whether it's a freshly created one above, or an existing one ...

entry.domElement = de;
entry.eventType = eType.toLowerCase();	//Force this in case user supplies the wrong case!
entry.options = opts;

eObj.funcRef = func;
eObj.arguments = args;
eObj.selfObject = sObj;

handler = EventMetaClosure(eObj);

entry.listener = handler;

de.addEventListener(eType, handler, opts);

//End method
};


//Method to unregister an event handler associated with a descriptor ...

EventRegistry.prototype.unregisterEventHandler = function(desc) {

var entry = this.findEntry(desc);
var de = null;
var listener = null;
var opts = null;
var eType = "";

var idx = 0;
var done = false;
var discard = null;

if (IsGenuineObject(entry, EventRegistryEntry)) //Only execute the following if we have a valid entry ...
{
	de = entry.domElement;
	listener = entry.listener;
	opts = entry.options;
	eType = entry.eventType;

//Remove the event listener from the DOM element ...

	de.removeEventListener(eType, listener, opts);

//Now destroy the registry entry ...

	done = false
	while (!done)
	{
		entry = this.entries[idx];
		if (entry.descriptor == desc)
		{
			discard = this.entries.splice(idx, 1);
			this.entryCount = this.entries.length;
			done = true;

		}
		else
		{
			idx++;
			done = !(idx < this.entryCount);

		//End if/else
		}

	//End while
	}

//End if
}

//End method
};


