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
 * \TLV Helper functions
 * 
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Lwm2mDevKit.TLV = {};

/*
 * TLV format:
 * 
 * Type
 * Identifier
 * Length
 * Value
 * 
 *  7 6 5 4 3 2 1 0
 * +-+-+-+-+-+-+-+-+--------+--------+--------+--------+--------+-----------
 * | T |I| L |  V  |   ID 8/16 bits  |     Length 0-24 bits     | Value ...
 * +-+-+-+-+-+-+-+-+--------+--------+--------+--------+--------+-----------
 * 
 * T: type of field
 * 00 - Object Instance (contains 10 or 11 fields
 * 01 - Resource Instance
 * 10 - multiple Resource (contains 01 fields)
 * 11 - Resource
 * 
 * I: type of ID
 * 0 - 8 bits
 * 1 - 16 bits
 * 
 * L: type of Length
 * 00 - no Length
 * 01 - 8 bits
 * 10 - 16 bits
 * 11 - 24 bits
 * 
 * V: length of Value (for L=00)
 */

Lwm2mDevKit.TLV.__defineGetter__("OBJECT_INSTANCE", function() { return 0; });
Lwm2mDevKit.TLV.__defineGetter__("RESOURCE_INSTANCE", function() { return 1; });
Lwm2mDevKit.TLV.__defineGetter__("MULTIPLE_RESOURCE", function() { return 2; });
Lwm2mDevKit.TLV.__defineGetter__("RESOURCE", function() { return 3; });
Lwm2mDevKit.TLV.__defineGetter__("LEN_0", function() { return 0; });
Lwm2mDevKit.TLV.__defineGetter__("LEN_8", function() { return 1; });
Lwm2mDevKit.TLV.__defineGetter__("LEN_16", function() { return 2; });
Lwm2mDevKit.TLV.__defineGetter__("LEN_24", function() { return 3; });

Lwm2mDevKit.TLV.encode = function(item, obj, ins, res) {
	
	let bytes = new Array(0);
	
	// Object
	if (ins==null) {
		Lwm2mDevKit.logEvent("TLV-ENC: Encoding Object /"+obj);
		for (let ins in item) bytes = bytes.concat( Lwm2mDevKit.TLV.encodeObjectInstance(item[ins], obj, ins) );
	// Object Instance
	} else if (res==null) {
		Lwm2mDevKit.logEvent("TLV-ENC: Encoding Object Instance /"+obj+"/"+ins);
		for (let res in item) bytes = bytes.concat( Lwm2mDevKit.TLV.encodeResource(item[res], obj, ins, res) );
	// Resource
	} else {
		Lwm2mDevKit.logEvent("TLV-ENC: Encoding Resource /"+obj+"/"+ins+"/"+res);
		bytes = Lwm2mDevKit.TLV.encodeResource(item, obj, ins, res);
	}
	
	return bytes;
};

Lwm2mDevKit.TLV.createHeader = function(typeId, id, len) {
	
	let type = typeId<<6;
	let identifier = new Array(0);
	let length = new Array(0);
	
	if (id > 0xFF) {
		type |= 1<<5;
		identifier.push( (id>>8) & 0xFF );
	}
	identifier.push( id & 0xFF );
	if (len > 0xFFFF) {
		type |= Lwm2mDevKit.TLV.LEN_24<<3;
		identifier.push( (len>>16) & 0xFF );
		identifier.push( (len>>8) & 0xFF );
		identifier.push( len & 0xFF );
	} else if (len > 0xFF) {
		type |= Lwm2mDevKit.TLV.LEN_16<<3;
		identifier.push( (len>>8) & 0xFF );
		identifier.push( len & 0xFF );
	} else if (len > 7) {
		type |= Lwm2mDevKit.TLV.LEN_8<<3;
		identifier.push( len & 0xFF );
	} else {
		type |= len & 0x07;
	}
	
	let header = new Array(0);
	header.push(type);
	return header.concat(identifier, length);
};

