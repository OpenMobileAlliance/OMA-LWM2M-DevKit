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

Lwm2mDevKit.operationLog = [];
Lwm2mDevKit.operationReportingLog = [];

Lwm2mDevKit.resetLogger = function() {
	let rows = document.getElementById('log_messages');
	let toRemove = rows.getElementsByTagName('listitem');
	for (let r in toRemove) {
		try {rows.removeChild(toRemove[r]);} catch(ex){};
	}
};

Lwm2mDevKit.logMessage = function(message, out) {

	let rows = document.getElementById('log_messages');
	
	var item = document.createElement('listitem');
	item.setAttribute('allowevents', "true");
	item.style.backgroundColor = out ? '#AACCFF' : '#CCFFCC';

	var cell = document.createElement('listcell');
	cell.setAttribute('label', new Date().toLocaleTimeString()); // timestamp
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getType(true)+'-'+message.getCode(true)); // type
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getTID() + (message.isConfirmable() ? (' (' + message.getRetries() + ')') : ''));
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getToken(true));
	cell.tooltipText = message.getToken(true);
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getOptions(true));
	cell.tooltipText = message.getOptions(true);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getPayloadText());
	cell.tooltipText = message.getPayloadText();
	item.appendChild(cell);

	rows.appendChild( item );

	rows.ensureElementIsVisible(item);
};


Lwm2mDevKit.logOperation = function(operation, path, outcome, message) {

	let rows = document.getElementById('log_operations');
	
	let item = document.createElement('listitem');

	let cell = document.createElement('listcell');
	cell.setAttribute('label', new Date().toLocaleTimeString()); // timestamp
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', operation);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', path);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', outcome);
	item.appendChild(cell);

	rows.appendChild( item );
	
	Lwm2mDevKit.operationLog[Lwm2mDevKit.operationLog.length] = message;

	rows.ensureElementIsVisible(item);
};

Lwm2mDevKit.showOperation = function(index) {
	
	let message = Lwm2mDevKit.operationLog[index];

	document.getElementById('log_server_request_header_type').setAttribute('label', message.getType(true));
	document.getElementById('log_server_request_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('log_server_request_header_tid').setAttribute('label', message.getTID());
	document.getElementById('log_server_request_header_token').setAttribute('label', message.getToken(true));
	
	let optionList = document.getElementById('log_server_request_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	let options = message.getOptions();
	
	for (let i=0; i < options.length; i++)
    {
		if (options[i][0]=='Token') continue;
		
        let row = document.createElement('listitem');
    	row.setAttribute('allowevents', "true");
        
        let cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][0]);
        cell.setAttribute('tooltiptext', options[i][0]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label',  options[i][1] );
        cell.setAttribute('tooltiptext',  options[i][1] );
    	cell.allowevents = true;
        cell.setAttribute('id', 'log_server_request_options_'+options[i][0].toLowerCase() );
        row.appendChild(cell);

//        cell = document.createElement('listcell');
//        cell.setAttribute('label',  options[i][2] );
//        cell.setAttribute('tooltiptext',  options[i][2] );
//        row.appendChild(cell);
        
        optionList.appendChild(row);
    }
	
	document.getElementById('log_server_request_payload').style.color = 'black';
	if (message.isPrintable()) {
		document.getElementById('log_server_request_payload').value = message.getPayloadText();
	} else {
		document.getElementById('log_server_request_payload').value = Lwm2mDevKit.bytes2hexedit( message.getPayload() );
	}
	
	// LWM2M Client response
	message = message.getReply();

	document.getElementById('log_client_response_header_type').setAttribute('label', message.getType(true));
	document.getElementById('log_client_response_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('log_client_response_header_tid').setAttribute('label', message.getTID());
	document.getElementById('log_client_response_header_token').setAttribute('label', message.getToken(true));
	
	optionList = document.getElementById('log_client_response_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	options = message.getOptions();
	
	for (let i=0; i < options.length; i++)
    {
		if (options[i][0]=='Token') continue;
		
        let row = document.createElement('listitem');
    	row.setAttribute('allowevents', "true");
        
        let cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][0]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][1]);
        row.appendChild(cell);

//        cell = document.createElement('listcell');
//        cell.setAttribute('label', options[i][2]);
//        row.appendChild(cell);
        
        optionList.appendChild(row);
    }
	
	document.getElementById('log_client_response_payload').style.color = 'black';
	if (message.isPrintable()) {
		document.getElementById('log_client_response_payload').value = message.getPayloadText();
	} else {
		document.getElementById('log_client_response_payload').value = Lwm2mDevKit.bytes2hexedit( message.getPayload() );
	}
};

Lwm2mDevKit.bytes2hexedit = function(bytes) {
	
	if (bytes==null) return '';
	
	let str ='';
	let show = '';
	for (let b in bytes) {
		str += Lwm2mDevKit.Copper.leadingZero(bytes[b].toString(16));
		show += bytes[b]<32 ? '·' : String.fromCharCode(bytes[b]);
		if (b % 16 == 15) {
			str += " | ";
			str += show;
			str += '\n';
			show = '';
		} else {
			str += ' ';
		}
	}
	return str;
}



Lwm2mDevKit.logOperationReporting = function(operation, path, outcome, message) {

	let rows = document.getElementById('log_operations_reporting');
	
	let item = document.createElement('listitem');

	let cell = document.createElement('listcell');
	cell.setAttribute('label', new Date().toLocaleTimeString()); // timestamp
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', operation);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', path);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', outcome);
	item.appendChild(cell);

	rows.appendChild( item );
	
	Lwm2mDevKit.operationReportingLog[Lwm2mDevKit.operationReportingLog.length] = message;

	rows.ensureElementIsVisible(item);
};

Lwm2mDevKit.showOperationReporting = function(index) {
	
	let message = Lwm2mDevKit.operationReportingLog[index];

	document.getElementById('log_notify_header_type').setAttribute('label', message.getType(true));
	document.getElementById('log_notify_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('log_notify_header_tid').setAttribute('label', message.getTID());
	document.getElementById('log_notify_header_token').setAttribute('label', message.getToken(true));
	
	let optionList = document.getElementById('log_notify_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	let options = message.getOptions();
	
	for (let i=0; i < options.length; i++) {
		if (options[i][0]=='Token') continue;
		
        let row = document.createElement('listitem');
        
        let cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][0]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][1]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][2]);
        row.appendChild(cell);
        
        optionList.appendChild(row);
    }
	
	document.getElementById('log_notify_payload').style.color = 'black';
	if (message.isPrintable()) {
		document.getElementById('log_notify_payload').value = message.getPayloadText();
	} else {
		document.getElementById('log_notify_payload').value = Lwm2mDevKit.bytes2hexedit( message.getPayload() );
	}
};

Lwm2mDevKit.logEvent = function(text) {
	document.getElementById('log_event_log').value += text + '\n';
};

Lwm2mDevKit.logWarning = function(text) {
	window.setTimeout(
			function() { alert('WARNING: '+ text); },
			0);
};

Lwm2mDevKit.logError = function(text, skip) {
	if (Lwm2mDevKit.coapEndpoint) {
		Lwm2mDevKit.InformationReporting.cancelAll();
		Lwm2mDevKit.coapEndpoint.cancelTransactions();
	}
	window.setTimeout(
			function() { alert('ERROR: '+ text + (skip ? '' : '\n\nStacktrace:\n' + text.stack)); },
			0);
};

Lwm2mDevKit.debug = function(object) {
	let str = "";
	for (let x in object) str += x+": "+object[x]+"\n-----\n";
	alert(str);
};
