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

Lwm2mDevKit.DeviceManagement = {};

Lwm2mDevKit.DeviceManagement.operationHandler = function(message) {
	
	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
		
	if (message.getCode()==Lwm2mDevKit.Copper.GET && message.getContentFormat()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		Lwm2mDevKit.DeviceManagement.handleDiscover(message);
		return;
	} else if (obj===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_05_METHOD_NOT_ALLOWED);
		return;
	} else if (Lwm2mDevKit.client.instances[obj]===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		return;
	}
	
	switch (message.getCode()) {
	case Lwm2mDevKit.Copper.GET:
		Lwm2mDevKit.DeviceManagement.handleRead(message);
		break;
	case Lwm2mDevKit.Copper.POST:
		if (ins===undefined || Lwm2mDevKit.client.instances[obj][ins]===undefined) {
			// no Object Instance
			Lwm2mDevKit.DeviceManagement.handleCreate(message);
		} else if (res!==undefined && Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('E')!=-1) {
			// executable Resource
			Lwm2mDevKit.DeviceManagement.handleExecute(message);
		} else {
			Lwm2mDevKit.DeviceManagement.handleWrite(message);
		}
		break;
	case Lwm2mDevKit.Copper.PUT:
		if (message.getUriQuery()) {
			Lwm2mDevKit.DeviceManagement.handleWriteAttributes(message);
		} else {
			Lwm2mDevKit.DeviceManagement.handleWrite(message);
		}
		break;
	case Lwm2mDevKit.Copper.DELETE:
		if (ins!==undefined && res===undefined) {
			Lwm2mDevKit.DeviceManagement.handleDelete(message);
			break;
		} // else fall through to default
	default:
		message.respond(Lwm2mDevKit.Copper.CODE_4_05_METHOD_NOT_ALLOWED);
		break;
	}
};

Lwm2mDevKit.DeviceManagement.handleRead = function(message) {
	
	if (message.getObserve()==null) {
		Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Read on '+ message.getUriPath());
	}

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	let pl = null;
	let cf = null;
	
	if (ins===undefined) {
		if (Lwm2mDevKit.client.instances[obj]===undefined) {
			message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
			Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Not Found", message);
			return;
		}
		
		if (message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
			pl = Lwm2mDevKit.JSON.encode( Lwm2mDevKit.client.instances[obj], obj );
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON;
		} else {
			pl = Lwm2mDevKit.TLV.encode( Lwm2mDevKit.client.instances[obj], obj );
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV;
		}
		
	} else if (res===undefined) {
		if (Lwm2mDevKit.client.instances[obj][ins]===undefined) {
			message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
			Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Not Found", message);
			return;
		}
		
		if (message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
			pl = Lwm2mDevKit.JSON.encode( Lwm2mDevKit.client.instances[obj][ins], obj, ins );
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON;
		} else {
			pl = Lwm2mDevKit.TLV.encode( Lwm2mDevKit.client.instances[obj][ins], obj, ins );
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV;
		}
		
	} else {
		if (Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
			message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
			Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Not Found", message);
			return;
		}
		
		if (message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV
				|| Lwm2mDevKit.isObject( Lwm2mDevKit.client.instances[obj][ins][res] )) {
			
			pl = Lwm2mDevKit.TLV.encode( Lwm2mDevKit.client.instances[obj][ins][res], obj, ins, res );
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV;
			
		} else if (message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
			message.respond(Lwm2mDevKit.Copper.CODE_5_01_NOT_IMPLEMENTED, "JSON not supported yet");
			Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Not Implemented", message);
			return;
			
		} else if (message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT
				|| message.getAccept()==Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_PLAIN
				|| message.getAccept()==null) {
			pl = Lwm2mDevKit.client.instances[obj][ins][res];
			if (typeof pl === 'number') {
				pl = pl.toString();
			} else if (typeof pl === 'boolean') {
				if (pl) pl = new String(1);
				else    pl = new String(0);
			}
			cf = Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT;
			
		} else {
			message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Not Acceptable");
			Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Not Acceptable", message);
			return;
		}
		
	}
	
	message.respond(Lwm2mDevKit.Copper.CODE_2_05_CONTENT, pl, cf);
	
	if (message.getObserve()!=null) {
		Lwm2mDevKit.InformationReporting.handleObserve(message);
	} else {
		Lwm2mDevKit.logOperation("Read", message.getUriPath(), "Success", message);
	}
};

