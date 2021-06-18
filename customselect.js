

//CustomSelect.js


//The motivation for writing this code, and its associated API, is simple: I discovered that select controls DO NOT WORK PROPERLY
//on Android tablets (most importantly, my own)!

//The event handling on select controls in Chrome For Android is flaky to put it mildly. Events are triggered, but the proper
//value of the selectedIndex property is NOT returned after the first interaction with the select control! Instead, the value
//of the selectedIndex property lags behind the events that were triggered. Since click events don't work on option controls
//either on Chrome For Android, I've put together this alternative means of faking select controls, that [1] WILL handle the
//events properly, and [2] will work in any browser that supports properly click events on DIV or paragraph elements.

//SPECIAL NOTE: The BasicSupport.js libary MUST be loaded in advance, before loading this library!


//CustomSelectConstants object

function CustomSelectConstants()
{
this.CS_NOTYPESET = -1;
this.CS_LISTBOX = 0;
this.CS_COMBOBOX = 1;

this.CS_NOSELECTIONMADE = -1;

this.CSOP_SUCCESS = 0;		//return code for successful operation
this.CSOP_NOTOPTION = 1;	//return code for "argument not a valid CustomOption object" for CustomSelect.add() etc
this.CSOP_NOTINDEX = 2;		//return code for "argument not a valid index value" for CustomSelect.add() etc
this.CSOP_INDEXTYPEERROR = 3;	//return code for "argument type not numeric" for CustomSelect.add() etc
this.CSOP_NOTFOUND = 4;		//return code for "option not found" for CustomSelect.removeSpecifiedOption() etc
this.CSOP_BADCONTAINER = 5;	//return code for "not an appropriate DIV element" for CustomSelect.setContainer()
this.CSOP_WRONGTYPE = 6;	//return code for "invalid argument type" for CustomSelect.setType() etc
this.CSOP_WRONGVALUE = 7;	//return code for "invalid argument value" for CustomSelect.setType() etc
this.CSOP_NOELEMENT = 8;	//return code for "no DOM element" for CustomOption.setLabelClasses() etc
this.CSOP_NOTSELECT = 9;	//return code for "not a valid CustomSelect object" for CustomSelectList.append() etc

//End constructor
}



//CustomOption object.

//Sequence of events for using the CustomOption object:

//[1] Create the object:

//	var newOpt = new CustomOption();

//[2] Set the label:

//	newOpt.setLabel(text);

//[3] Set the value:

//	newOpt.setValue(value);

//[4] Add the option to the CustomSelect object's options collection, once the CustomSelect has been initialised
//	properly (see below):

//	newSelect.add(newOpt);

function CustomOption()
{
var c = new CustomSelectConstants();

this.optionDIV = document.createElement("div");		//DIV for the option
this.optionP = document.createElement("p");		//Paragraph DOM element for the option
							//(NOTE: click events are to be attached to this!)

this.optionP.style.boxSizing = "border-box";		//Ensure box sizing encapsulates EVERYTHING ...
this.optionP.style.marginTop = "0px";			//Remove top and bottom margins from the paragraph
this.optionP.style.marginBottom = "0px";		//element ...

this.labelText = "";	//Full text label for the option
this.displayText = "";	//Display text for the label (truncated from the labelText if needed)
this.value = "";		//Value to be returned by the option

this.index = -1;		//Index value in options collection of CustomSelect object to be copied to here

this.eventListener = null;	//Set to the event listener to be attached to the option's <p> element
this.eventFunction = null;	//Set the function to be launched upon receiving a click event here
this.eventSelect = null;	//Set to the CustomSelect object that this option is connected to for event handling

this.selected = false;		//Set to true when selected

//End constructor
}


//Method to set the label text for the CustomOption object ...

CustomOption.prototype.setLabel = function(sText) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if ((typeof sText) != "string")

	success = c.CSOP_WRONGTYPE;

else

	this.labelText = sText;

return(success);

//End method
};


//Method to set the value text for the CustomOption object ...

CustomOption.prototype.setValue = function(vText) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if ((typeof vText) != "string")

	success = c.CSOP_WRONGTYPE;

else

	this.value = vText;

return(success);

//End method
};


//Method to set class attributes to the CustomOption label

CustomOption.prototype.setLabelClasses = function(cText) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if ((typeof cText) != "string")

	success = c.CSOP_WRONGTYPE;

else

	if ((IsGenuineObject(this.optionP, Element)) && (this.optionP.tagName == "P"))

		this.optionP.className = cText;

	else

		success = c.CSOP_NOELEMENT;

return(success);

//End method
};


//Custom select object constructor.

