
//BasicSupport.js


//Function to test if a purported object reference is indeed a valid reference to the desired object, provided
//of course that the object was generated via a constructor.

// objRef : the reference to test
// cons : reference to the constructor being tested against

function IsGenuineObject(objRef, cons)
{
var tInfo = typeof objRef;		//Find what type of operand 'objRef' is ... anything other than an object
					//and we return false ...

//SPECIAL NOTE: in order to trap comparisons with functions correctly, we have to take some special steps, as follows:

if (tInfo == "function")
{
	return (objRef instanceof cons);
}
else if (tInfo != "object")
{
	return false;
}
else
{
//If we get here, then we check to see if what we now know to be an object, is indeed an instance of the constructor
//in question ...

	return (objRef instanceof cons);

//End if/else
}

//End function
}


//Function to provide an enum capability when defining constants ...

//Arguments:

//val		: value to increment to generate the next value
//step		: increment size (if omitted, defaults to 1)

function Enum(val, step)
{
var ret = val;
var incr = 1;

if ((step !== undefined) && (step !== null) && ((typeof step) == "number"))

	incr = step;

ret += incr;

return(ret);

//End function
}


//Exec object

//This object provides a single point of reference, containing all the data required to execute a function
//with a complete set of arguments, and a well-defined object defined as the referent for the "this" keyword.

function Exec()
{
this.funcRef = null;
this.selfObject = null;
this.arguments = null;

//End constructor
}


//Method to set the function for the Exec object

Exec.prototype.setFunction = function(funcObject) {

this.funcRef = funcObject;

//End method
};


//Method to set the object accessible via the "this" keyword within the function specified via the setFunction() method
//above (NOTE: null is allowed, if no such object is required!)

Exec.prototype.setSelfObject = function(sObj) {

this.selfObject = sObj;

//End method
};


//Method to set the arguments to be passed to the function specified via the setFunction() method above. Arguments are to
//be contained in an array.

Exec.prototype.setArguments = function(args) {

this.arguments = args;

//End method
};


//Method to get the function reference currently attached to the Exec object

Exec.prototype.getFunction = function() {

return(this.funcRef);

//End method
};


//Method to get the argument list currently attached to the Exec object

Exec.prototype.getArguments = function() {

return(this.arguments);

//End method
};


//Method to get the selfObject reference currently attached to the Exec object

Exec.prototype.getSelfObject = function() {

return(this.selfObject);

//End method
};


//Method to clone the Exec object ...

Exec.prototype.clone = function() {

var newExec = new Exec();

newExec.setFunction(this.getFunction());
newExec.setArguments(this.getArguments());
newExec.setSelfObject(this.getSelfObject());

return(newExec);

//End method
};


//Method to run the function specified via setFunction() above, using the arguments and self object supplied

Exec.prototype.run = function() {

if (IsGenuineObject(this.funcRef, Function))	//Only attempt to run the function if a genuine function object has been supplied
{
	if (IsGenuineObject(this.arguments, Array))	//are the arguments contained in a genuine Array object?
	{
		this.funcRef.apply(this.selfObject, this.arguments);

	//End if
	}

//End if
}

//End method
};


//Method to run the function specified via setFunction() above, using the arguments and self object supplied, and
//return a return value from the function specified. If the Exec object is not initialised properly, then this
//method returns the value "undefined".

Exec.prototype.runWithReturn = function() {

var retVal = null;

if (IsGenuineObject(this.funcRef, Function))	//Only attempt to run the function if a genuine function object has been supplied
{
	if (IsGenuineObject(this.arguments, Array))	//are the argumnents contained in a genuine Array object?
	{
		retVal = this.funcRef.apply(this.selfObject, this.arguments);

	}
	else
	{
		retVal = undefined;

	//End if/else
	}

}
else
{
	retVal = undefined;

//End if/else
}

return(retVal);

//End method
};


//Printf type function, to allow insertion of variables into a prepared text

//Returns a ResultObject taking the following format:

// {
//	status : 0,	//Contains an error code - see PrintfConstants below
//	output : ""	//If no error, this contains the format string with the variables embedded therein
// };


//Printf constants

function PrintfConstants()
{
this.PF_SUCCESS = 0;			//signals operation successful
this.PF_FORMATTYPEERROR = 1;		//first argument (format string) is not of string type
this.PF_WRONGARGCOUNT = 2;		//number of arguments doesn't match number of specifiers
this.PF_NOARGS = 3;			//no arguments supplied
this.PF_ILLEGALSPECIFIER = 4;		//illegal specifier character
this.PF_ARGMISMATCH = 5;		//mismatched string data to numeric specifier or vice versa


this.PF_UNSET = -1;			//Specifies that a certain value is not set validly

//End constructor
}


//PrintF MatchEntry object constructor

function PrintfMatchEntry(spec, pos)
{
var c = new PrintfConstants();

this.specifier = spec;
this.position = pos;

this.intDigits = c.PF_UNSET;
this.fracDigits = c.PF_UNSET;

this.stringStart = c.PF_UNSET;
this.stringEnd = c.PF_UNSET;

this.dataToFormat = null;
this.formattedData = "";

//End constructor
}

//Field data filler for the PrintfMatchEntry object

PrintfMatchEntry.prototype.fillRequiredData = function() {

var c = new PrintfConstants();

var specID = "";
var details = "";
var firstVal = 0;
var secondVal = 0;
var sifter = 0;
var dotPos = -1;
var intString = "";
var fracString = "";

//First step: find out what specifier we're using ...

specID = this.specifier.substr(0,2);
details = this.specifier.substr(2);

dotPos = details.indexOf(".");

if (dotPos == -1)	//No "." found
{
//Here, we only have a single number in the specifier, and we extract it accordingly ...

	if (details == "")
		firstVal = c.PF_UNSET;
	else
		firstVal = parseInt(details);

	secondVal = c.PF_UNSET;

}
else
{
//Here, we need to check if there are two values. 

	if (dotPos == 0)
	{
	//If the first character is a ".", then we only have one value, and we mark firstVal
	//as unset ...

		firstVal = c.PF_UNSET;
		secondVal = parseInt(details.substr(1));

	}
	else
	{
	//Here, we genuinely have two values to extract. Separate out the integer and fractional parts ...

		intString = details.substr(0, dotPos);
		fracString = details.substr(dotPos + 1);

		firstVal = parseInt(intString);
		secondVal = parseInt(fracString);

	//End if/else
	}

//End if/else
}

//Now, we condition the variables, based upon the specifier ...

switch(specID)
{
	case "%s" :

		if (firstVal == c.PF_UNSET)
			firstVal = 0;

		this.stringStart = firstVal;
		this.stringEnd = secondVal;

	break;

	case "%d" :

		if (firstVal == c.PF_UNSET)
			firstVal = 6;		//Default is 6 integer digits

		if (secondVal == c.PF_UNSET)
			secondVal = 0;		//Default is 0 fractional digits

		this.intDigits = firstVal;
		this.fracDigits = secondVal;

	break;

//End switch
}

//End method
};


//Method to generate formatted data, once the requisite parameters are known ...

