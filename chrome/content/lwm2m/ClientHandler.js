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
 * \author Prasad Pulikal <prasad.pulikal@inf.ethz.ch>
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Lwm2mDevKit.objectDefinitions = null;
Lwm2mDevKit.client = null;

Lwm2mDevKit.loadDefaultLWM2MDevice = function() {

	Components.utils.import("resource://gre/modules/NetUtil.jsm");

	let objectDefinitionsFile = "resource://objects/lwm2m-object-definitions.json";
	let clientFile = "resource://clients/example-client.json";
	
	NetUtil.asyncFetch(objectDefinitionsFile, function(inputStream, status) {
		if (!Components.isSuccessCode(status)) {
			Lwm2mDevKit.logError(new Error("Object definitions could not be loaded [loadDefaultLWM2MDevice]"));
			return;
		}

		let data = Lwm2mDevKit.utf8Entities( NetUtil.readInputStreamToString(inputStream, inputStream.available(), {"charset": "UTF-8"}) );
		try {
			Lwm2mDevKit.objectDefinitions = JSON.parse(data);
		} catch (ex) {
			ex.message = "Cannot load Objects from " + objectDefinitionsFile + ":\n\n" + ex.message;
			Lwm2mDevKit.logError(ex, true);
		}
	});

	NetUtil.asyncFetch(clientFile, function(inputStream, status) {
		if (!Components.isSuccessCode(status)) {
			// Handle error!
			Lwm2mDevKit.logError(new Error("Virtual client could not be loaded [loadDefaultLWM2MDevice]"));
			return;
		}

		let data = Lwm2mDevKit.utf8Entities( NetUtil.readInputStreamToString(inputStream, inputStream.available(), {"charset": "UTF-8"}) );

		try {
			Lwm2mDevKit.client = JSON.parse(data);
			
			// in try block to discontinue if parsing fails
			
			Lwm2mDevKit.setClientProperties();
			Lwm2mDevKit.clearTree();
			Lwm2mDevKit.setTree();
	
			Lwm2mDevKit.activateButtons();
		} catch (ex) {
			ex.message = "Cannot load Client from " + clientFile + ":\n\n" + ex.message;
			Lwm2mDevKit.logError(ex, true);
		}
	});
};

Lwm2mDevKit.activateButtons = function() {
	if (Lwm2mDevKit.client) {
		document.getElementById('button_registration').disabled = false;
	} else {
		document.getElementById('button_registration').disabled = true;
	}
	if (Lwm2mDevKit.registrationHandle!=null) {
		document.getElementById('button_service').disabled = false;
	} else {
		document.getElementById('button_service').disabled = true;
	}
	if (Lwm2mDevKit.registrationHandle!=null) {
		document.getElementById('button_reporting').disabled = false;
	} else {
		document.getElementById('button_reporting').disabled = true;
	}
	Lwm2mDevKit.Tooltips.nextStep();
};

Lwm2mDevKit.setClientProperties = function() {
	Lwm2mDevKit.set('endpoint_name', Lwm2mDevKit.client.endpointClientName);
	Lwm2mDevKit.set('lifetime', Lwm2mDevKit.client.lifetime);
	Lwm2mDevKit.set('version', Lwm2mDevKit.client.version);
	
	// set object instance data
	Lwm2mDevKit.client.instances[0][1][0] = 'coap://' + Lwm2mDevKit.hostname + ':' + Lwm2mDevKit.port;
	Lwm2mDevKit.client.instances[1][1][1] = Lwm2mDevKit.client.lifetime;
};

Lwm2mDevKit.clearTree = function() {
	let elems = document.getElementById('tree_children');
	while (elems.hasChildNodes()) {
		elems.removeChild(elems.firstChild);
	}
};