//SPECIAL NOTE: BEFORE making use of the object, the type, title and container MUST be set, using the methods below!
//In addition, the container DIV *MUST* have the class attribute set to "CustomSelect", with appropriate styles set in
//the CSS file for the CustomSelect class!

//Sequence of events:

//[1] Create a CustomSelect object:

//	var cs = new CustomSelect("ChosenName");

//[2] Set the type:

//	var c = new CustomSelectConstants();
//	cs.setType(c.CS_LISTBOX);		//to set a list box
//	cs.setType(c.CS_COMBOBOX);		//to set a combo box

//[3] Set the title:

//	cs.setTitle("Select Option:");

//[4] Set the list size (i.e., how many options will be DISPLAYED when the options collection is visibly rendered, which
//	MAY differ from the actual number of options present in the list!)

//	cs.setListSize(chosenSize);

//[5] Set whatever classes are to be applied to the text label ...

//	cs.setlabelClasses(cText);

//[6] Set the container:

//	var myDiv = document.getElementById("MyDiv");
//	cs.setContainer(myDiv);

//CustomSelect object

function CustomSelect(chosenName)
{
var c = new CustomSelectConstants();

this.name = chosenName;

this.container = null;		//Set this to the DIV that will contain the CustomSelect object

this.selectDIV = document.createElement("div");		//Reference to DIV element to contain the CustomSelect title
this.selectP = document.createElement("p");;		//Reference to paragraph element to contain the CustomSelect title
this.optionsDIV = document.createElement("div");	//Reference to DIV element to contain the CustomSelect options
							//collection and its DIVs

this.selectP.style.boxSizing = "border-box";		//Ensure box sizing encapsulates EVERYTHING ...
this.selectP.style.marginTop = "0px";			//Remove top and bottom margins from the paragraph
this.selectP.style.marginBottom = "0px";		//element ...

this.headerClass = "";			//Set these entries to the class names that will be applied to the
this.collectionClass = "";		//CustomSelect header, the Options Collection DIV, and the individual
this.optionClass = "";			//options themselves
this.headerPClass = "";


this.type = c.CS_NOTYPESET;	//Initially, the CustomSelect object doesn't have a control type

this.title = "";		//Title to appear in the CustomSelect object when nothing is selected

this.altTitle = "Current Selection:";	//Appears intermittently to remind the user to select something

this.actualTitle = "";		//Actual title text that is displayed at any given moment


this.options = [];				//options collection for the CustomSelect object
this.selectedIndex = c.CS_NOSELECTIONMADE;	//selected index into options collection above

this.listSize = 0;		//No. of options displayed when the list box or combo box entries are made visible

this.listVisible = false;	//only used for combo boxes, to toggle the visibility state of the options collection

this.selectHeight = 0;		//Preserve these metrics once we know them!
this.selectWidth = 0;

this.headerWidth = 0;
this.headerHeight = 0;

this.collectionWidth = 0;
this.collectionHeight = 0;

this.internalEventFunction = null;

this.eventFunction = null;		//Set the function to be launched upon receiving a click event here

this.optionEventFunction = null;	//Set the function to be launched by the option click events here

//End constructor
}


//Method to set the class attributes to be applied to the CustomSelect control's elements, in order to customise
//the appearance thereof.

//Arguments:

//cClass : class name (string) that will be applied to the CustomSelect header DIV
//cpClass : class name (string) that will be applied to the CustomSelect header P element
//ocClass : class name (string) that will be applied to the Options Collection DIV
//optClass : class name (string) that will be applied to the individual options themselves

CustomSelect.prototype.setClasses = function(cClass, cpClass, ocClass, optClass) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if ((typeof cClass) != "string")

	success = c.CSOP_WRONGTYPE;

else if ((typeof cpClass) != "string")

	success = c.CSOP_WRONGTYPE;

else if ((typeof ocClass) != "string")

	success = c.CSOP_WRONGTYPE;

else if ((typeof optClass) != "string")

	success = c.CSOP_WRONGTYPE;

else
{
	this.headerClass = cClass;
	this.headerPClass = cpClass;
	this.collectionClass = ocClass;
	this.optionClass = optClass;

//End if/else
}

return(success);

//End method
};


//Method to set the list display size for the CustomSelect control. Argument is a border spec,
//such as "1px solid rgba(255, 255, 0, 1)"

CustomSelect.prototype.setListSize = function(chosenSize) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if ((typeof chosenSize) != "number")	//error if argument isn't a number

	success = c.CSOP_WRONGTYPE;

else if (chosenSize < 1)		//Error if argument less than 1

	success = c.CSOP_WRONGVALUE;

else if (chosenSize != Math.floor(chosenSize))	//Error if argument isn't an integer

	success = c.CSOP_WRONGVALUE;

