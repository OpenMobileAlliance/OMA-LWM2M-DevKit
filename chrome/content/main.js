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
 *         Main script file for the LWM2M DevKit.
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 * \author  Prasad Pulikal <prasad.pulikal@inf.ethz.ch>\author
 */

Lwm2mDevKit.prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

Lwm2mDevKit.hostname = '';
Lwm2mDevKit.port = -1;
Lwm2mDevKit.path = '/';
Lwm2mDevKit.query = '';

Lwm2mDevKit.coapEndpoint = null;
Lwm2mDevKit.coapObserver = null;

Lwm2mDevKit.createRows = true;

// CoAP behavior
Lwm2mDevKit.behavior = {
	conRequests: true,
	retransmissions: true,
	sendUriHost: false,
	sendSize1: false,
	blockSize: 0,
	observeCancellation: 'lazy'
};

// LWM2M state
Lwm2mDevKit.localAddr = null;
Lwm2mDevKit.registered = false;
Lwm2mDevKit.registrationHandle = null;
Lwm2mDevKit.registrationTimestamp = null;

//Life cycle functions
////////////////////////////////////////////////////////////////////////////////

Lwm2mDevKit.main = function() {

	Lwm2mDevKit.logEvent('==============================================================================');
	Lwm2mDevKit.logEvent('= INITIALIZING LWM2MDevKit ===================================================');
	Lwm2mDevKit.logEvent('==============================================================================');
	
	// set tab icon
	let tabbrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser").getNext().gBrowser;  
	for (let i=0; i<tabbrowser.browsers.length; ++i) {
		if (tabbrowser.mTabs[i].label=='OMA LWM2M DevKit - Client') tabbrowser.setIcon(tabbrowser.mTabs[i], 'chrome://lwm2m-devkit/skin/oma-logo_16.png');
	}
	
	// get settings from preferences
	try {
		Lwm2mDevKit.loadBehavior();
	} catch (ex) {
		Lwm2mDevKit.logWarning(new Error('Could not load preferences; using hardcoded defauls.\n' + ex.message));
	}

	// open location
	try {
		Lwm2mDevKit.parseUri(document.location.href);

		// set up datagram and transaction layer
		Lwm2mDevKit.coapEndpoint = new Lwm2mDevKit.TransactionHandler(
				new Lwm2mDevKit.UdpClient(Lwm2mDevKit.hostname, Lwm2mDevKit.port) );
		Lwm2mDevKit.coapEndpoint.registerCallback(Lwm2mDevKit.defaultHandler);

		var element = document.getElementById("panel_bootstrap");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		element = document.getElementById("panel_ping");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		element = document.getElementById("panel_device_loading");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		element = document.getElementById("panel_registration");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		element = document.getElementById("panel_service");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		element = document.getElementById("panel_reporting");
		element.addEventListener('popupshowing', Lwm2mDevKit.Tooltips.nextStep, true);
		
		element = document.getElementById("tooltip");
		element.addEventListener('click', Lwm2mDevKit.Tooltips.clickThrough, true);
		
		var element = document.getElementById("panel_event_log");
		element.addEventListener('popupshowing', function() { this.sizeTo(document.getElementById('main_content').clientWidth-20, document.getElementById('main_content').clientHeight-80); }, true);
		
		// start tooltips at ping button
		Lwm2mDevKit.Tooltips.nextStep();
		
		// ping to get local address
		window.setTimeout(
				function() { Lwm2mDevKit.ping(); },
				300);
		
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}
};

Lwm2mDevKit.unload = function() {
	// shut down socket required for refresh (F5), client might be null for parseUri() redirects
	if (Lwm2mDevKit.coapEndpoint != null) {
		Lwm2mDevKit.coapEndpoint.shutdown();
	}

	Lwm2mDevKit.saveBehavior();
};

//Sends a CoAP ping which is an empty CON message
Lwm2mDevKit.ping = function() {
	try {
		Lwm2mDevKit.coapEndpoint.cancelTransactions();
		var message = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.Copper.MSG_TYPE_CON);
		Lwm2mDevKit.coapEndpoint.send( message, Lwm2mDevKit.pingHandler );
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}

	// local socket address available after first send()
	if (Lwm2mDevKit.coapEndpoint.client.getAddr()!=null) {
		Lwm2mDevKit.localAddr = Lwm2mDevKit.coapEndpoint.client.getAddr().address;
		if (Lwm2mDevKit.localAddr.indexOf(":")!=-1) Lwm2mDevKit.localAddr = '[' + Lwm2mDevKit.localAddr + ']';
		Lwm2mDevKit.localPort = Lwm2mDevKit.coapEndpoint.client.getAddr().port;
		Lwm2mDevKit.set('local_address', Lwm2mDevKit.localAddr + ':' + Lwm2mDevKit.localPort);
	}
};
