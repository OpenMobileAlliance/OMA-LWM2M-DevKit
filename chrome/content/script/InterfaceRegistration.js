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
 * \file Main script file for the LWM2M DevKit.
 * 
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Lwm2mDevKit.Registration = { };

Lwm2mDevKit.Registration.register = function() {

	// TODO: discover and find rt="core.rd" first
	
	try {
		let ep = Lwm2mDevKit.field('endpoint_name');
		let lt = Lwm2mDevKit.field('lifetime');
		let lwm2m = Lwm2mDevKit.field('version');
		let b = Lwm2mDevKit.field('binding');
		let sms = Lwm2mDevKit.field('sms_no');
		
		if (!ep) throw new Error('You must specify an Endpoint Client Name.');
		
		let uri = '/rd?ep=' + ep;
		if (lt!=86400) uri += '&lt=' + lt;
		if (lwm2m!='1.0') uri += '&lwm2m=' + lwm2m;
		if (b) uri += '&b=' + b;
		if (sms) uri += '&sms=' + sms;
		
		//Get object in core link format. No parameter is for root.
		let pl = Lwm2mDevKit.getSerializedObject();
		
		var message = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.getRequestType(), Lwm2mDevKit.Copper.POST, uri, pl);
		message.setContentType(Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT);
		
		Lwm2mDevKit.coapEndpoint.send( message, Lwm2mDevKit.Registration.onRegister );
		
		Lwm2mDevKit.coapEndpoint.client.setTimeout(parseInt(lt)+5);
		
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}
};

Lwm2mDevKit.Registration.onRegister = function(message) {
	
	if (message.getCode()==Lwm2mDevKit.Copper.CODE_2_01_CREATED) {
		Lwm2mDevKit.registered = true;
		Lwm2mDevKit.registrationHandle = message.getLocation();
		Lwm2mDevKit.registrationTimestamp = new Date().toUTCString().replace(/GMT/, 'UTC');
		
		if (Lwm2mDevKit.registrationHandle==null) Lwm2mDevKit.logWarning(new Error("No Location option in response from server"));
		
		document.getElementById('handle_box').hidden = false;
		
		document.getElementById('update').disabled = false;
		document.getElementById('deregister').disabled = false;
		
		Lwm2mDevKit.Registration.scheduleUpdate();
	} else {
		Lwm2mDevKit.registered = false;
		Lwm2mDevKit.registrationHandle = null;
		Lwm2mDevKit.registrationTimestamp = null;
		
		document.getElementById('handle_box').hidden = true;

		document.getElementById('update').disabled = true;
		document.getElementById('deregister').disabled = true;
	}
	Lwm2mDevKit.update('handle', Lwm2mDevKit.registrationHandle);
	Lwm2mDevKit.update('last_update', Lwm2mDevKit.registrationTimestamp);
	
	Lwm2mDevKit.activateButtons();
};

Lwm2mDevKit.Registration.update = function() {
	
	try {
		let uri = Lwm2mDevKit.registrationHandle;//loc value got from the handle
		let lt = Lwm2mDevKit.field('lifetime');
		let b = Lwm2mDevKit.field('binding');
		let sms = Lwm2mDevKit.field('sms_no');
		
		if (!uri) throw new Error('No registration handle');
		
		uri += '?lt=' + lt;
		if (b) uri += '&b=' + b;
		if (sms) uri += '&sms=' + sms;
		
		
		var message = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.getRequestType(), Lwm2mDevKit.Copper.PUT, uri, null);
		message.setContentType(Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT);
		
		Lwm2mDevKit.coapEndpoint.send( message, Lwm2mDevKit.Registration.onUpdate);
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}
};

Lwm2mDevKit.Registration.onUpdate = function(message) {
	
	if (message.getCode()==Lwm2mDevKit.Copper.CODE_2_04_CHANGED) {
		Lwm2mDevKit.registrationTimestamp = new Date().toUTCString();
		
		Lwm2mDevKit.Registration.scheduleUpdate();
		
	} else {
		Lwm2mDevKit.registrationTimestamp = null;
		if (!message.isSuccess()) {
			Lwm2mDevKit.registrationHandle = null;
			Lwm2mDevKit.logWarning(new Error('Server responded with '+ message.getCode(true) + (message.getPayload().length>0 ? '\nDiagnostic message: ' + message.getPayloadText() : "")));
		} else {
			Lwm2mDevKit.logWarning(new Error('Server responded with '+ message.getCode(true) + (message.getPayload().length>0 ? '\nDiagnostic message: ' + message.getPayloadText() : "")));
		}
	}
	Lwm2mDevKit.update('last_update', Lwm2mDevKit.registrationTimestamp);
	
	Lwm2mDevKit.activateButtons();
};