else

	this.listSize = chosenSize;

return(success);


//End method
};


//Method to set the container for the CustomSelect control.

//SPECIAL NOTE: Although I set out with the intention of making this method resize the container DIV, and then conform all
//subsequent nested DIVs to the minimum box size required to contain the content without overflow, BIG problems arise when
//attempting to achieve this in one pass. These problems are:

//[1] An HTML element object does NOT have any geometrical dimension properties set correctly, UNTIL the element is attached
//	to the document's DOM tree, and rendered. Until then, object properties such as element.clientWidth all remain zero.

//[2] Likewise, trying to set the size properties of an element object, when the element is coupled to the CSS rule "display: none"
//	will fail for the same reason - the element is not being rendered.

//[3] Consequently, what is needed, is some means of rendering the elements in question, within the container, in such a manner
//	that the element dimensions are properly calculated. Then, the container DIV can be made fully visible and resized once
//	it is fully visible. BUT, if any OTHER operations intervene to affect the display status of the DIV whilst trying this,
//	then the attempt to resize the DIV will be fatally compromised. These operations include setting the display status of a
//	parent container to "display: none" as is frequently the case with dialogue boxes.

//[4] A second problem aises, in that if the container DIV we wish to resize, does NOT begin with size constraints applied, then
//	that DIV will expand to fill its container horizontally, and so will child elements attached thereto! So, we need to
//	constrain that DIV, make judicious use of the overflow CSS property to allow the child elements to expand to their full
//	extent, THEN resize the DIV once everything is in place!

//Therefore, the setContainer() method below must ONLY be invoked, when the ENTIRE collection of parent containers within which
//the chosen container DIV is nested, are themselves fully visible and enabled.

//However, since "visibility: hidden" does NOT stop rendering from allocating a bounding client rectangle to the element, we can
//use this to get our metrics!

CustomSelect.prototype.setContainer = function(cnt) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

var eClass = "";

var csDIV = this.selectDIV;
var csP = this.selectP;
var optDIV = this.optionsDIV;
var brTag = null;

var totalWidth = 0;
var totalHeight = 0;

var currentZ = "";
var newZ = 0;

var ref = "";

var done = false;

//This quick object is created to store the border data, which we extract using getComputedStyle() once the classes
//are set ...

var bSize = {
		"top" : 0,
		"bottom" : 0,
		"left" : 0,
		"right" : 0
		};

var compS = null;	//getComputedStyle() data stored here when we obtain it ...

var rightPadding = 5;

//First check that the container is a DIV element ...

if (cnt.tagName != "DIV")

	success = c.CSOP_BADCONTAINER;	//Return an error if the argument isn't a DIV element object

