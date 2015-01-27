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

Lwm2mDevKit.JSON = {};

Lwm2mDevKit.JSON.encode = function(item, obj, ins, res) {

	let json = {"e": []};
	
	// Object
	if (ins==null) {
		Lwm2mDevKit.logEvent("JSON-ENC: Encoding Object /"+obj);
		for (let ins in item) {
			for (let res in item[ins]) {
				let resource = item[ins][res];
				if (Lwm2mDevKit.isObject(resource)) {
					for (let i in resource) {
						let data = Lwm2mDevKit.JSON.encodeValue(ins+"/"+res+"/"+i, resource[i], obj, ins, res, i)
						if (data!==null) json.e.push( data );
					}
				} else {
					let data = Lwm2mDevKit.JSON.encodeValue(ins+"/"+res, resource, obj, ins, res);
					if (data!==null) json.e.push( data );
				}
			}
		}
	// Object Instance
	} else if (res==null) {
		Lwm2mDevKit.logEvent("JSON-ENC: Encoding Object Instance /"+obj+"/"+ins);
		for (let res in item) {
			let resource = item[res];
			if (Lwm2mDevKit.isObject(resource)) {
				for (let i in resource) {
					let data = Lwm2mDevKit.JSON.encodeValue(res+"/"+i, resource[i], obj, ins, res, i);
					if (data!==null) json.e.push( data );
				}
			} else {
				let data = Lwm2mDevKit.JSON.encodeValue(String(res), resource, obj, ins, res);
				if (data!==null) json.e.push( data );
			}
		}
	// Resource
	} else {
		Lwm2mDevKit.logEvent("JSON-ENC: Encoding Resource /"+obj+"/"+ins+"/"+res);
		if (Lwm2mDevKit.isObject(item)) {
			for (let i in item) {
				let data = Lwm2mDevKit.JSON.encodeValue(String(i), item[i], obj, ins, res, i);
				if (data!==null) json.e.push( data );
			}
		} else {
			let data = Lwm2mDevKit.JSON.encodeValue("", item, obj, ins, res);
			if (data!==null) json.e.push( data );
		}
	}
	
	return JSON.stringify(json);
};

Lwm2mDevKit.JSON.encodeValue = function(path, value, obj, ins, res, id) {
	if (obj==null) Lwm2mDevKit.logError(new Error('No Object ID given'));
	if (ins==null) Lwm2mDevKit.logError(new Error('No Instance ID given'));
	if (res==null) Lwm2mDevKit.logError(new Error('No Resource ID given'));
	
	if (Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].operations.indexOf('R')==-1) {
		Lwm2mDevKit.logEvent("JSON-ENC:       Skipping unreadable Resource /"+obj+"/"+ins+"/"+res);
		return null;
	}
	
	let line = {"n": path};
	let type = Lwm2mDevKit.objectDefinitions[obj].resourcedefs[res].type.toLowerCase();
	
	Lwm2mDevKit.logEvent( "JSON-ENC:             "+value+" ("+type+")");
	
	switch (type) {
	case "string":
		line['sv'] = String(value);
		break;
	case "integer":
	case "float":
		line['v'] = Number(value);
		break;
	case "boolean":
		line['bv'] = Boolean(value);
		break;
	case "opaque":
		line['sv'] = window.btoa(unescape(encodeURIComponent( String(value) )));
		break;
	case "time":
		line['v'] = Number(value);
		break;
	default:
		throw new Error("Unknown data type '"+type+"'");
	}
	
	return line;
};