PrintfMatchEntry.prototype.makeFormattedData = function() {

var c = new PrintfConstants();

var specID = this.specifier.substr(0,2);	//Get the "%x" part of the specifier
var data = this.dataToFormat;
var dString = "";

var intVal = 0;
var fracVal = 0;

var intString = "";
var fracString = "";

var fracTail = "000000000000000000000000000000";	//30 zeros should be enough!
var intHead = "                              ";		//30 spaces should be enough!

var diff = 0;

switch(specID)
{
	case "%s" :

		if (this.stringEnd != c.PF_UNSET)
		{
		//Here, we've specified a string length, so truncate the string accordingly ...

			dString = data.substr(this.stringStart, this.stringEnd);
		}
		else
		{
		//Here, we haven't specified a string length, so we extract from the specified start
		//to the end of the string ...

			dString = data.substr(this.stringStart);

		//End if/else
		}

	break;

	case "%f" :

		dString = data.toString();	//Simply render the number "as is" for floats

	break;

	case "%i" :

		dString = Math.floor(data).toString();	//Render the number as an integer

	break;

	case "%d" :

		//First get the integer and fractional parts of the number ...

		intVal = Math.floor(data);
		fracVal = data - intVal;

		fracString = (fracVal.toString() + fracTail).substr(1, this.fracDigits + 1);	//Omit the leading zero
		intString = intVal.toString();

		diff = this.intDigits - intString.length;

		if (diff > 0)
		{
			intString = intHead.substr(0, diff) + intString;
		}

		dString = intString + fracString;

	break;

//End switch
}
return(dString);

//End method
};



//The printf function searches a format string for specifiers, which specify how data is to be inserted into the string
//at that point, and formatted. The specifiers are:

//[1] %i	: data is to be treated as an integer, and simply inserted into the string using:

//		  value.floor().toString().trim();

//		  Non-integer data will be truncated to integer values.

//[2] %f	: data is treated as floating-point data, and simply inserted into the string using:

//		  value.toString().trim();

//		  Where data in floating point format is large or small enough to require scientific notation, for the
//		  moment the standard output of number.toString() is used. This ***MAY*** change in future implementations
//		  that take account of HTML's ability to format exponents naturally using superscripts. Alternatively, a
//		  new specifier may be introduced to force this format to be used explicitly.

//[3] %d	: data is to be treated as a decimal formatted number, using the protocol:

//		  %dm.n

//		  where m is the number of integer digits to use, and n is the number of fractional digits to use. The
//		  ".n" part is optional, and if absent, is treated as equivalent to ".0". If the "m.n" argument is omitted,
//		  this is treated as being equivalent to "10.2".

//[4] %s	: data is to be treated as a string, using the protocol:

//		  %sm.n

//		  where m is the starting position of the string data to begin insertion, and n is the length of the substring
//		  to be selected for insertion into the format string. Examples:

//		  %s		: Simply insert the entire string data into the format string at this point

//		  %s3		: Extract from the string data, the substring beginning at character position 3
//				  (remembering of course that JavaScript string methods treat the first character
//				  as occupying position 0!), and continuing to the end of the string. Insert that
//				  extracted string into the format string.

//		  %s3.7		: Extract from the string data, the substring beginning at character position 3,
//				  that is a total of 7 characters in length, and insert that substring into the
//				  format string.

//		  %s.7		: Equivalent to %s0.7.

//IMPORTANT NOTE! If you need a full stop "." to appear in your format string IMMEDIATELY AFTER a formatted output
//involving %s or %d, then to avoid clashes with the "." character in the specifier, you MUST provide a full %sx.y
//or %dx.y formatting specifier, so that the parser does not become confused! This does NOT apply to %f or %i, of
//course, as these specifiers do not take field length parameters!