else
{
	eClass = cnt.className;		//Get the class specifiers for the DIV in question

	if (eClass.indexOf("CustomSelect") == -1)	//Does the DIV have the "CustomSelect" class set?

		success = c.CSOP_BADCONTAINER;		//Return an error if not

	else
	{
	//Here, we have a valid DIV element, with the correct class specified. Set the CustomSelect container property
	//to point to this DIV element ...

		this.container = cnt;

	//Set the styling class, which will have associated with it the CSS rules for colours, borders etc ...

	csDIV.setAttribute("class", this.headerClass);
	csP.setAttribute("class", this.headerPClass);

	//Make sure that the z-index of the container DIV is inherited from whatever it's placed on ...

		ref = this.container.parentElement;
		done = false;

		while (!done)
		{
			currentZ = ref.style.zIndex;

			if ((newZ = parseInt(currentZ)) === NaN)
				ref = ref.parentElement;
			else
				done = true;

		//End while
		}


		this.container.style.zIndex = newZ.toString();

	//Now, depending on the type, we create the actual text to be displayed, and condition the options collection DIV
	//according to whether we're creating a list box or a combo box ...

	//SPECIAL NOTE: For our dimension test (see below) to work, ALL whitespace characters in the label string have to
	//be replaced with non-breaking spaces! We therefore do this first!

		this.title = this.title.replace(/\s/g, "&nbsp;");

		switch(this.type)
		{
			case c.CS_LISTBOX :

				this.actualTitle = this.title + "&nbsp;...";
				optDIV.style.display = "block";
				optDIV.style.visibility = "visible";

			break;

			case c.CS_COMBOBOX :

				this.actualTitle = this.title + "&nbsp;&#9660;"
				optDIV.style.display = "none";
				optDIV.style.visibility = "hidden";
				this.listVisible = false;

			break ;

		//End switch
		}

		csP.innerHTML = this.actualTitle;
		csDIV.appendChild(csP);

		//Apply the user's specified border colour to the header ... DROPPED BECAUSE THE CSS RULES ASSOCIATED WITH
		//THE HEADER CLASS NOW PERFORM THIS TASK ...

//		csDIV.style.border = this.selectHeaderBorder;


		//Now, at this point, we have a problem. Namely, that none of the geometric size properties of the DOM
		//element objects are set, until we actually append them to the document at some place in the DOM tree,
		//but in order to do so sensibly, we need some idea of the size that these elements will be BEFORE we
		//append them to our document!

		//SOLUTION: set the container DIV CSS styles to the following:

		//overflow: visible - this ensures that any content rendered inside the DIV will 'spill out' into the
		//surroundings, if said content is too large to fit into the DIV as it is ...

		//visibility: hidden - this ensures that the content is not displayed, but still takes up space in the
		//document AS IF it were being rendered.

		//Then, when we attach our CustomSelect DIV as a child of the container DIV, it won't be displayed, BUT
		//metrics will be computed as if it WERE displayed. We can then use those metrics to resize the container
		//DIV to suit!

		this.container.style.visibility = "hidden";	//Hidden from view, but a bounding client rectangle is still
								//generated for the container, and for all children thereof for
								//whom "display: none" is NOT set ...

//		this.container.style.overflowY = "visible";
//		this.container.overflowX = "scroll";

		this.container.style.overflow = "visible"	//Set the rendering overflow mode to "render child elements
								//without clipping"

		this.container.appendChild(csDIV);

		//At this point, we should have metrics set for the csDIV and csP. We therefore extract the size of the
		//paragraph element (as the most deeply nested child in the sequence, and the one associated with actual
		//renderable data). Just to make sure that we have the data we need, we perform a getComputedStyle() on
		//the header DIV, so we can get the border data ...

		compS = window.getComputedStyle(csDIV, null);

		bSize.top = parseInt(compS.borderTopWidth);
		bSize.bottom = parseInt(compS.borderBottomWidth);
		bSize.left = parseInt(compS.borderLeftWidth);
		bSize.right = parseInt(compS.borderRightWidth);

		//Now we generate the size metrics for the DIVs and save them ...

		this.selectHeight = csP.scrollHeight;
		this.selectWidth = csP.scrollWidth;

		this.headerHeight = this.selectHeight + bSize.top + bSize.bottom;
		this.headerWidth = this.selectWidth  + bSize.left + bSize.right;

		totalWidth = this.headerWidth + rightPadding;
		totalHeight = this.headerHeight;

		//Changing the size of the container DIV will NOT work unless the DIV is now made visible. So we do that ...

		this.container.style.visibility = "visible";

		//Now we can set the size of the container DIV, and have a proper bounding client rectangle generated for
		//the new size. We start by making the container DIV wide enough to fit the horizontal extent of the
		//current content. NOTE: this will ONLY work if we set CSS styles to perform this task!

		this.container.style.width = totalWidth.toString() + "px";
		this.container.style.height = totalHeight.toString() + "px";

		//Now we have a problem. The options collection DIV also cannot be resized, until it is rendered. Which means
		//that we have to attach this to our container DIV before we can take advantage of generating a valid
		//bounding client rectangle. So we attach these elements to our container as more renderable children ...

		brTag = document.createElement("br");

//		this.container.appendChild(brTag);

		this.container.appendChild(optDIV);

		//Now make the whole damn lot visible!

//		this.container.style.visibility = "visible";

		//Only now can we set the metrics properly. First, we enable vertical auto-scrolling on the options
		//collection DIV, so that if the number of elements that have been added to the options collection DIV
		//is larger than the number specified to be displayed at any given time, the user can scroll through the
		//options to find the desired one.

		optDIV.style.overflowY = "auto";

		//Apply the user's specified class to the options collection div ...

		optDIV.setAttribute("class", this.collectionClass);

		//Now that we.ve set the class, use getComputedStyle() once again to get the border data ...

		compS = window.getComputedStyle(optDIV, null);

		bSize.top = parseInt(compS.borderTopWidth);
		bSize.bottom = parseInt(compS.borderBottomWidth);
		bSize.left = parseInt(compS.borderLeftWidth);
		bSize.right = parseInt(compS.borderRightWidth);

		//Now, we want the options collection DIV to display a set number of elements, as determined in the
		//listSize property of the CustomSelect object ... again, we need to set CSS styles to achieve this!

		this.collectionWidth = this.selectWidth + bSize.left + bSize.right;
		this.collectionHeight = (this.selectHeight * this.listSize) + bSize.top + bSize.bottom;

		totalWidth = this.collectionWidth + rightPadding;
		totalHeight = this.collectionHeight;

		optDIV.style.width = totalWidth.toString() + "px";
		optDIV.style.height = totalHeight.toString() + "px";

		//If we're building a List Box, we need to make the options DIV fully visible before we continue, which
		//means resizing the container DIV ...

		if (this.type == c.CS_LISTBOX)
		{
		//Note: we do the computation this way, so that any expansion of the code to allow the select control
		//header to have a different height from the options, can be implemented with little effort :)

			totalHeight = this.selectHeight + this.collectionHeight;
			this.container.style.height = totalHeight.toString() + "px";

		//End if
		}

	//End if/else
	}

//End if/else
}