Lwm2mDevKit.Registration.deregister = function() {
	
	try {
		if (!Lwm2mDevKit.registrationHandle) throw new Error('No registration handle');
		
		var message = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.getRequestType(), Lwm2mDevKit.Copper.DELETE, Lwm2mDevKit.registrationHandle, null);
		message.setContentType(Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT);
		
		Lwm2mDevKit.coapEndpoint.send( message, Lwm2mDevKit.Registration.onDeregister);
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}
};

Lwm2mDevKit.Registration.onDeregister = function(message) {

	if (!message || message.getCode()==Lwm2mDevKit.Copper.CODE_2_02_DELETED) {
		Lwm2mDevKit.registered = false;
		Lwm2mDevKit.registrationHandle = null;
		Lwm2mDevKit.registrationTimestamp = null;
		document.getElementById('handle_box').hidden = true;
		
		document.getElementById('update').disabled = true;
		document.getElementById('deregister').disabled = true;
	} else {
		Lwm2mDevKit.logWarning(new Error('Server responded with '+ message.getCode(true) + message.getPayload().length>0 ? '\nDiagnostic message: ' + message.getPayloadText() : ""));
	}
	
	if (Lwm2mDevKit.Registration.scheduleTimer!=null) {
		window.clearTimeout(Lwm2mDevKit.Registration.scheduleTimer);
		window.clearInterval(Lwm2mDevKit.Registration.scheduleInterval);
	}
	
	Lwm2mDevKit.update('handle', Lwm2mDevKit.registrationHandle);
	Lwm2mDevKit.update('last_update', Lwm2mDevKit.registrationTimestamp);
	
	Lwm2mDevKit.activateButtons();
};

Lwm2mDevKit.Registration.scheduleTimeout = null;
Lwm2mDevKit.Registration.scheduleInterval = null;
Lwm2mDevKit.Registration.scheduleTimer = null;
Lwm2mDevKit.Registration.scheduleUpdate = function() {
	
	if (Lwm2mDevKit.Registration.scheduleTimer!=null) {
		window.clearTimeout(Lwm2mDevKit.Registration.scheduleTimer);
		window.clearInterval(Lwm2mDevKit.Registration.scheduleInterval);
	}
	
	// steal a second to compensate RTT
	Lwm2mDevKit.Registration.scheduleTimeout = parseInt(Lwm2mDevKit.field('lifetime')) - 1;
	
	Lwm2mDevKit.update('scheduled_update', Lwm2mDevKit.Registration.scheduleTimeout + ' seconds');
	
	Lwm2mDevKit.Registration.scheduleTimer = window.setTimeout( function() { Lwm2mDevKit.Registration.update(); }, Lwm2mDevKit.Registration.scheduleTimeout*1000 - 50);
	Lwm2mDevKit.Registration.scheduleInterval = window.setInterval( function() { Lwm2mDevKit.Registration.tickUpdate() }, 1000);
};


Lwm2mDevKit.Registration.tickUpdate = function() {
		
	// tick
	--Lwm2mDevKit.Registration.scheduleTimeout;
	
	if (Lwm2mDevKit.Registration.scheduleTimeout > 0) {
		let hours = Math.floor( Lwm2mDevKit.Registration.scheduleTimeout / (60*60) );
		let minutes = Math.floor( Lwm2mDevKit.Registration.scheduleTimeout / 60) % 60;
		let seconds = Lwm2mDevKit.Registration.scheduleTimeout % 60;
		
	    if (hours   < 10) hours   = '0' + hours;
	    if (minutes < 10) minutes = '0' + minutes;
	    if (seconds < 10) seconds = '0' + seconds;
		
		Lwm2mDevKit.update('scheduled_update', hours + ':' + minutes + ':' + seconds);
		
	} else {
		Lwm2mDevKit.update('scheduled_update', '');
		window.clearInterval(Lwm2mDevKit.Registration.scheduleInterval);
	}
};