Lwm2mDevKit.setTree = function() {

	let treeChildren = document.getElementById("tree_children");

	let objects = Lwm2mDevKit.client.objects;
	let definitions = Lwm2mDevKit.objectDefinitions;

	var rootItem = document.createElement("treeitem");
	rootItem.setAttribute('container', 'true');
	rootItem.setAttribute('open', 'true');

	var rootRow = document.createElement("treerow");
	var rootCell = document.createElement("treecell");
	rootCell.setAttribute('properties', 'client');
	rootCell.setAttribute('label', Lwm2mDevKit.client.endpointClientName + ' (' + Lwm2mDevKit.client.root + ')');

	var rootCellTooltip = document.createElement("treecell");
	rootCellTooltip.setAttribute('value', 'The LWM2M resources are not required to be in the root.');

	rootRow.appendChild(rootCell);
	rootRow.appendChild(rootCellTooltip);
	rootItem.appendChild(rootRow);

	let rootTreeChildren = document.createElement("treechildren");

	for (let i in objects) {

		let clientObjectDefinitions = definitions[i];
		let instance = Lwm2mDevKit.client.instances[objects[i]];

		let treeItem = document.createElement("treeitem");
		treeItem.setAttribute('container', 'true');
		treeItem.setAttribute('open', 'true');

		let treeRow = document.createElement("treerow");
		let treeCell = document.createElement("treecell");
		treeCell.setAttribute('properties', 'objects');
		treeCell.setAttribute('label', definitions[i].name + ' (' + i + ')' );
		treeCell.setAttribute('value', i);

		let treeCellTooltip = document.createElement("treecell");
		treeCellTooltip.setAttribute('value', Lwm2mDevKit.client.root + i);
		
		treeRow.appendChild(treeCell);
		treeRow.appendChild(treeCellTooltip);
		treeItem.appendChild(treeRow);

		let subTreeChildren = document.createElement("treechildren");
		
		for (let key in instance) {
			let subTreeItem = document.createElement("treeitem");
			let subTreeRow = document.createElement("treerow");
			
			let subTreeCell = document.createElement("treecell");
			subTreeCell.setAttribute('properties', 'instances');
			subTreeCell.setAttribute('label', key);
			subTreeCell.setAttribute('value', i + '/' + key);

			let subTreeCellTooltip = document.createElement("treecell");
			subTreeCellTooltip.setAttribute('value', Lwm2mDevKit.client.root + i + '/' + key);
			
			subTreeRow.appendChild(subTreeCell);
			subTreeRow.appendChild(subTreeCellTooltip);
			subTreeItem.appendChild(subTreeRow);
			subTreeChildren.appendChild(subTreeItem);
			treeItem.appendChild(subTreeChildren);
		}

		rootTreeChildren.appendChild(treeItem);
	}
	rootItem.appendChild(rootTreeChildren);
	treeChildren.appendChild(rootItem);
};

Lwm2mDevKit.onTreeClicked = function(event) {
	
	let tree = document.getElementById("tree_device");

	// get the row, col and child element at the point
	let row = {}, col = {}, child = {};
	
	tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
	
	// not a data element
	
	if (row.value < 0) return;

	let ids = tree.view.getCellValue(row.value, col.value).split('/');
	
	if (Lwm2mDevKit.objectDefinitions[ids[0]] !== undefined) {
		if (ids[1] === undefined) {
			Lwm2mDevKit.showObjectScreen(ids[0]);
		} else {
			Lwm2mDevKit.showInstanceScreen(ids[0], ids[1]);
		}
	}
};

Lwm2mDevKit.onTreeHover = function(event) {
	
	let tree = document.getElementById("tree_device");

	// get the row, col and child element at the point
	let row = { }, col = { }, child = { };
	tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
	
	if (col.value) {
		document.getElementById('tree_children').setAttribute('tooltiptext', tree.view.getCellValue(row.value, col.value.getNext()));
	}
};

Lwm2mDevKit.showObjectScreen = function(obj) {
	document.getElementById('box_startup').hidden = true;
	
	document.getElementById('box_object_instance').hidden = true;
	document.getElementById('box_resource_values').hidden = true;
	Lwm2mDevKit.showObjectDefinition(obj);
	Lwm2mDevKit.showResourceDefinitions(obj);
	document.getElementById('box_object_definitions').hidden = false;
	document.getElementById('box_resource_definitions').hidden = false;
}

