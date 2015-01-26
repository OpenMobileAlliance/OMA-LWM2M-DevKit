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
 *         Code handling the UDP communication for the CoAP protocol
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

/*
 * FIXME: inputStream does not separate single datagrams.
 * Thus, increased traffic results in merged datagrams, i.e., one or more datagrams are added to the payload of the first one.
 * A workaround will probably need native code to provide a datagram handler (transport-service) that pipes them to/from Firefox.
 */ 

Lwm2mDevKit.UdpClient = function(remoteHost, remotePort) {

	// createTransport requires plain IPv6 address
	this.host = remoteHost.replace(/\[/,'').replace(/\]/,'');
	this.port = remotePort;
	
	this.transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
	this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
	
	this.socket = this.transportService.createTransport(["udp"], 1, this.host, this.port, null);
	
	this.outputStream = this.socket.openOutputStream(0, 0, 0);
	this.inputStream = this.socket.openInputStream(0, 0, 0); // 1,0,0 = OPEN_BLOCKING
	
	this.pump.init(this.inputStream, -1, -1, 0, 0, false);
	this.pump.asyncRead(this, null);
	
	return this;
};

Lwm2mDevKit.UdpClient.prototype = {

	host             : '',
	port             : -1,
	
	localAddr        : null,
	
	callback         : null,
	ended            : false,
	
	transportService : null,
	pump             : null,
	socket           : null,
	outputStream     : null,
	inputStream      : null,
	sis : null,
	
	lastSend : null,
	
	register : function(myCB) {
		this.callback = myCB;
	},
	
	// stream observer functions
	onStartRequest : function(request, context) {
		;
	},
	
	onStopRequest : function(request, context, status) {
		if (!this.ended) {
			this.shutdown();
			Lwm2mDevKit.logError(new Error('Host/network unreachable'), true);
		} else {
			Lwm2mDevKit.logWarning('Illegal state');
		}
	},
	
	onDataAvailable : function(request, context, inputStream, offset, count) {
		try {
			// inputStream is for native code only, hence, using nsIScriptableInputStream
			var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			sis.init(inputStream);
			
			// read() cannot handle zero bytes in strings, readBytes() coming in FF4
			var byteArray = new Array(count);
			for (let i=0; i<count; i++) {
				//var ch = sis.readBytes(1); // FF4
				var ch = sis.read(1);
				
				byteArray[i] = ch.charCodeAt(0);
				
				// pre FF4 workaround
				if (isNaN(byteArray[i])) byteArray[i] = 0x00;
				
				//showByte(byteArray[i])
			}
			
			if (this.callback) this.callback(byteArray);
			
		} catch( ex ) {
			Lwm2mDevKit.logError(ex);
		}
	},
	
	// UdpClient functions
	shutdown : function() {
		// will also trigger onStopRequest()
		this.ended = true;
		this.outputStream.close();
		this.inputStream.close();
		this.socket.close(0);
	},
	
	send : function(datagram) {
		
		if (this.ended) return;
		
		// the transport API also concatenates outgoing datagrams when sent too quickly
		let since = new Date() - this.lastSend;
		if (since<30) {
			var that = this;
			window.setTimeout(
					function() { Lwm2mDevKit.myBind(that,that.send(datagram)); },
					30-since);
			return;
		}
		
		this.lastSend = new Date();
			
		try {
			this.outputStream.write(datagram, datagram.length);
		} catch (ex) {
			Lwm2mDevKit.logError(ex);
		}
	},
	
	getAddr : function() {

		try {
			this.localAddr = this.socket.getScriptableSelfAddr();
			return this.localAddr;
		} catch (ex) {
			return null;
		}
	},
	
	setTimeout : function(time) {
		this.socket.setTimeout(this.socket.TIMEOUT_READ_WRITE, time);
	}
};