Lwm2mDevKit.TLV.encodeObjectInstance = function(resources, obj, ins) {

	Lwm2mDevKit.logEvent("TLV-ENC:    Object Instance /"+obj+"/"+ins);

	let value = new Array(0);
	
	for (let res in resources) {
		value = value.concat( Lwm2mDevKit.TLV.encodeResource(resources[res], obj, ins, res) );
	}
	
	return Lwm2mDevKit.TLV.createHeader(Lwm2mDevKit.TLV.OBJECT_INSTANCE, ins, value.length).concat( value );
};

Lwm2mDevKit.TLV.encodeResource = function(resource, obj, ins, res) {
	
	if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('R')==-1) {
		Lwm2mDevKit.logEvent("TLV-ENC:       Skipping unreadable Resource /"+obj+"/"+ins+"/"+res);
		return new Array(0);
	}
	
	Lwm2mDevKit.logEvent("TLV-ENC:       Resource /"+obj+"/"+ins+"/"+res);
	
	if (Lwm2mDevKit.isObject(resource)) {
		let value = new Array(0);
		
		for (let i in resource) value = value.concat(Lwm2mDevKit.TLV.encodeResourceInstance(resource[i], obj, ins, res, i) );
		
		return Lwm2mDevKit.TLV.createHeader(Lwm2mDevKit.TLV.MULTIPLE_RESOURCE, res, value.length).concat( value );
	} else {
		let value = Lwm2mDevKit.TLV.encodeValue(resource, obj, ins, res);
		
		return Lwm2mDevKit.TLV.createHeader(Lwm2mDevKit.TLV.RESOURCE, res, value.length).concat( value );
	}
};

Lwm2mDevKit.TLV.encodeResourceInstance = function(instance, obj, ins, res, id) {
	
	Lwm2mDevKit.logEvent("TLV-ENC:          Resource Instance "+id);

	let value = Lwm2mDevKit.TLV.encodeValue(instance, obj, ins, res);
	
	return Lwm2mDevKit.TLV.createHeader(Lwm2mDevKit.TLV.RESOURCE_INSTANCE, id, value.length).concat( value );
};

Lwm2mDevKit.TLV.encodeValue = function(value, obj, ins, res) {
	
	if (obj==null) Lwm2mDevKit.logError(new Error('No Object ID given'));
	if (ins==null) Lwm2mDevKit.logError(new Error('No Instance ID given'));
	if (res==null) Lwm2mDevKit.logError(new Error('No Resource ID given'));
	
	let bytes = null;
	
	let type = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].type.toLowerCase();
	
	Lwm2mDevKit.logEvent( "TLV-ENC:             "+value+" ("+type+")");
	
	switch (type) {
	case "string":
		bytes = Lwm2mDevKit.Copper.str2bytes(value);
		break;
	case "integer":
		bytes = Lwm2mDevKit.Copper.int2bytes(value);
		if (bytes.length==0) bytes.push(0); // CoAP allows zero-length for 0
		break;
	case "float":
		bytes = Lwm2mDevKit.Copper.double2bytes(value);
		break;
	case "boolean":
		if (value===true) {
			bytes = [1];
		} else if (value===false) {
			bytes = [0];
		} else {
			Lwm2mDevKit.logError(new Error("Invalid Boolean value in object /"+obj+"/"+ins+"/"+res));
		}
		break;
	case "opaque":
		bytes = Lwm2mDevKit.Copper.data2bytes(value);
		break;
	case "time":
		bytes = Lwm2mDevKit.Copper.int2bytes(value);
		if (bytes.length==0) bytes.push(0); // CoAP allows zero-length for 0
		break;
	default:
		throw new Error("Unknown data type '"+type+"'");
	}
	
	return bytes;
};