Lwm2mDevKit.showObjectDefinition = function(obj) {
	
	let definition = Lwm2mDevKit.objectDefinitions[obj];
	
	document.getElementById("object_id").setAttribute('label', obj);
	document.getElementById("object_name").setAttribute('label', definition.name);
	document.getElementById("object_mandatory").setAttribute('label', definition.mandatory);
	document.getElementById("object_instances").setAttribute('label', definition.instancetype);
	document.getElementById("object_desc").setAttribute('label', definition.description);
	document.getElementById("object_desc").setAttribute('tooltiptext', definition.description);
	
	let cell = document.getElementById('object_instantiate');
	while (cell.firstChild) {
		cell.removeChild(cell.firstChild);
	}
	// add field for Instance ID
	let multi = false;
	if (Lwm2mDevKit.objectDefinitions[obj]['instances']=='multiple') {
		let input = document.createElement('textbox');
		input.setAttribute('size', '1');
		input.setAttribute('class', 'resvalue');
		input.setAttribute('type', 'number');
		input.setAttribute('id', 'object_instantiate_'+obj);
		input.setAttribute('value', parseInt(Object.keys(Lwm2mDevKit.client.instances[obj]).pop())+1);
		
		cell.appendChild(input);
		multi = true;
	}
	// button
	if (Lwm2mDevKit.objectDefinitions[obj]['instances']=='multiple' ||
		Lwm2mDevKit.client.instances[obj]===undefined ||
		Lwm2mDevKit.client.instances[obj][0]===undefined) {
		
		let input = document.createElement('button');
		input.setAttribute('flex', '1');
		input.setAttribute('label', 'Create Object Instance');
		input.addEventListener('command',  function() {
				Lwm2mDevKit.createInstance(obj, multi ? document.getElementById('object_instantiate_'+obj).value : 0);
				Lwm2mDevKit.showObjectDefinition(obj);
			});
		cell.appendChild(input);
	}
};

Lwm2mDevKit.showResourceDefinitions = function(obj) {

	let resourcedefs = Lwm2mDevKit.objectDefinitions[obj].resourcedefs;
	let rows = document.getElementById('resource_definitions');

	// clear
	let elems = rows.getElementsByTagName('row');
	while (elems && elems.length > 1) {
		rows.removeChild(elems[1]);
	}

	rows.setAttribute('rows', resourcedefs.length);

	for (let i in resourcedefs) {

		var row = document.createElement('row');
		row.style.borderBottom = '1px solid silver';
		
		let cell = document.createElement('listcell');
		cell.setAttribute('label', i);
		cell.style.textAlign = 'center';
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].name);
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].instancetype);
		cell.style.textAlign = 'center';
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].mandatory);
		cell.style.textAlign = 'center';
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].operations);
		cell.style.textAlign = 'center';
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].type);
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].range);
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		cell.setAttribute('label', resourcedefs[i].units);
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		let box = document.createElement('description');
		box.setAttribute('flex', '1');
		box.setAttribute('style', 'padding: 8px 0 9px 0; white-space: pre-wrap;');
		box.textContent = Lwm2mDevKit.htmlEntities(resourcedefs[i].description);
		cell.appendChild(box);
		row.appendChild(cell);

		rows.appendChild(row);
	}
	
	row.style.borderBottom = '';
};

Lwm2mDevKit.showInstanceScreen = function(obj, ins) {
	document.getElementById('box_startup').hidden = true;
	
	document.getElementById('box_object_definitions').hidden = true;
	document.getElementById('box_resource_definitions').hidden = true;
	Lwm2mDevKit.showObjectInstance(obj, ins);
	Lwm2mDevKit.showResourceValues(obj, ins);
	document.getElementById('box_object_instance').hidden = false;
	document.getElementById('box_resource_values').hidden = false;
}