//Return the outcome ...

return(success);

//End method
};


//Method to set the type for the CustomSelect control ...

CustomSelect.prototype.setType = function(sType) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

//First check that the argument is a valid number type argument ...

if ((typeof sType) != "number")

	success = c.CSOP_WRONGTYPE;

else
{
	if ((sType != c.CS_LISTBOX) && (sType != c.CS_COMBOBOX))

		success = c.CSOP_WRONGVALUE;	//return "wrong value" error

	else
	{
		this.type = sType;

	//End if/else
	}

//End if/else
}

//Return our success status ...

return(success);

//End method
};


//Function to set the title for the CustomSelect control ...

CustomSelect.prototype.setTitle = function(text) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

//Test to see if the argument is of string type ...

if ((typeof text) != "string")

	success = c.CSOP_WRONGTYPE;

else
{
	this.title = text;
	this.actualTitle = text;

//End if/else
}

//Return our success status ...

return(success);

//End method
};


//Method to set the selected option for a CustomSelect ...

CustomSelect.prototype.setSelect = function(idx) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

var opt = "";

if ((typeof idx) != "number")	//Signal an error if the argument isn't a number

	success = c.CSOP_INDEXTYPEERROR;

else if (idx < 0)		//Signal an error if the index isn't positive

	success = c.CSOP_NOTINDEX;

else if (idx >= this.options.length)	//Signal an error if array bounds are exceeded

	success = c.CSOP_NOTINDEX;

else
{
//Here, we have a valid index. Set the selection index accordingly, and highlight the selected option ...

	this.selectedIndex = idx;

	opt = this.options[idx];

	opt.optionP.setAttribute("class", "OptionPSelected");

//End if/else
}

return(success);

//End method
};



//Method to add a CustomOption to a CustomSelect control.
//SPECIAL NOTE: This method assumes that the label has been set!

CustomSelect.prototype.add = function(opt, idx) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

var cLen = 0;
var i = 0;

var newOpt = null;
var newBR = null;

var optHeight = 0;

var compS = null;

var bSize = {
		"top" : 0,
		"bottom" : 0,
		"left" : 0,
		"right" : 0
		};

var appendToEnd = false;	//Use this to determine if we're appending the DOM elements to the end of the
				//child nodes of the options collection DIV or not

var iPointNode = null;		//Whichever node is to be inserted before if appendToEnd above is false


//First, we check to see if the 'opt' argument is a valid CustomOption object ...

if (IsGenuineObject(opt, CustomOption))
{
//if we haven't supplied a valid index value, simply append the option to the end of the collection, otherwise, if a
//valid index value HAS been supplied, use that index ...

	if (idx === undefined) //This is a valid state for the idx argument - it simply means "append to end" ...
	{
		this.options.push(opt);
		opt.index = this.options.length - 1;
		appendToEnd = true;
	}

	else if (idx === null) //Likewise, we permit this
	{
		this.options.push(opt);
		opt.index = this.options.length - 1;
		appendToEnd = true;
	}
	else if ((typeof idx) != "number")	//This is an error - return accordingly

		success = c.CSOP_INDEXTYPEERROR;

	else if (idx < 0)	//This, however, is NOT valid, and we return an error

		success = c.CSOP_NOTINDEX;

	else	//Here we have a valid index number (0 onwards) so we perform the insertion into the options collection
	{
		this.options.splice(idx, 0, opt);
		opt.index = idx;
		appendToEnd = (idx == (this.options.length - 1));

	//End if/else
	}

}
else
	success = c.CSOP_NOTOPTION;

//If we've been successful in adding the option to the options collection, now update the DOM elements ...

