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
 * \file Helper functions
 * 
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

// Helper functions
// //////////////////////////////////////////////////////////////////////////////
Lwm2mDevKit.getRequestType = function() {
	return Lwm2mDevKit.behavior.conRequests
			? Lwm2mDevKit.Copper.MSG_TYPE_CON
			: Lwm2mDevKit.Copper.MSG_TYPE_NON;
};

// Load behavior options from preferences
Lwm2mDevKit.loadBehavior = function() {
	Lwm2mDevKit.behavior.conRequests = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.behavior.con-requests');
	Lwm2mDevKit.behavior.retransmissions = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.behavior.retransmissions');
	Lwm2mDevKit.behavior.sendUriHost = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.behavior.send-uri-host');
	Lwm2mDevKit.behavior.sendSize1 = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.behavior.send-size1');
	Lwm2mDevKit.behavior.blockSize = Lwm2mDevKit.prefManager
			.getIntPref('extensions.lwm2m-devkit.behavior.block-size');
	Lwm2mDevKit.behavior.observeCancellation = Lwm2mDevKit.prefManager
			.getCharPref('extensions.lwm2m-devkit.behavior.observe-cancellation');
	
	Lwm2mDevKit.Tooltips.enabled = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.show-tooltips');

	Lwm2mDevKit.createRows = Lwm2mDevKit.prefManager
			.getBoolPref('extensions.lwm2m-devkit.show-create-rows');
	
};

// save to preferences
Lwm2mDevKit.saveBehavior = function() {
	Lwm2mDevKit.prefManager.setBoolPref(
			'extensions.lwm2m-devkit.behavior.con-requests',
			Lwm2mDevKit.behavior.conRequests);
	Lwm2mDevKit.prefManager.setBoolPref(
			'extensions.lwm2m-devkit.behavior.retransmissions',
			Lwm2mDevKit.behavior.retransmissions);
	Lwm2mDevKit.prefManager.setBoolPref(
			'extensions.lwm2m-devkit.behavior.send-uri-host',
			Lwm2mDevKit.behavior.sendUriHost);
	Lwm2mDevKit.prefManager.setBoolPref(
			'extensions.lwm2m-devkit.behavior.send-size1',
			Lwm2mDevKit.behavior.sendSize1);
	Lwm2mDevKit.prefManager.setIntPref(
			'extensions.lwm2m-devkit.behavior.block-size',
			Lwm2mDevKit.behavior.blockSize);
	Lwm2mDevKit.prefManager.setCharPref(
			'extensions.lwm2m-devkit.behavior.observe-cancellation',
			Lwm2mDevKit.behavior.observeCancellation);
};

Lwm2mDevKit.parseUri = function(inputUri) {

	/*
	 * ( 'coap:' ) ( '//' Uri-Authority ) ( '/' Uri-Path ) ( '?' Uri-Query )
	 */

	var uri;

	try {
		var uriParser = Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService).newURI(
						inputUri, null, null);

		uri = uriParser.QueryInterface(Components.interfaces.nsIURL);
	} catch (ex) {
		// cannot parse URI
		throw new Error('Invalid URI');
	}

	// redirect to omit subsequent slash, refs (#), and params (;)
	if (uri.filePath != '/' && uri.fileName == '') {
		document.location.href = uri.prePath + uri.filePath.substring(0, uri.filePath.length - 1) + (uri.query != '' ? '?' + uri.query : '');
		throw new Error('Redirect failed');
	} else if (uri.ref != '') {
		document.location.href = uri.prePath + uri.filePath + (uri.query != '' ? '?' + uri.query : '');
		throw new Error('Redirect failed');
	} else if (uri.filePath.match(/\/{2,}/)) {
		document.location.href = uri.prePath + uri.filePath.replace(/\/{2,}/g, '/') + (uri.query != '' ? '?' + uri.query : '');
		throw new Error('Redirect failed');
	}

	if (uri.port > 0xFFFF) {
		throw new Error('Illeagal port in URI');
	}

	// DNS lookup
	// try {
	// // deliberately ignoring broken/undocumented asyncResolve()
	// var ns =
	// Components.classes["@mozilla.org/network/dns-service;1"].createInstance(Components.interfaces.nsIDNSService).resolve(uri.host.replace(/%.+$/,
	// ''), 0);
	//		
	// var addresses = '';
	// while (ns.hasMore()) {
	// addresses += ns.getNextAddrAsString()+'\n';
	// }
	// if (addresses!='')
	// document.getElementById('info_host').setAttribute('tooltiptext',
	// addresses);
	//		
	// } catch (ex) {
	// throw 'Cannot resolve host: ' + ex;
	// }

	Lwm2mDevKit.hostname = uri.host;
	if (Lwm2mDevKit.hostname.indexOf(':') != -1)
		Lwm2mDevKit.hostname = '[' + Lwm2mDevKit.hostname + ']';

	Lwm2mDevKit.port = uri.port != -1 ? uri.port : Lwm2mDevKit.Copper.DEFAULT_PORT;
	Lwm2mDevKit.path = decodeURI(uri.filePath); // as for 06 and as a server
												// workaround for 03
	Lwm2mDevKit.query = decodeURI(uri.query); // as for 06 and as aserver
												// workaround for 03

	document.title = Lwm2mDevKit.hostname + Lwm2mDevKit.path;
};