Lwm2mDevKit.showObjectInstance = function(obj, ins) {
	
	let objectName = Lwm2mDevKit.objectDefinitions[obj].name;

	document.getElementById("object_instance_parent_id").setAttribute('label', obj);
	document.getElementById("object_instance_id").setAttribute('label', ins);
	document.getElementById("object_instance_name").setAttribute('label', objectName);
	
	let attribs = '';
	if (Lwm2mDevKit.client.attributes[obj]!==undefined) {
		
		for (let a in Lwm2mDevKit.client.attributes[obj]) {
			if (Lwm2mDevKit.isNumeric(a)) continue;
			attribs += a + '=' + Lwm2mDevKit.client.attributes[obj][a] + '&';
		}
		
		if (attribs.lastIndexOf("&") == attribs.length - 1) {
			attribs =  attribs.substring(0, attribs.length - 1);
		}
	}
	document.getElementById("object_instance_object_attribs").setAttribute('label', attribs);
	
	attribs = '';
	if (Lwm2mDevKit.client.attributes[obj]!==undefined &&
		Lwm2mDevKit.client.attributes[obj][ins]!==undefined) {
		
		for (let a in Lwm2mDevKit.client.attributes[obj][ins]) {
			if (Lwm2mDevKit.isNumeric(a)) continue;
			attribs += a + '=' + Lwm2mDevKit.client.attributes[obj][ins][a] + '&';
		}
		
		if (attribs.lastIndexOf("&") == attribs.length - 1) {
			attribs =  attribs.substring(0, attribs.length - 1);
		}
	}
	document.getElementById("object_instance_instance_attribs").setAttribute('label', attribs);
};

Lwm2mDevKit.showResourceValues = function(obj, ins) {

	let resourcedefs = Lwm2mDevKit.objectDefinitions[obj].resourcedefs;
	let resources = Lwm2mDevKit.client.instances[obj][ins];
	let rows = document.getElementById('resource_values');

	// clear
	let elems = rows.getElementsByTagName('row');
	while (elems && elems.length > 1) {
		rows.removeChild(elems[1]);
	}
	
	rows.setAttribute('rows', resources.length);
	
	let row;
	
	for (let res in resourcedefs) {
		
		if (resources[res]!==undefined) {
			
			let attribs = '';
			if (Lwm2mDevKit.client.attributes[obj]!==undefined &&
				Lwm2mDevKit.client.attributes[obj][ins]!==undefined &&
				Lwm2mDevKit.client.attributes[obj][ins][res]!==undefined) {
				
				for (let a in Lwm2mDevKit.client.attributes[obj][ins][res]) {
					if (Lwm2mDevKit.isNumeric(a)) continue;
					attribs += a + '=' + Lwm2mDevKit.client.attributes[obj][ins][res][a] + '&';
				}
				
				if (attribs.lastIndexOf("&") == attribs.length - 1) {
					attribs =  attribs.substring(0, attribs.length - 1);
				}
			}
			
			let value = resources[res];
			
			if (Lwm2mDevKit.isObject(value)) {
				let flag = false;
				for (let id in value) {
					
					rows.appendChild(
							Lwm2mDevKit.addResourceRow(
									flag ? '' : resourcedefs[res].name,
									value[id],
									attribs,
									obj,
									ins,
									res,
									id ));
					flag = true;
				}
				
				// new instance
				row = Lwm2mDevKit.addNewResourceRow(obj, ins, res, flag);
				
			} else {
				row = Lwm2mDevKit.addResourceRow(
								resourcedefs[res].name,
								value,
								attribs,
								obj,
								ins,
								res );
				//TODO: Change "No Attributes defined string to empty once testing done"
			}
		} else {
			row = Lwm2mDevKit.addNewResourceRow(obj, ins, res);
		}
		rows.appendChild(row);
	}
	row.style.borderBottom = '';
};