if (success == c.CSOP_SUCCESS)
{
//Now, we have to update the DOM elements on the page to reflect the addition of the new option ...
//First, we set the option's DIV size to be slightly smaller horizontally than the DIV that will
//contain the option, but the same height as the CustomSelect DIV ...

	opt.optionDIV.style.overflow = "hidden";		//Set DIV overflow to "clip content"

	opt.optionP.innerHTML = opt.labelText;

	opt.optionDIV.appendChild(opt.optionP);		//Nest the paragraph element inside the DIV

//Now we have to insert the new option into the list. Instead of rebuilding the entire list, take advantage of
//element.insertBefore(), which is FAR more efficient :)

//We first check to see if the list is empty, or we're simply appending at the end of the list.

	cLen = this.options.length;

	if (appendToEnd)
		this.optionsDIV.appendChild(opt.optionDIV);
	else
	{
		iPointNode = this.optionsDIV.childNodes[idx];
		this.optionsDIV.insertBefore(opt.optionDIV, iPointNode);

	//Don't forget to correct the indices for the following elements!

		for (i = (idx + 1); i< cLen; i++)
			this.options[i].index = i;

	//End if/else
	}

	//Set the styling class ...

	opt.optionDIV.setAttribute("class", this.optionClass);

	//Only change the DIV metrics ONCE EVERYTHING IS LINKED TO THE DOM TREE!

	opt.optionDIV.style.width = (this.selectWidth - 20).toString() + "px";;
	opt.optionDIV.style.height = this.selectHeight.toString() + "px";

	//Now, condition the size of the options collection box, if we're working with a combo box, so that it grows with
	//the number of options contained therein, up to the user's maximum specified value ...

	if (this.type == c.CS_COMBOBOX)
	{
		optHeight = cLen;
		if (optHeight > this.listSize)
			optHeight = this.listSize;

		compS = window.getComputedStyle(this.optionsDIV, null);

		bSize.top = parseInt(compS.borderTopWidth);
		bSize.bottom = parseInt(compS.borderBottomWidth);
		bSize.left = parseInt(compS.borderLeftWidth);
		bSize.right = parseInt(compS.borderRightWidth);

		optHeight = (optHeight * this.selectHeight) + bSize.top + bSize.bottom;

		this.optionsDIV.style.height = optHeight.toString() + "px";

	//End if
	}

	//Finally, enable events for the option ...

	opt.enableEvents(this.optionEventFunction, this);

//End if
}

//Finally, return the success indicator ...

return(success);

//End method
};


//Method to remove an option from the CustomSelect control's options collection, using the index into the options collection to
//specify the option to remove (in conformity with the standard select control DOM API).

CustomSelect.prototype.remove = function(idx) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

var discard = null;

var cLen = 0;
var i = 0;

var opt = null;

var newOpt = null;
var newBR = null;

var optHeight = 0;

var compS = null;

var bSize = {
		"top" : 0,
		"bottom" : 0,
		"left" : 0,
		"right" : 0
		};


//Once again, we check to see if the option index supplied is a valid number ...

if ((typeof idx) != "number")

	success = c.CSOP_INDEXTYPEERROR;

else if (idx < 0)

	success = c.CSOP_NOTINDEX;

else if (idx >= this.options.length)	//Here we also have to check for buffer overrun!

	success = c.CSOP_NOTINDEX;

else
{
//At this point, we check to see if the option being removed is a selected option, and if so, remove all
//selection status data from the requisite objects ...

opt = this.options[idx];

if (opt.index == this.selectedIndex)
{
	this.selectedIndex = c.CS_NOSELECTIONMADE;	//Signal no selection made, because we've removed the selected option
	opt.optionP.setAttribute("class", "");		//remove the selection highlight from the option
	opt.selected = false;				//and signal that it has been deselected	

//End if
}

//Remove the event listener from the option ... REMEMBER THAT WE SET THE USECAPTURE TO TRUE, AND HAVE
//TO DO THIS HERE ALSO IF WE WANT removeEventListener() TO WORK!

opt.optionP.removeEventListener("click", opt.eventListener, true);

//Now, we splice the CustomSelect options collection array accordingly ...

	discard = this.options.splice(idx, 1);

//End if/else
}

//Now, remove the DOM elements corresponding to the removed option from the options collection DIV.

cLen = this.options.length;

this.optionsDIV.removeChild(this.optionsDIV.childNodes[idx]);

//Make sure the indices for all following elements are corrected, and if an option OTHER than the
//removed option was selected, make sure that the selectedIndex of the CustomSelect is set properly
//as well ...

for (i = idx; i < cLen; i++)
{
	this.options[i].index = i;
	if (this.options[i].selected)
		this.selectedIndex = i;

//End i loop
}

if (this.type == c.CS_COMBOBOX)
{
	optHeight = cLen;
	if (optHeight > this.listSize)
		optHeight = this.listSize;

	compS = window.getComputedStyle(this.optionsDIV, null);

	bSize.top = parseInt(compS.borderTopWidth);
	bSize.bottom = parseInt(compS.borderBottomWidth);
	bSize.left = parseInt(compS.borderLeftWidth);
	bSize.right = parseInt(compS.borderRightWidth);

	optHeight = (optHeight * this.selectHeight) + bSize.top + bSize.bottom;

	this.optionsDIV.style.height = optHeight.toString() + "px";

//End if
}