Lwm2mDevKit.DeviceManagement.handleDiscover = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Discover on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	if (Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		Lwm2mDevKit.logOperation("Discover", message.getUriPath(), "Not Found", message);
		return;
	}
	
	let pl = "";
	
	message.respond(Lwm2mDevKit.Copper.CODE_2_05_CONTENT, pl, Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT);
	
	Lwm2mDevKit.logOperation("Discover", message.getUriPath(), "Success", message);
};

Lwm2mDevKit.DeviceManagement.handleWrite = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Write on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	let cf = message.getContentFormat();
	let pl = null;
	
	// if something went wrong in routing
	if (ins===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Must specifiy Object Instance for write operation");
		Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Bad Request", message);
		return;
	}
	
	// write whole Object Instance
	if (res===undefined) {
		// if it does not exist
		if (Lwm2mDevKit.client.instances[obj][ins]===undefined) {
			message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Not Found", message);
			return;
		}
		
		if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV) {
			pl = Lwm2mDevKit.TLV.decode(message.getPayload(), obj, ins);
		} else if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
			message.respond(Lwm2mDevKit.Copper.CODE_5_01_NOT_IMPLEMENTED, "JSON not supported yet");
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Not Implemented", message);
			return;
		} else {
			message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Use TLV to write Object Instances");
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Unsupported Content-Format", message);
			return;
		}
		
		if (message.getCode()==Lwm2mDevKit.Copper.POST) {
			Lwm2mDevKit.DeviceManagement.partialUpdate(pl, obj, ins);
		} else {
			Lwm2mDevKit.DeviceManagement.replace(pl, obj, ins);
		}
	
	// write Resource
	} else {
		// if it does not exist
		if (Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
			message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Not Found", message);
			return;
		}
		
		if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV) {
			
			pl = Lwm2mDevKit.TLV.decode(message.getPayload(), obj, ins, res);
			
		} else if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
			message.respond(Lwm2mDevKit.Copper.CODE_5_01_NOT_IMPLEMENTED, "JSON not supported yet");
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Not Implemented", message);
			return;
		
		} else if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_PLAIN || cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT) {
			// does not work for Resource Instances
			if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].instancetype=="multiple") {
				message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Use TLV to write Multi-Resource");
				Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Bad Request", message);
				return;
			}
			
			pl = message.getPayloadText();
		} else {
			message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Unsupported Content-Format");
			Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Unsupported Content-Format", message);
			return;
		}
		
		if (message.getCode()==Lwm2mDevKit.Copper.POST) {
			Lwm2mDevKit.DeviceManagement.partialUpdate(pl, obj, ins, res);
		} else {
			Lwm2mDevKit.DeviceManagement.replace(pl, obj, ins, res);
		}
	}
	
	message.respond(Lwm2mDevKit.Copper.CODE_2_04_CHANGED);
	Lwm2mDevKit.logOperation("Write", message.getUriPath(), "Success", message);
	
	// show the Instance
	Lwm2mDevKit.showInstanceScreen(obj, ins);
};