Lwm2mDevKit.addResourceRow = function(name, value, attributes, obj, ins, res, id) {

	let row = document.createElement('row');
	row.style.borderBottom = '1px solid silver';

	let cell = document.createElement('listcell');
	cell.setAttribute('label', name ? res : '');
	cell.style.textAlign = 'center';
	row.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', name);
	row.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', id ? id : '');
	cell.style.textAlign='center';
	row.appendChild(cell);

	cell = document.createElement('listcell');
	let type = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].type;
	
	var input = document.createElement('textbox');
	input.setAttribute('flex', '1');
	input.setAttribute('class', 'resvalue');
	input.setAttribute('value', value);
	input.addEventListener('focus', function () { this.style.borderColor='rgb(221, 66, 120)'; this.style.boxShadow='0 0 8px rgba(187, 60, 66, 1)'; });
	input.addEventListener('blur', function () { this.style.borderColor=''; this.style.backgroundColor='';this.style.boxShadow=''; });
	input.addEventListener('change', function () { Lwm2mDevKit.changeResource(this, obj, ins, res, id); });
	cell.appendChild(input);
	row.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', attributes);
	row.appendChild(cell);

	cell = document.createElement('listcell');
	
	if ( Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('R')!=-1) {
		cell.pack = "center";
		var button = document.createElement('button');
		button.setAttribute('class', 'special-button');
		button.setAttribute('label', 'Notify');
		button.addEventListener('command', function() { Lwm2mDevKit.InformationReporting.notify([obj,ins,res].join('/')); });
		cell.appendChild(button);
	}
	row.appendChild(cell);

	return row;
};

Lwm2mDevKit.addNewResourceRow = function(obj, instanceID , resID, instanceOnly) {

	let resourcedef = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[resID];
	let resources = Lwm2mDevKit.client.instances[obj][instanceID];
	let multi = resourcedef.instancetype=='multiple';
	
	let row = document.createElement('row');
	
	if (Lwm2mDevKit.createRows) {
		row.style.borderBottom = '1px solid silver';
	
		let cell = document.createElement('listcell');
		if (!instanceOnly) {
			cell.setAttribute('label', resID);
			cell.style.textAlign='center';
		}
		row.appendChild(cell);
	
		cell = document.createElement('listcell');
		if (!instanceOnly) {
			cell.setAttribute('label', resourcedef.name);
		}
		row.appendChild(cell);
		
		cell = document.createElement('listcell');
		if (multi) {
			let resIns = 0;
			if (resources[resID]!==undefined) {
				resIns = parseInt(Object.keys(resources[resID]).pop());
				do {
					++resIns;
				} while (resources[resID][resIns]!==undefined);
			}
			let input = document.createElement('textbox');
			input.setAttribute('id', "resource_instantiate_"+obj+"_"+instanceID+"_"+resID);
			input.setAttribute('flex', '1');
			input.setAttribute('class', 'resvalue');
			input.setAttribute('type', 'number');
			input.setAttribute('value', resIns);
			cell.appendChild(input);
		}
		row.appendChild(cell);
	
		cell = document.createElement('listcell');
		cell.style.textAlign = 'center';
		let input = document.createElement('button');
		input.setAttribute('flex', '1');
		input.setAttribute('class', 'resvalue');
		input.style.margin = '5px 0px 5px 0px';
		input.setAttribute('label', 'Add Resource' + (instanceOnly ? ' Instance' : ''));
		input.addEventListener('command', function() { Lwm2mDevKit.createResource(obj, instanceID, resID, multi ? document.getElementById('resource_instantiate_'+obj+'_'+instanceID+'_'+resID).value : null); });
		cell.appendChild(input);
		row.appendChild(cell);
	
		cell = document.createElement('listcell');
		row.appendChild(cell);
	
		cell = document.createElement('listcell');
		row.appendChild(cell);
	}

	return row;
};