//And finally, return our success indicator ...

return(success);

//End method
};


//Method to remove a SPECIFIED option from the options collection, by supplying an object reference to the option to
//remove ...

CustomSelect.prototype.removeSpecifiedOption = function(opt) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

var cLen = this.options.length;
var done = false;
var found = false;
var idx = 0;
var entry = null;

if (IsGenuineObject(opt, CustomOption))
{
//Here, we have a genuine CustomOption object. Now see if this option has been added to the options collection ...

	while (!done)
	{
	//First, check that we actually have one or more options in the options collection, and if so, only then scan
	//the options collection for comparison entries ...

		if (idx < cLen)
		{
			entry = this.options[idx];	//get current option for comparison

			if (entry === opt)		//Found a match?
			{
				found = true;		//Signal this to be the case
				done = true;		//and exit the loop

			//End if
			}

			if (!found)
			{
			//Here, we haven't found a match. So move on to the next option in the options collection, and the moment
			//we exhaust all the entries, exit the entire scanning loop ...

				idx++;
				if (idx == cLen)
					done = true;

			//End if
			}

		}
		else
		{
		//Here, there were no options in the options collection to scan, so we cannot remove any options from the
		//options collection. We therefore exit accordingly.

			found = false;
			done = true;

		//End if/else
		}

	//End while
	}
	if (!found)
	{
	//Here, we did not find a match. Exit with the appropriate error code ...

		success = c.CSOP_NOTFOUND;
	}
	else
	{
	//Here, we found a match. So, remove the specified option from the options collection ...

		success = this.remove(idx);

	//End if/else
	}

}
else
{
//Here, we didn't have a genuine CustomOption object, so exit with an error code ...

	success = c.CSOP_NOTOPTION;

//End if/else
}

return(success);

//End method
};


//Method to erase all entries from a CustomSelect ...

CustomSelect.prototype.wipe = function() {

this.options = [];	//Destroy the options entries

while (this.optionsDIV.hasChildNodes())	//Destroy the DOM element entries in the options collection DIV

	this.optionsDIV.removeChild(this.optionsDIV.childNodes[0]);

//End method
};


//Support function for event handlers below: toggle combo box options collection on or off ...

function ToggleComboBoxState(cb)
{
var c = new CustomSelectConstants();

if (cb.type == c.CS_COMBOBOX)
{
	cb.listVisible = !(cb.listVisible);		//flip the visibility state

	if (cb.listVisible)
	{
	//Increase the z-index so that everything is rendered above the surroundings if it is to be rendered ...

		newZ = parseInt(cb.container.style.zIndex) + 1;
		cb.container.style.zIndex = newZ.toString();
		
		if (cb.options.length > 0)
		{
		//Only render the options list if it contains at least one option!

			cb.optionsDIV.style.display = "block";
			cb.optionsDIV.style.visibility = "visible";
		}
	}
	else
	{
		newZ = parseInt(cb.container.style.zIndex) - 1;
		cb.container.style.zIndex = newZ.toString();

		cb.optionsDIV.style.display = "none";
		cb.optionsDIV.style.visibility = "hidden";

	//End if
	}

//End if
}

//End function
}


//Standard onclick event handler for CustomSelect object ...

function HandleCSClickEvent(event)
{
var c = new CustomSelectConstants();

var newZ = 0;

//If the CustomSelect object is a combo box, then toggle the visibility of the options collection ...

ToggleComboBoxState(this);

//Now launch the user's own click event handler for this CustomSelect object ...

if (IsGenuineObject(this.eventFunction, Function))
	this.eventFunction(event);

//End event handler
}


//Method to enable events on a CustomSelect object's <P> element

CustomSelect.prototype.enableEvents = function(funcRef) {

//Remove any existing event handler just in case ...

//IMPORTANT NOTE! IF A USECAPTURE VALUE IS SUPPLIED, THEN THE ***SAME*** USECAPTURE VALUE HAS TO BE PASSED
//TO removeEventListener(), AS THE ONE THAT WAS PASSED TO addEventListner() TO ADD THE EVENT LISTENER IN THE
//FIRST PLACE! IF YOU FAIL TO MATCH THE USECAPTURE VALUES AS WELL AS THE FUNCTION REFERENCES, removeEventListener()
//WILL NOT WORK!

if (IsGenuineObject(this.internalEventFunction, Function))
	this.selectP.removeEventListener("click", this.internalEventFunction, true);

var execObj = new Exec();

execObj.setFunction(HandleCSClickEvent);
execObj.setArguments([]);
execObj.setSelfObject(this);

if (IsGenuineObject(this.selectP, Element))
{
	if (this.selectP.tagName == "P")
	{
		this.eventFunction = funcRef;
		this.internalEventFunction = EventMetaClosure(execObj);
		this.selectP.addEventListener("click", this.internalEventFunction, true);

	//End if
	}

//End if
}

//End method
};