Lwm2mDevKit.parseLinkFormat = function(data) {

	var links = new Object();

	// totally complicated but supports ',' and '\n' to separate links and ','
	// as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*\w+\s*(=\s*(\w+|"([^"\\]*(\\.[^"\\]*)*)")\s*)?)*)/g);
	
	for (let i in format) {
		var elems = format[i].match(/^<([^>\?]+)[^>]*>\s*(;.+)?\s*$/);

		var uri = elems[1];

		if (uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/)) {
			// absolute URI
		} else {
			// fix for old Contiki implementation and others which omit the
			// leading '/' in the link format
			if (uri.charAt(0) != '/')
				uri = '/' + uri;
		}

		links[uri] = new Object();

		if (elems[2]) {

			var tokens = elems[2].match(/(;\s*\w+\s*(=\s*(\w+|"([^\\"]*(\\.[^"\\]*)*)"))?)/g);

			for (let j in tokens) {
				var keyVal = tokens[j].match(/;\s*([^<"\s;,=]+)\s*(=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)"))?/);
				if (keyVal) {
					if (links[uri][keyVal[1]] != null) {

						if (!Array.isArray(links[uri][keyVal[1]])) {
							let
							temp = links[uri][keyVal[1]];
							links[uri][keyVal[1]] = new Array(0);
							links[uri][keyVal[1]].push(temp);
						}

						links[uri][keyVal[1]]
								.push(keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4])
										: keyVal[5].replace(/\\/g, ''))
										: true);

					} else {

						links[uri][keyVal[1]] = keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4])
								: keyVal[5].replace(/\\/g, ''))
								: true;
					}
				}
			}
		}
	}

	return links;
};

Lwm2mDevKit.negotiateBlockSize = function(message) {
	var size = message.getBlockSize();
	if (Lwm2mDevKit.behavior.blockSize == 0) {
		Lwm2mDevKit.behavior.blockSize = size;
		Lwm2mDevKit.updateBehavior();

		Lwm2mDevKit.popup(Lwm2mDevKit.hostname + ':' + Lwm2mDevKit.port,
				'Negotiated block size: ' + size);
	} else if (Lwm2mDevKit.behavior.blockSize < size) {
		size = Lwm2mDevKit.behavior.blockSize;
	}
	return size;
};

// workaround for "this" losing scope when passing callback functions
Lwm2mDevKit.myBind = function(scope, fn) {
	return function() {
		fn.apply(scope, arguments);
	};
};

Lwm2mDevKit.get = function(id) {
	try {
		return document.getElementById(id).value;
	} catch (ex) {
		Lwm2mDevKit.logError(new Error('Field ' + id + ' not found'));
	}
};

Lwm2mDevKit.set = function(id, value) {
	document.getElementById(id).value = value;
};

Lwm2mDevKit.popupService = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);
// Too frequent popups are suppressed, hence this queueing mode
Lwm2mDevKit.popupInterval = 1000;
Lwm2mDevKit.popupLast = null;
Lwm2mDevKit.popupQueue = new Array(0);
Lwm2mDevKit.popupTimeout = null;

Lwm2mDevKit.popNext = function() {
	let next = Lwm2mDevKit.popupQueue.pop();
	if (next) {
		Lwm2mDevKit.popup(next[0], next[1]);
		
		if (Lwm2mDevKit.popupQueue.length > 0) {
			Lwm2mDevKit.popupTimeout =  window.setTimeout(
					function() { Lwm2mDevKit.popNext(); },
					Lwm2mDevKit.popupInterval);
		} else {
			Lwm2mDevKit.popupTimeout = null;
		}
	}
}

Lwm2mDevKit.popup = function(title, msg) {
	
	// queue if too frequent
	let since = new Date() - Lwm2mDevKit.popupLast;
	if (since<Lwm2mDevKit.popupInterval) {
		
		Lwm2mDevKit.popupQueue.unshift([title,msg]);
		
		if (!Lwm2mDevKit.popupTimeout) {
			Lwm2mDevKit.popupTimeout =  window.setTimeout(
					function() { Lwm2mDevKit.popNext(); },
					Lwm2mDevKit.popupInterval - since);
		}
		return;
		
	}
	
	// update time
	Lwm2mDevKit.popupLast = new Date();
	
	// actual popup
	try {
		Lwm2mDevKit.popupService.showAlertNotification('chrome://lwm2m-devkit/skin/oma-logo_32.png', title, msg);
	} catch (ex) {
		Lwm2mDevKit.logWarning(ex)
	}
};

Lwm2mDevKit.isObject = function(ob) {
	return (typeof ob === 'object' && !Array.isArray(ob));
};

Lwm2mDevKit.isNumeric = function(obj) {
	return !Array.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
};

Lwm2mDevKit.htmlEntities = function(raw) {
	return raw.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
		   return '&#'+i.charCodeAt(0)+';';
		});
};

Lwm2mDevKit.utf8Entities = function(encoded) {
	return encoded.replace(/(\&#([0-9]+);)/gim, function(k, l, m) {
			return String.fromCharCode(m);
		});
};

Lwm2mDevKit.getObjectAddress = function(message) {
	let path = message.getUriPath();
	let root = Lwm2mDevKit.client.root;
	
	if (!root.endsWith('/')) root += '/';
	if (root.startsWith('/')) root = root.substr(1);
	
	path = path.substr(root.length);
	
	let elems = path.split('/');
	
	for (let i in elems) {
		elems[i] = Number(elems[i]);
	}
	
	return elems;
};