Lwm2mDevKit.changeResource = function(field, obj, ins, res, id) {

	if (Lwm2mDevKit.client.instances[obj]!==undefined ||
		Lwm2mDevKit.client.instances[obj][ins]!==undefined ||
		Lwm2mDevKit.client.instances[obj][ins][res]!==undefined) {
		
		let value = field.value;
		let old = null;
		let blocked = false;
		let type = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].type.toLowerCase();
		
		switch (type) {
		case "string":
			// done
			break;
		case "integer":
		case "float":
			value = Number(value);
			break;
		case "boolean":
			value = Boolean(value);
			break;
		case "opaque":
			// TODO
			break;
		case "time":
			value = parseInt(new Date(value).getTime() / 1000);
			break;
		default:
			if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('E')!=-1) {
				// users should be able to define an action for executable Resources
				// they can only be defined by the user through the GUI
				try {
					// check the syntax
					Function(value);
					Lwm2mDevKit.logWarning("This code will be executed on operation Execute");
				} catch (ex) {
					blocked = true;
					Lwm2mDevKit.logWarning(ex);
				}
			} else {
				Lwm2mDevKit.logError(new Error("Unknown data type '"+type+"'"));
			}
		}
		
		if (id && Lwm2mDevKit.isObject(Lwm2mDevKit.client.instances[obj][ins][res])) {
			old = Lwm2mDevKit.client.instances[obj][ins][res][id];
		} else {
			old = Lwm2mDevKit.client.instances[obj][ins][res];
		}
		
		if (old!=value) {
			
			// special values
			if (obj==1 && ins==1 && res==1) {
				Lwm2mDevKit.logEvent('Lifetime change');
				Lwm2mDevKit.client.lifetime = parseInt(value);
				Lwm2mDevKit.set('lifetime', Lwm2mDevKit.client.lifetime);
			} else if ((obj==1 && ins==1 && res==7) || (obj==3 && ins==0 && res==16)) {
				Lwm2mDevKit.logEvent('Binding change blocked');
				blocked = true;
			} else if (obj==3 && ins==0 && res==3) {
				Lwm2mDevKit.logEvent('Version change');
				Lwm2mDevKit.client.version = value;
				Lwm2mDevKit.set('version', Lwm2mDevKit.client.version);
			}
			
			if (blocked) {
				field.value = old;
				window.setTimeout( function() {
					field.style.color = 'white';
					field.style.borderColor = 'black';
					field.style.backgroundColor = 'rgb(187, 60, 66)';
					field.style.boxShadow = '0 0 8px rgba(187, 60, 66, 1)';
					
					window.setTimeout( function() {
						field.style.color = '';
						field.style.borderColor = '';
						field.style.backgroundColor = '';
						field.style.boxShadow = '';
					}, 500);
				}, 1);
			} else {
				if (id && Lwm2mDevKit.isObject(Lwm2mDevKit.client.instances[obj][ins][res])) {
					Lwm2mDevKit.client.instances[obj][ins][res][id] = value;
				} else {
					Lwm2mDevKit.client.instances[obj][ins][res] = value;
				}
				
				window.setTimeout( function() {
					field.style.borderColor = 'rgb(40, 180, 80)';
					field.style.boxShadow = '0 0 8px rgba(80, 245, 200, 1)';
					
					window.setTimeout( function() {
						field.style.borderColor = '';
						field.style.boxShadow = '';
					}, 500);
				}, 1);
				
				Lwm2mDevKit.InformationReporting.notify([obj, ins, res].join('/'));
			}
		}
	}
};

Lwm2mDevKit.createResource = function(obj, ins, res, resIns) {

	if (Lwm2mDevKit.client.instances[obj]===undefined ||
		Lwm2mDevKit.client.instances[obj][ins]===undefined) {
		
		Lwm2mDevKit.logError(new Error("Cannot create Resource for non-existing Object Instance"));
		return;
	}
	
	if (resIns) {
		if (Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
			Lwm2mDevKit.client.instances[obj][ins][res] = new Object();
		}
		if (Lwm2mDevKit.client.instances[obj][ins][res][resIns]!==undefined) {
			Lwm2mDevKit.logError(new Error("Resource Instance already exists"));
			return;
		}
		Lwm2mDevKit.client.instances[obj][ins][res][resIns] = '';
	} else {
		if (Lwm2mDevKit.client.instances[obj][ins][res]!==undefined) {
			Lwm2mDevKit.logError(new Error("Resource already exists"));
			return;
		}
		Lwm2mDevKit.client.instances[obj][ins][res] = '';
	}
	
	// update view
	Lwm2mDevKit.showResourceValues(obj, ins);
	
	Lwm2mDevKit.Tooltips.nextStep();
};