CustomSelect.prototype.setOptionEventFunction = function(funcRef) {

this.optionEventFunction = funcRef;

//End method
}


//Standard onclick event handler for CustomOption object ...

function HandleCOClickEvent(event)
{
var c = new CustomSelectConstants();

var opt = null;

//First, find out if a previous option was selected, and if so, remove any selection highlight attached thereto ...

if (this.eventSelect.selectedIndex != c.CS_NOSELECTIONMADE)
{
	opt = this.eventSelect.options[this.eventSelect.selectedIndex];
	opt.optionP.setAttribute("class", "");

//End if
}

//Now, toggle the highlight on this newly selected option ... if the option has NOT been currently selected, we make it
//the selected option, set the selectedIndex value for the CustomSelect accordingly, and pop in the highlight. If the
//option was already selected, a second click deselects it, setting the selectedIndex of the CustomSelect to -1, and
//removing the highlight from the option ...

if (this.eventSelect.selectedIndex != this.index)
{
//Set the selection highlight on the option, and signal that this option has been selected ...

	this.selected = true;
	this.optionP.setAttribute("class", "OptionPSelected");

//Then, determine which index number from the options list has been selected, and set the CustomSelect's selectedIndex
//property accordingly ...

	this.eventSelect.selectedIndex = this.index;

}
else
{
//Here, we remove the selection highlight on the option, and signal that this option has been deselected ...

	this.selected = false;
	this.optionP.setAttribute("class", "");

//And now we set the CustomSelect status to "no selection made" ...

	this.eventSelect.selectedIndex = c.CS_NOSELECTIONMADE;

}

console.log("Selected Item : " + this.index.toString())

//If the CustomSelect object is for a combo box, toggle its state ...

ToggleComboBoxState(this.eventSelect);

//Finally, launch the custom event function if it exists ...

if (IsGenuineObject(this.eventFunction, Function))
	this.eventFunction(event);

//End event handler
}


//Method to enable events on a CustomOption's <P> element.
//SPECIAL NOTE: This needs a reference to the parent CustomSelect to be passed to it, so that the event handler can
//be registered in a manner enabling it to access the CustomSelect as well as the CustomOption!

CustomOption.prototype.enableEvents = function(funcRef, cSelect)
{
var execObj = new Exec();

execObj.setFunction(HandleCOClickEvent);
execObj.setArguments([]);
execObj.setSelfObject(this);

if (IsGenuineObject(this.optionP, Element))
{
	if (this.optionP.tagName == "P")
	{
		this.eventFunction = funcRef;
		this.eventSelect = cSelect;
		if (this.eventListener === null)
		{
			this.eventListener = EventMetaClosure(execObj);
			this.optionP.addEventListener("click", this.eventListener, true);

		//End if
		}

	//End if
	}

//End if
}

//End method
};




//CustomSelectList object constructor

function CustomSelectList()
{
this.elements = [];
this.itemCount = 0;

//End constructor
}


//Method to add a CustomSelect object to the CustomSelectList ...

CustomSelectList.prototype.append = function(cs) {

var c = new CustomSelectConstants();

var success = c.CSOP_SUCCESS;

if (IsGenuineObject(cs, CustomSelect))
{
	this.elements.push(cs);
	this.itemCount = this.elements.length;

}
else

	success = c.CSOP_NOTSELECT;

return(success);

//End method
};



//Method to find a CustomSelect object in a CustomSelectList by name ...

CustomSelectList.prototype.findSelectByName = function(csName) {

var c = new CustomSelectConstants();

var res = {
		"success" : c.CSOP_SUCCESS,
		"select" : null
		};

var idx = 0;
var done = false;
var found = false;

if ((typeof csName) != "string")

	res.success = c.CSOP_WRONGTYPE;

else
{
	while (!done)
	{
		if (this.elements[idx].name == csName)
		{
			res.select = this.elements[idx];
			done = true;
			found = true;
		}
		else
		{
			idx++;
			done = (idx >= this.itemCount);

		//End if/else
		}

	//End while
	}


//End if/else
}

if (!found)
	res.success = c.CSOP_NOTFOUND;

return(res);

//End method
};