function printf()
{
var c = new PrintfConstants();

var argc = arguments.length;
var specifiers = [];
var fmtString = "";
var newString = "";
var idx = 0;
var done = false;
var found = -1;
var specChar = "";
var specDetails = null;
var legal = false;


var result = {
		"status" : c.PF_SUCCESS,
		"result" : null
		};

var resI = null;
var resF = null;
var resS = null;
var resD = null;

var resI_pat = null;
var resF_pat = null;
var resS_pat = null;
var resD_pat = null;

//First, check to see if there are any actual arguments to process ...

if (argc == 0)
{
	result.status = c.PF_NOARGS;
	return(result);

}

//If we reach here, then we have at least one argument. Now check to see if the first argument is a string ...

if (typeof arguments[0] != "string")	//exit with error if the first argument isn't a string
{
	result.status = c.PF_FORMATTYPEERROR;
	return(result);

}

//Here, we have something purporting to be a format string. Now we search through the string, to see if it
//has any %s, %i, %f, %d specifiers etc, and insert them into an array in string position order. We set up
//four arrays for each of the RegExp searches to be performed, which will be populated by RegExp.exec() on
//each loop iteration, based upon the regular expressions passed thereto. We also create a global array to
//store all the results, which will eventually contain all the found specifiers in string position order.

fmtString = arguments[0];		//Our format string containing our specifiers

resI = [];	//regular expression search results for %i specifiers
resF = [];	//regular expression search results for %f specifiers
resS = [];	//regular expression search results for %s specifiers
resD = [];	//regular expression search results for %d specifiers

resI_pat = /\x25i/g;
resF_pat = /\x25f/g;
resS_pat = /\x25s\d+?\x2e\d+?|\x25s\x2e\d+?|\x25s\d+?|\x25s/g;
resD_pat = /\x25d\d+?\x2e\d+?|\x25d\x2e\d+?|\x25d\d+?|\x25d/g;

specArray = [];	//Array containing all the specifiers, which at the end will be sorted in string position order

exiting = false;

done = false;

while (!done)
{
	if (resI !== null)	//Only continue searching if a prevous match returned a valid match result
	{
		resI = resI_pat.exec(fmtString);

		if (resI !== null)	//Only process the result if a valid match was returned ...
		{
		//Here, we create an array entry for the match, that contains the format specifier found,
		//the string position in the format string where it was found, and then use this information
		//to fill in other fields ...

			entry = new PrintfMatchEntry(resI[0], resI.index);
			entry.fillRequiredData();

			specArray.push(entry);

		//End if
		}

	//End if
	}

	if (resF !== null)	//Only continue searching if a prevous match returned a valid match result
	{
		resF = resF_pat.exec(fmtString);

		if (resF !== null)	//Only process the result if a valid match was returned ...
		{
		//Here, we create an array entry for the match, that contains the format specifier found,
		//the string position in the format string where it was found, and then use this information
		//to fill in other fields ...

			entry = new PrintfMatchEntry(resF[0], resF.index);
			entry.fillRequiredData();

			specArray.push(entry);

		//End if
		}

	//End if
	}

	if (resS !== null)	//Only continue searching if a prevous match returned a valid match result
	{
		resS = resS_pat.exec(fmtString);

		if (resS !== null)	//Only process the result if a valid match was returned ...
		{
		//Here, we create an array entry for the match, that contains the format specifier found,
		//the string position in the format string where it was found, and then use this information
		//to fill in other fields ...

			entry = new PrintfMatchEntry(resS[0], resS.index);
			entry.fillRequiredData();

			specArray.push(entry);

		//End if
		}

	//End if
	}

	if (resD !== null)	//Only continue searching if a prevous match returned a valid match result
	{
		resD = resD_pat.exec(fmtString);

		if (resD !== null)	//Only process the result if a valid match was returned ...
		{
		//Here, we create an array entry for the match, that contains the format specifier found,
		//the string position in the format string where it was found, and then use this information
		//to fill in other fields ...

			entry = new PrintfMatchEntry(resD[0], resD.index);
			entry.fillRequiredData();

			specArray.push(entry);

		//End if
		}

	//End if
	}

	//Here, we check for a termination condition ...

	exiting = true;

	if (resI !== null)
		exiting = false;

	if (resF !== null)
		exiting = false;

	if (resS !== null)
		exiting = false;

	if (resD !== null)
		exiting = false;

	done = exiting;

//End while
}

//Now that we have our specifiers handily extracted, we now check to see if the number of specifiers in the format
//string matches the number of data arguments provided ...

if (specArray.length != (argc - 1))
{
	result.status = c.PF_WRONGARGCOUNT;
	return(result);

//End if
}

//If we reach here without an error exit, we need to sort our specifier array in string position order ...

specArray.sort(
		function(a, b)
		{
			return(a.position - b.position)
		}
);

//Now it's time to pair up our data arguments with our specifiers. Let us now do this ...

for (i=1; i<argc; i++)
{
	chk1 = typeof arguments[i];	//Find if we have a numeric or string type

	chk2 = specArray[i-1].specifier.substr(0,2);

	if ((chk1 == "number") && (chk2 == "%s"))	//Exit with error if passing number data to string specifier
	{
		result.status = c.PF_WRONGARGCOUNT;
		return(result);

	}

	if ((chk1 == "string") && (chk2 != "%s"))	//Exit with error if passing string data to number specifier
	{
		result.status = c.PF_WRONGARGCOUNT;
		return(result);

	}

	//Here, we have a legal data match, so perform the data pairing ...

	specArray[i-1].dataToFormat = arguments[i];

//End i loop
}
//If we come here without any errors, then we have matched data and specifiers, and we can now begin replacing the data.

newString = fmtString;

for (i=0; i<(argc -1); i++)
{
//Because our specifiers are now sorted in string position order in the format string, string.replace() should
//work properly, and replace everything in order from now on ...

	newString = newString.replace(specArray[i].specifier, specArray[i].makeFormattedData());


//End i loop
}
result.output = newString;

return(result);

//End function
}


