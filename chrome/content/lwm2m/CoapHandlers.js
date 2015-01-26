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
 *         Message handler functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

// CoAP message handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming messages, registered as default at TransactionHandler
Lwm2mDevKit.defaultHandler = function(message) {
	Lwm2mDevKit.logWarning(new Error('Received unexpected CoAP message:\n'+message.getSummary()));
};

//Handle ping responses
Lwm2mDevKit.pingHandler = function(message) {
	
	document.getElementById('ping_info').style.color = '#006600';
	document.getElementById('ping_info').textContent = 'The remote address \n responds to CoAP ping: CON-EMPTY/RST-EMPTY';
	
	document.getElementById('button_ping').disabled = false;
	document.getElementById('button_ping').style.backgroundColor = '#00CC00';
	document.getElementById('button_ping').style.borderColor = '#00CC00';
	document.getElementById('button_ping').label = 'Ready';
	
};

// Handle messages with block-wise transfer
Lwm2mDevKit.blockwiseHandler = function(message) {
	
	if (message.isOption(Lwm2mDevKit.Copper.OPTION_BLOCK1)) {
		
		// block size negotiation
		let size = message.getBlock1Size();
		if (Lwm2mDevKit.behavior.blockSize!=0 && Lwm2mDevKit.behavior.blockSize < size) {
			size = Lwm2mDevKit.behavior.blockSize;
		}
		// calculate offset first to continue with correct num (if block size differs)
		let offset = message.getBlock1Size() * (message.getBlock1Number() + 1);
		let num = offset/size;
		
		if (message.isSuccess() && Lwm2mDevKit.uploadBlocks!=null && offset < Lwm2mDevKit.uploadBlocks.length) {

			// automatically count up
			document.getElementById('debug_option_block1').value = num;
			if (offset+size < Lwm2mDevKit.uploadBlocks.length) document.getElementById('debug_option_block1').value += '+';
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked ) {
				Lwm2mDevKit.sendBlockwise1(document.location.href, num, size);
				return;
			}
		} else {
			// finished
			Lwm2mDevKit.uploadMethod = 0;
			Lwm2mDevKit.uploadBlocks = null;

			// call custom callback
			if (Lwm2mDevKit.uploadHandler) {
				Lwm2mDevKit.uploadHandler(message);
				Lwm2mDevKit.uploadHandler = null;
			}
		}
	}

	if (message.isOption(Lwm2mDevKit.Copper.OPTION_BLOCK)) {
		if (message.getBlockMore()) {
			
			// block size negotiation
			let size = Lwm2mDevKit.negotiateBlockSize(message);
			let offset = message.getBlockOffset();
			let num = offset/size;
			
			// automatically count up
			document.getElementById('debug_option_block2').value = num;				
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked) {
				Lwm2mDevKit.sendBlockwise2(document.location.href, num, size);
			}
		} else {
			// finished
			Lwm2mDevKit.downloadMethod = 0;
			
			if (message.getContentFormat()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
				Lwm2mDevKit.updateResourceLinks( Lwm2mDevKit.parseLinkFormat( document.getElementById('packet_payload').value ) );
			}
			
			// call custom callback
			if (Lwm2mDevKit.downloadHandler) {
				Lwm2mDevKit.downloadHandler(message);
				Lwm2mDevKit.downloadHandler = null;
			}
		}
	}
	
};

Lwm2mDevKit.serverHandler = function(message) {
	Lwm2mDevKit.logEvent('INFO: Received a request for ' + message.getUri() );
	
	if (message.getUri()=="/.well-known/core") {
		message.respond(Lwm2mDevKit.Copper.CODE_2_05_CONTENT, Lwm2mDevKit.getSerializedObject(), Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT);
		return;
	}
	
	if (!message.getUri().startsWith(Lwm2mDevKit.client.root)) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		return;
	}
	
	// TODO do blockwise here and only forward complete requests
	
	Lwm2mDevKit.DeviceManagement.operationHandler(message);
}