Lwm2mDevKit.createInstance = function(obj, ins, data) {
	
	obj = Number(obj);
	
	if (Lwm2mDevKit.client.objects.indexOf(obj)==-1) {
		Lwm2mDevKit.logError(new Error("Object not supported by client"));
		return false;
	} else if (Lwm2mDevKit.objectDefinitions[obj].instancetype=='single' && Lwm2mDevKit.client.instances[obj]!==undefined && Lwm2mDevKit.client.instances[obj].length>0) {
		Lwm2mDevKit.logWarning(new Error("Cannot create more than one single Object Instance"));
		return false;
	}
	
	if (Lwm2mDevKit.client.instances[obj]===undefined) {
		Lwm2mDevKit.client.instances[obj] = new Object();
	}
	
	if (Lwm2mDevKit.client.instances[obj][ins]!==undefined) {
		Lwm2mDevKit.logError(new Error("Instance " + ins + " of " + Lwm2mDevKit.objectDefinitions[obj].name + " already exists"));
		return false;
	}
	
	if (data!=null) {
		Lwm2mDevKit.client.instances[obj][ins] = data;
	} else {
		Lwm2mDevKit.client.instances[obj][ins] = new Object();
	}
	
	// update tree
	Lwm2mDevKit.clearTree();
	Lwm2mDevKit.setTree();
	
	Lwm2mDevKit.Tooltips.nextStep();
	return true;
};

Lwm2mDevKit.deleteInstance = function(obj, ins) {
	
	if (Lwm2mDevKit.objectDefinitions[obj].instancetype=='single' && Lwm2mDevKit.objectDefinitions[obj].mandatory) {
		Lwm2mDevKit.logWarning(new Error("Cannot delete single mandatory Object Instance"));
		return false;
	}
	
	delete Lwm2mDevKit.client.instances[obj][ins];
	Lwm2mDevKit.clearTree();
	Lwm2mDevKit.setTree();
	return true;
};

/*
 * returns the serialized object String id - object id null for root
 */
Lwm2mDevKit.getSerializedObject = function(obj) {
	let serialized = "";

	var objects = [];
	if (obj == null) {
		// root with all objects
		objects = Lwm2mDevKit.client.objects;
	} else {
		// if not root
		objects[0] = obj;
	}

	for (let i = 0; i < objects.length; i++) {

		let instances = Lwm2mDevKit.client.instances[objects[i]];
		let count = 0;
		for (let key in instances) {

			if (instances.hasOwnProperty(key)
					&& key.indexOf("attributes") == -1) {
				if (instances.hasOwnProperty(key)
						&& key.indexOf("attributes") == -1) {
					serialized += "</" + objects[i] + "/" + key + ">" + ",";
				}
			}
			count++;
		}

		// Add an empty object if no instances of an object present in the client
		if (count == 0) {
			serialized += "</" + objects[i] + ">,";
		}
	}

	if (serialized.lastIndexOf(",") == serialized.length - 1) {
		return serialized.substring(0, serialized.length - 1);
	}

	return serialized;
};

Lwm2mDevKit.enableCreateRows = function() {
	if (Lwm2mDevKit.createRows) {
		alert("Disabling interface to create Instances and Resources.\nPress 'C' again to re-enable.");
		Lwm2mDevKit.createRows = false;
	} else {
		alert("Enabling interface to create Instances and Resources.\nPress 'C' again to disable.");
		Lwm2mDevKit.createRows = true;
	}
	
	Lwm2mDevKit.prefManager.setBoolPref('extensions.lwm2m-devkit.show-create-rows', Lwm2mDevKit.createRows);
	
	if (!document.getElementById('box_resource_values').hidden) {
		let obj = parseInt(document.getElementById("object_instance_parent_id").getAttribute('label'));
		let ins = parseInt(document.getElementById("object_instance_id").getAttribute('label'));
		
		Lwm2mDevKit.showResourceValues(obj, ins);
	}
};