Lwm2mDevKit.DeviceManagement.handleWriteAttributes = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Write Attributes on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	if (Lwm2mDevKit.client.instances[obj]===undefined ||
		ins!==undefined && Lwm2mDevKit.client.instances[obj][ins]===undefined ||
		res!==undefined && Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
		
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		Lwm2mDevKit.logOperation("Write Attributes", message.getUriPath(), "Not Found", message);
		return;
	}
	
	let query = message.getUriQuery().split('&');
	
	if (res!==undefined) {
		
		if (Lwm2mDevKit.client.attributes[obj]===undefined) Lwm2mDevKit.client.attributes[obj] = new Object();
		if (Lwm2mDevKit.client.attributes[obj][ins]===undefined) Lwm2mDevKit.client.attributes[obj][ins] = new Object();
		if (Lwm2mDevKit.client.attributes[obj][ins][res]===undefined) Lwm2mDevKit.client.attributes[obj][ins][res] = new Object();
		
		for (let i in query) {
			let pair = query[i].split('=');
			
			Lwm2mDevKit.client.attributes[obj][ins][res][pair[0]] = pair[1];
		}
	} else if (ins!==undefined) {
		
		if (Lwm2mDevKit.client.attributes[obj]===undefined) Lwm2mDevKit.client.attributes[obj] = new Object();
		if (Lwm2mDevKit.client.attributes[obj][ins]===undefined) Lwm2mDevKit.client.attributes[obj][ins] = new Object();
		
		for (let i in query) {
			let pair = query[i].split('=');
			Lwm2mDevKit.client.attributes[obj][ins][pair[0]] = pair[1];
		}
	} else {
		
		if (Lwm2mDevKit.client.attributes[obj]===undefined) Lwm2mDevKit.client.attributes[obj] = new Object();
		
		for (let i in query) {
			let pair = query[i].split('=');
			Lwm2mDevKit.client.attributes[obj][pair[0]] = pair[1];
		}
	}
	
	message.respond(Lwm2mDevKit.Copper.CODE_2_04_CHANGED);
	Lwm2mDevKit.logOperation("Write Attributes", message.getUriPath(), "Success", message);
};


Lwm2mDevKit.DeviceManagement.handleExecute = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Execute on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	if (Lwm2mDevKit.client.instances[obj]===undefined ||
		Lwm2mDevKit.client.instances[obj][ins]===undefined ||
		Lwm2mDevKit.client.instances[obj][ins][res]===undefined) {
		
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		Lwm2mDevKit.logOperation("Execute", message.getUriPath(), "Not Found", message);
		return;
	}
	
	// the function was defined by the user locally through the GUI
	let exec = new Function(Lwm2mDevKit.client.instances[obj][ins][res]);
	
	if (typeof exec == 'function') {
		exec();
	}

	message.respond(Lwm2mDevKit.Copper.CODE_2_04_CHANGED);
	Lwm2mDevKit.logOperation("Execute", message.getUriPath(), "Success", message);
};


Lwm2mDevKit.DeviceManagement.handleCreate = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Create on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	if (res!==undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Resource ID given");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Bad Request", message);
		return;
	} else if (ins!==undefined && Lwm2mDevKit.client.instances[obj][ins]!==undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Instance exists");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Bad Request", message);
		return;
	} else if (obj===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Object undefined");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Bad Request", message);
		return;
	} else if (Lwm2mDevKit.client.instances[obj]===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND, "Object not supported");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Not Found", message);
		return;
	}
	
	// find free Instance ID
	if (ins===undefined) {
		ins = parseInt(Object.keys(Lwm2mDevKit.client.instances[obj]).pop());
		do {
			++ins;
		} while (Lwm2mDevKit.client.instances[obj][ins]!==undefined);
	}
	
	let cf = message.getContentFormat();
	let pl = null;
	
	if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV) {
		pl = Lwm2mDevKit.TLV.decode(message.getPayload(), obj, ins);
	} else if (cf==Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON) {
		message.respond(Lwm2mDevKit.Copper.CODE_5_01_NOT_IMPLEMENTED, "JSON not supported yet");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Not Implemented", message);
		return;
	} else {
		message.respond(Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST, "Use TLV to create Instance");
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Bad Request", message);
		return;
	}
	
	if (Lwm2mDevKit.createInstance(obj, ins, pl)) {
		message.respond(Lwm2mDevKit.Copper.CODE_2_01_CREATED);
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Success", message);
	} else {
		message.respond(Lwm2mDevKit.Copper.CODE_4_05_METHOD_NOT_ALLOWED);
		Lwm2mDevKit.logOperation("Create", message.getUriPath(), "Not Allowed", message);
	}
};


