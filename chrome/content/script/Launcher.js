/*******************************************************************************
 * Copyright (c) 2015, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * This file is part of the OMA LWM2M DevKit.
 *******************************************************************************/
/**
 * \file
 *         A wrapper for the different CoAP versions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Lwm2mDevKit.check = function() {
	
	var firstRun = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.lwm2m-devkit.first-run');
	
	if (firstRun) {
	
		let id = 'lwm2m-devkit-toolbar-button';
		
		// install the DevKit toolbar button
	    if (!document.getElementById(id)) {
	        var toolbar = document.getElementById('addon-bar');
	
	        toolbar.insertItem(id);
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
	        
	        toolbar.collapsed = false;
	    }
	    
	    // set first-run to false
	    Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).setBoolPref('extensions.lwm2m-devkit.first-run', false);
	}
};

Lwm2mDevKit.removeButton = function() {

	let id = 'lwm2m-devkit-toolbar-button';
	
    if (document.getElementById(id)) {
        var toolbar = document.getElementById('addon-bar');

        let newSet = toolbar.currentSet.replace(/(,lwm2m-devkit-toolbar-button|lwm2m-devkit-toolbar-button,)/, '');
        toolbar.setAttribute("currentset", newSet);
        document.persist(toolbar.id, "currentset");
    }
};

Lwm2mDevKit.launchDevKit = function() {
	window.openDialog('chrome://lwm2m-devkit/content/launcher.xul', 'LWM2M DevKit Launcher', 'chrome,titlebar,toolbar,centerscreen,modal');
	document.getElementById('urlbar').focus();
};

Lwm2mDevKit.open = function(target) {

	/*
	 * ( 'coap:' ) ( '//' Uri-Authority ) ( '/' Uri-Path ) ( '?' Uri-Query )
	 */

	let uri;
	
	if (target.startsWith('coap:')) {
		target = 'coap+lwm2m:' + target.substr(5);
	} else if (target.startsWith('lwm2m:')) {
		alert("The OMA LWM2M DevKit uses the 'coap+lwm2m' URI scheme for direct access through the browser addressbar.");
		target = 'coap+lwm2m:' + target.substr(6);
	} else if (target.startsWith('coap+lwm2m:')) {
		alert("Note that generally OMA LWM2M uses 'coap'-scheme URIs.\nThe OMA LWM2M DevKit uses the 'coap+lwm2m' scheme to leave 'coap' for\nraw CoAP interaction with Copper (Cu).");
	} else {
		document.getElementById('lwm2m-devkit-info').style.color = '#FF6666';
		document.getElementById('lwm2m-devkit-info').value = 'Invalid URI scheme';
		return false;
	}

	try {
		let uriParser = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(target, null, null);
		uri = uriParser.QueryInterface(Components.interfaces.nsIURL);
	} catch (ex) {
		document.getElementById('lwm2m-devkit-info').style.color = '#FF3333';
		document.getElementById('lwm2m-devkit-info').value = 'Invalid URI';
		return false;
	}
	
	if (uri.host=='') {
		document.getElementById('lwm2m-devkit-info').style.color = '#FF3333';
		document.getElementById('lwm2m-devkit-info').value = 'Invalid host';
		return false;
	}
	
	var tab = window.opener.gBrowser.addTab(uri.spec);
	window.opener.gBrowser.selectedTab = tab;
	
	return true;
}

addEventListener("load", Lwm2mDevKit.check, false);
