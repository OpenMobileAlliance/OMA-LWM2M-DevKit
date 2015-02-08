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

Lwm2mDevKit.Tooltips = { };

Lwm2mDevKit.Tooltips.enabled = true;
Lwm2mDevKit.Tooltips.finish = false;

Lwm2mDevKit.Tooltips.steps = [
  	{
		"tool": "button_load_device",
		"tip": "Press <tt>H</tt> to \n load the next tooltip or disable tooltips in the <b>preferences</b> (upper right \n corner).",
		"action": function() { this.hidePopup(); Lwm2mDevKit.Tooltips.nextStep(); },
		"offsetx": 180
	},
	{ // 1
		"tool": "button_load_device",
		"tip": "First \n load a virtual <b>LWM2M Client</b>. \n Press <tt>E</tt> to directly load the Example Client.",
		"action": function() { document.getElementById('example_client').click(); }
	},
	{ // 2
		"tool": "tree_device",
		"tip": "This tree \n shows the available \n <b>Objects</b> and \n <b>Object Instances</b>. Browse them.",
		"action": function(event) { Lwm2mDevKit.Tooltips.clickThrough(event); }
	},
	{ // 3
		"tool": "button_registration",
		"tip": "Add the \n 'Timezone' Resource under <b>Device (3) / 0</b>. \n <tt>C</tt> toggles the rows to create Resources and Instances.",
		"offsety": 10,
		"offsety": 90
	},
	{ // 4
		"tool": "button_preferences",
		"tip": "Add an \n <b>Instance with ID 2</b> \n to the \n <b>LWM2M Server</b> Object (1).",
		"offsetx": -445,
		"offsety": 68
	},
	{ // 5
		"tool": "button_registration",
		"tip": "Open the \n <b>Registration Interface</b> to register with the LWM2M Server.",
		"action": function() { this.hidePopup(); document.getElementById('button_registration').click(); }
	},
	{ // 6
		"tool": "endpoint_name",
		"tip": "Parameters \n sent on registration: the <b>Endpoint Client Name</b> is mandatory. Press 'Register' or \n hotkey <tt>R</tt>.",
		"action": function() { this.hidePopup(); }
	},
	{ // 7
		"tool": "button_service",
		"tip": "The Client is registered. Check \n the <b>LWM2M Server</b>, \n then click 'Device \n Management &amp; \n Service En.'",
		"action": function() { document.getElementById('panel_registration').hidePopup(); document.getElementById('button_service').click(); }
	},
	{ // 8
		"tool": "log_operations",
		"tip": "Requests from \n the <b>LWM2M Server</b> are logged here. Use it to perform Read, Write, and Execute operations."
	},
	{ // 9
		"tool": "button_service",
		"tip": "Open the \n <b>Device Management \n &amp; \n Service Enablement</b> interface.",
		"action": function() { document.getElementById('button_service').click(); }
	},
	{ // 10
		"tool": "log_server_request_options",
		"tip": "Click on one \n of the operations to see the details of the CoAP messages.",
		"offsety": -100
	},
	{ // 11
		"tool": "button_reporting",
		"tip": "The 'Information Reporting' interface shows all active <b>Observe</b> operations. Open it.",
		"action": function() { document.getElementById('panel_service').hidePopup(); document.getElementById('button_reporting').click(); }
	},
	{ // 12
		"tool": "log_operations_reporting",
		"tip": "<b>Observe</b> and \n <b>Notify</b> operations \n are logged here. \n Observe a Resource from the LWM2M Server."
	},
	{ // 13
		"tool": "log_operations_reporting",
		"tip": "Click on one \n of the operations to see the details of the CoAP messages.",
		"offsetx": 200
	},
	{ // 14
		"tool": "tree_device",
		"tip": "Select the \n Object Instance of the Resource the LWM2M Server is observing."
	},
	{ // 15
		"tool": "value_resource_notify",
		"tip": "Use the \n 'Notify' button to manually trigger a notification of \n the observed \n resource.",
	},

	//"Lwm2mDevKit.Tooltips.show(Lwm2mDevKit.Tooltips.steps.length-1);"
	{ // end
		"tool": "button_load_device",
		"tip": "Done! \n Click me to \n disable tooltips. \n Use the preferences or hotkey <tt>H</tt> to change this.",
		"action": function() { Lwm2mDevKit.Tooltips.enabled = false; Lwm2mDevKit.prefManager.setBoolPref('extensions.lwm2m-devkit.show-tooltips', false); this.hidePopup(); },
		"offsetx": 180
	}
];

Lwm2mDevKit.Tooltips.clickThrough = function(event) {
	document.getElementById('tooltip').hidePopup();
	let under = document.elementFromPoint(event.clientX, event.clientY); 
	if (under.id=='tree_children') Lwm2mDevKit.onTreeClicked(event);
	//else under.click(event);
};