Lwm2mDevKit.DeviceManagement.handleDelete = function(message) {
	
	Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Delete on '+ message.getUriPath());

	let path = Lwm2mDevKit.getObjectAddress(message);
	let obj = path[0];
	let ins = path[1];
	let res = path[2];
	
	if (Lwm2mDevKit.client.instances[obj]===undefined || Lwm2mDevKit.client.instances[obj][ins]===undefined) {
		message.respond(Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND);
		Lwm2mDevKit.logOperation("Delete", message.getUriPath(), "Not Found", message);
		return;
	}
	
	if (Lwm2mDevKit.deleteInstance(obj, ins)) {
		message.respond(Lwm2mDevKit.Copper.CODE_2_02_DELETED);
		Lwm2mDevKit.logOperation("Delete", message.getUriPath(), "Success", message);
	} else {
		message.respond(Lwm2mDevKit.Copper.CODE_4_05_METHOD_NOT_ALLOWED);
		Lwm2mDevKit.logOperation("Delete", message.getUriPath(), "Not Allowed", message);
	}
};

Lwm2mDevKit.DeviceManagement.partialUpdate = function(data, obj, ins, res) {
	
	if (res==null) {
		if (!Lwm2mDevKit.isObject(data)) {
			Lwm2mDevKit.logError("Cannot write scalar to Resource Instance");
			return;
		}
		
		for (let i in data) {
			if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[i].operations.indexOf('W')==-1) {
				Lwm2mDevKit.logWarning("Write operation not allowed for Resource /"+obj+"/"+ins+"/"+i);
				continue;
			}
			Lwm2mDevKit.client.instances[obj][ins][i] = data[i];
		}
		
	} else {
		// check if Write operation is allowed
		if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('W')==-1) {
			Lwm2mDevKit.logWarning("Write operation not allowed for Resource /"+obj+"/"+ins+"/"+res);
			return;
		}
		
		if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].instancetype=="multiple") {
			if (!Lwm2mDevKit.isObject(data)) {
				Lwm2mDevKit.logError("Cannot write scalar to multiple Resource");
				return;
			}
			for (let i in data) {
				Lwm2mDevKit.client.instances[obj][ins][res][i] = data[i];
			}
		} else {
			if (Lwm2mDevKit.isObject(data)) {
				Lwm2mDevKit.logError("Cannot write vector to normal Resource");
				return;
			}
			Lwm2mDevKit.client.instances[obj][ins][res] = data
		}
	}
};

Lwm2mDevKit.DeviceManagement.replace = function(data, obj, ins, res) {
	
	if (res==null) {
		if (!Lwm2mDevKit.isObject(data)) {
			Lwm2mDevKit.logError("Cannot write scalar to Resource Instance");
			return;
		}
		
		for (let i in Lwm2mDevKit.objectDefinitions[obj].resourcedefs) {
			if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[i].operations.indexOf('W')==-1) continue;
			
			Lwm2mDevKit.client.instances[obj][ins][i] = data[i];
		}
		
	} else {
		// check if Write operation is allowed
		if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('W')==-1) {
			Lwm2mDevKit.logWarning("Write operation not allowed for Resource /"+obj+"/"+ins+"/"+res);
			return;
		}
		
		if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].instancetype=="multiple") {
			if (!Lwm2mDevKit.isObject(data)) {
				Lwm2mDevKit.logError("Cannot write scalar to multiple Resource");
				return;
			}
			// replace complete structure
			Lwm2mDevKit.client.instances[obj][ins][res] = data;
		} else {
			if (Lwm2mDevKit.isObject(data)) {
				Lwm2mDevKit.logError("Cannot write vector to normal Resource");
				return;
			}
			Lwm2mDevKit.client.instances[obj][ins][res] = data
		}
	}
};