//SetTimeout and SetInterval etc., helpers for functions with parameters ...

//Arguments for both functions:

//func			: function to be executed (object reference)
//parms			: array containing the arguments to be passed to the function
//selfObject	: reference to an object that is referred to using the "this" keyword within the function
//interval		: time in milliseconds before the function is executed (and then repeatedly executed in the case
//					of SetIntervalEx() below)

//NOTE: the function returns the setTimeout() handle from the standard JavaScript call, so that this can be used in aLinkcolor
//subsequent call to clearTimeout() if needed. No clearTimeout() helper function is needed for this.

//NOTE 2: setTimeout() and setInterval() appear not to work with anonymous functions! So, we're going to have to set up
//a closure to provide a named function ...

function SetTimeoutEx(func, parms, selfObject, interval)
{
var e = new Exec();
var ret = null;

	function SetTimeoutExRun()
	{
	e.run();
	
	//End function
	}

e.setFunction(func);
e.setArguments(parms);
e.setSelfObject(selfObject);

ret = window.setTimeout(SetTimeoutExRun, interval);

return(ret);
	
//End function
}


function SetIntervalEx(func, parms, selfObject, interval)
{
var e = new Exec();
var ret = null;

	function SetIntervalExRun()
	{
	e.run();
	
	//End function
	}
e.setFunction(func);
e.setArguments(parms);
e.setSelfObject(selfObject);

ret = window.setInterval(SetIntervalExRun, interval);

return(ret);
	
//End function
}




//Test codefs

function BSTest()
{
var fmtString = "";
var result = null;

var kilos = 20.3;
var pounds = 0;
var conFactor = 2.20462;

fmtString = "First Name : %s, Last Name : %s, All Good";

result = printf(fmtString, "John", "Smith");

console.log(result.output);

fmtString = "Time elapsed : %i seconds";

result = printf(fmtString, 37);

console.log(result.output);

fmtString = "Value of volume : %f litres";

result = printf(fmtString, 17.306);

console.log(result.output);

fmtString = "Cost : £%d4.2 per kilo";

result = printf(fmtString, 1.3);

console.log(result.output);

result = printf(fmtString, 72.56);

console.log(result.output);

fmtString = "Your choice of word is : %s0.4 ...";

result = printf(fmtString, "bandstand");

console.log(result.output);

fmtString = "Your choice of word is : %s.4 ...";

result = printf(fmtString, "bandstand");

console.log(result.output);

fmtString = "Your choice of word is : %s4 ...";

result = printf(fmtString, "bandstand");

console.log(result.output);

fmtString = "Your choice of word is : %s4.4 ...";

result = printf(fmtString, "bandstand");

console.log(result.output);

fmtString = "There are %d4.3 pounds in %d4.2 kilograms";

pounds = kilos * conFactor;

result = printf(fmtString, pounds, kilos);

console.log(result.output);


//End function
}