Lwm2mDevKit.TLV.decode = function(bytes, obj, ins, res) {
	
	// Object
	if (ins==null) {
		Lwm2mDevKit.logEvent("TLV-DEC: Decoding Object /"+obj);
	// Object Instance
	} else if (res==null) {
		Lwm2mDevKit.logEvent("TLV-DEC: Decoding Object Instance /"+obj+"/"+ins);
	}
	
	bytes = bytes.slice(0);
	let object = new Object();
	
	while (bytes.length > 0) {
	
		let type = bytes.shift();
		let id = 0;
		let length = 0;
	
		let typeCode = type>>6;
		let idCode = (type>>5) & 0x01;
		let lenCode = (type>>3) & 0x03;
		
		if (idCode) {
			id = bytes.shift()<<8 | bytes.shift();
		} else {
			id = bytes.shift();
		}
		
		switch (lenCode) {
		case Lwm2mDevKit.TLV.LEN_0:
			length = type & 0x07;
			break;
		case Lwm2mDevKit.TLV.LEN_8:
			length = bytes.shift();
			break;
		case Lwm2mDevKit.TLV.LEN_16:
			length = bytes.shift()<<8 | bytes.shift();
			break;
		case Lwm2mDevKit.TLV.LEN_24:
			length = bytes.shift()<<16 | bytes.shift()<<8 | bytes.shift();
			break;
		}
		
		let value = bytes.splice(0, length);
		
		switch (typeCode) {
		case Lwm2mDevKit.TLV.OBJECT_INSTANCE:
			if (ins!=null || res!=null) throw new Error("Invalid level for Object Instance TLV");
			Lwm2mDevKit.logEvent("TLV-DEC:    Object Instance /"+obj+"/"+id);
			object[id] = Lwm2mDevKit.TLV.decode( value, obj, id );
			break;
		case Lwm2mDevKit.TLV.MULTIPLE_RESOURCE:
			if (obj==null || ins==null) throw new Error("Invalid level for multiple Resource TLV");
			Lwm2mDevKit.logEvent("TLV-DEC:       Multi-Resource /"+obj+"/"+ins+"/"+id);
			object[id] = Lwm2mDevKit.TLV.decode( value, obj, ins, id );
			break;
		case Lwm2mDevKit.TLV.RESOURCE:
			if (obj==null) throw new Error("Undefined Object ID for Resource TLV");
			Lwm2mDevKit.logEvent("TLV-DEC:       Resource /"+obj+"/"+ins+"/"+id);
			object[id] = Lwm2mDevKit.TLV.decodeValue( value, obj, ins, id );
			break;
		case Lwm2mDevKit.TLV.RESOURCE_INSTANCE:
			if (obj==null) throw new Error("Undefined Object ID for Resource TLV");
			if (res==null) throw new Error("Undefined Resource for Resource Instance TLV");
			Lwm2mDevKit.logEvent("TLV-DEC:          Resource Instance "+id);
			object[id] = Lwm2mDevKit.TLV.decodeValue( value, obj, ins, res );
			break;
		}
	}
	
	return object;
};

Lwm2mDevKit.TLV.decodeValue = function(bytes, obj, ins, res) {

	let value = null;
	
	let type = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].type.toLowerCase();
	
	switch (type) {
	case "string":
		value = Lwm2mDevKit.Copper.bytes2str(bytes);
		break;
	case "integer":
		value = Lwm2mDevKit.Copper.bytes2int(bytes);
		break;
	case "float":
		value = Lwm2mDevKit.Copper.bytes2double(bytes);
		break;
	case "boolean":
		if (bytes[0]) {
			value = true;
		} else {
			value = false;
		}
		break;
	case "opaque":
		value = Lwm2mDevKit.Copper.bytes2data(bytes);
		break;
	case "time":
		value = Lwm2mDevKit.Copper.bytes2int(bytes);
		break;
	default:
		throw new Error("Unknown data type '"+type+"'");
	}
	
	Lwm2mDevKit.logEvent( "TLV-DEC:             "+value+" ("+type+")");
	
	return value;
};