Lwm2mDevKit.Tooltips.show = function(step) {
	
	try {
		let tip = document.getElementById('tooltip');
		let text = document.getElementById('tooltiptext');
		let tool = document.getElementById(Lwm2mDevKit.Tooltips.steps[step]['tool']);
		
		// someone should fix .innerHTML
		let formatted = Lwm2mDevKit.htmlParser(Lwm2mDevKit.Tooltips.steps[step]['tip']);
		text.replaceChild(formatted, text.firstChild);
		
		// remove the old event listeners through clone/replace
		let newTip = tip.cloneNode(true);
		tip.parentNode.replaceChild(newTip, tip);
		tip = newTip;
		
		if (Lwm2mDevKit.Tooltips.steps[step]['action']) {
			tip.addEventListener('click', Lwm2mDevKit.Tooltips.steps[step]['action']);
		}
		
		let x = 60;
		let y = -30;
		
		if (Lwm2mDevKit.Tooltips.steps[step]['offsetx']) x += Lwm2mDevKit.Tooltips.steps[step]['offsetx'];
		if (Lwm2mDevKit.Tooltips.steps[step]['offsety']) y += Lwm2mDevKit.Tooltips.steps[step]['offsety'];
		
		tip.openPopup(tool, 'overlap', x, y, false, true, null);
	} catch (ex) {
		Lwm2mDevKit.logError(ex);
	}
};

Lwm2mDevKit.Tooltips.nextStep = function() {
	document.getElementById('tooltip').hidePopup();
	
	if (!Lwm2mDevKit.Tooltips.enabled) return;
	
	var step = -1;
	
	// rules to identify the next step
	if (Lwm2mDevKit.localAddr==null) {
		step = 0;
	} else if (Lwm2mDevKit.client==null) {
		step = 1;
	} else if (document.getElementById('box_resource_values').hidden && document.getElementById('box_object_definitions').hidden) {
		step = 2;
	} else if (Lwm2mDevKit.client.instances[3][0][15]===undefined || Lwm2mDevKit.client.instances[1][2]===undefined) {
		if ((document.getElementById('box_object_definitions').hidden && Lwm2mDevKit.client.instances[3][0][15]===undefined) || Lwm2mDevKit.client.instances[1][2]!==undefined) step = 3;
		else if ((document.getElementById('box_resource_values').hidden && Lwm2mDevKit.client.instances[1][2]===undefined) || Lwm2mDevKit.client.instances[3][0][15]!==undefined) step = 4;
		else step = 2;
	} else if (Lwm2mDevKit.registrationHandle==null) {
		if (document.getElementById('panel_registration').state=='closed') step = 5;
		else step = 6;
	} else if (Lwm2mDevKit.registrationHandle!=null && document.getElementById('log_operations').itemCount==0) {
		if (document.getElementById('panel_service').state=='closed') step = 7;
		else step = 8;
	} else if (Lwm2mDevKit.registrationHandle!=null && !document.getElementById('log_server_request_header_type').getAttribute('label')) {
		if (document.getElementById('panel_service').state=='closed') step = 9;
		else step = 10;
	} else if (Lwm2mDevKit.registrationHandle!=null && document.getElementById('log_operations_reporting').itemCount==0) {
		if (document.getElementById('panel_reporting').state=='closed') step = 11;
		else step = 12;
	} else if (Lwm2mDevKit.registrationHandle!=null && !document.getElementById('log_notify_header_type').getAttribute('label')) {
		if (document.getElementById('panel_reporting').state=='closed') step = 11;
		else step = 13;
	} else if (Lwm2mDevKit.registrationHandle!=null && (document.getElementById('box_resource_values').hidden || Lwm2mDevKit.getObjectAddress(Lwm2mDevKit.InformationReporting.relations[Object.keys(Lwm2mDevKit.InformationReporting.relations)[0]].message)[1]!=document.getElementById('object_instance_id').getAttribute('label'))) {
		step = 14;
	} else if (Lwm2mDevKit.registrationHandle!=null && !Lwm2mDevKit.Tooltips.finish) {
		step = 15;
	} else if (Lwm2mDevKit.Tooltips.finish) {
		step = Lwm2mDevKit.Tooltips.steps.length - 1;
	}
	
	Lwm2mDevKit.logEvent('Tooltip '+step);
	
	// delay execution to ensure tooltip on top of other panels
	if (step >= 0) window.setTimeout(
			function() {
				Lwm2mDevKit.Tooltips.show(step);
			}, 0);
};

Lwm2mDevKit.Tooltips.help = function() {
	
	if (!Lwm2mDevKit.Tooltips.enabled) {
		if (confirm('Enable tooltips?') ) {
			Lwm2mDevKit.Tooltips.enabled = true;
		} else {
			return;
		}
	}
	
	Lwm2mDevKit.Tooltips.nextStep();
};
