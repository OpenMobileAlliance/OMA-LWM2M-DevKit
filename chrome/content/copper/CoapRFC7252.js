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
 * \file   Implementation of RFC 7252
 *
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Lwm2mDevKit.Copper = { };

//Registries
////////////////////////////////////////////////////////////////////////////////

Lwm2mDevKit.Copper.getOptionName = function(number) {
	switch (parseInt(number)) {
	case Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE:
	case Lwm2mDevKit.Copper.OPTION_CONTENT_FORMAT: return 'Content-Format';
	case Lwm2mDevKit.Copper.OPTION_MAX_AGE: return 'Max-Age';
	case Lwm2mDevKit.Copper.OPTION_ACCEPT: return 'Accept';
	case Lwm2mDevKit.Copper.OPTION_TOKEN: return 'Token';
	
	case Lwm2mDevKit.Copper.OPTION_URI_HOST: return 'Uri-Host';
	case Lwm2mDevKit.Copper.OPTION_URI_PORT: return 'Uri-Port';
	case Lwm2mDevKit.Copper.OPTION_URI_PATH: return 'Uri-Path';
	case Lwm2mDevKit.Copper.OPTION_URI_QUERY: return 'Uri-Query';
	
	case Lwm2mDevKit.Copper.OPTION_LOCATION_PATH: return 'Location-Path';
	case Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY: return 'Location-Query';
	
	case Lwm2mDevKit.Copper.OPTION_PROXY_URI: return 'Proxy-Uri';
	case Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME: return 'Proxy-Scheme';
	
	case Lwm2mDevKit.Copper.OPTION_IF_MATCH: return 'If-Match';
	case Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH: return 'If-None-Match';
	case Lwm2mDevKit.Copper.OPTION_ETAG: return 'ETag';
	
	case Lwm2mDevKit.Copper.OPTION_OBSERVE: return 'Observe';
	
	case Lwm2mDevKit.Copper.OPTION_BLOCK:
	case Lwm2mDevKit.Copper.OPTION_BLOCK2: return 'Block2';
	case Lwm2mDevKit.Copper.OPTION_BLOCK1: return 'Block1';
	case Lwm2mDevKit.Copper.OPTION_SIZE:
	case Lwm2mDevKit.Copper.OPTION_SIZE2: return 'Size2';
	case Lwm2mDevKit.Copper.OPTION_SIZE1: return 'Size1';
	
	default: return 'Unknown '+number;
	}
	return '';
};

Lwm2mDevKit.Copper.getContentFormatName = function(type) {
	switch (type) {
	case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_PLAIN: return 'text/plain'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_XML: return 'text/xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_CSV: return 'text/csv'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_HTML: return 'text/html'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_GIF: return 'image/gif'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_JPEG: return 'image/jpeg'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_PNG: return 'image/png'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_TIFF: return 'image/tiff'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_AUDIO_RAW: return 'audio/raw'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_VIDEO_RAW: return 'video/raw'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT: return 'application/link-format'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_XML: return 'application/xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM: return 'application/octet-stream'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_RDF_XML: return 'application/rdf+xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_SOAP_XML: return 'application/soap+xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_ATOM_XML: return 'application/atom+xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_XMPP_XML: return 'application/xmpp+xml'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_EXI: return 'application/exi'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_FASTINFOSET: return 'application/fastinfoset'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET: return 'application/soap+fastinfoset'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_JSON: return 'application/json'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY: return 'application/x-obix-binary'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT: return 'application/vnd.oma.lwm2m+text'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV: return 'application/vnd.oma.lwm2m+tlv'; break;
	case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON: return 'application/vnd.oma.lwm2m+json'; break;
	default: return 'unknown';
	}
	return '';
};

// Constants
////////////////////////////////////////////////////////////////////////////////

Lwm2mDevKit.Copper.__defineGetter__("VERSION", function() { return 1; });
Lwm2mDevKit.Copper.__defineGetter__("DRAFT", function() { return 13; });

Lwm2mDevKit.Copper.__defineGetter__("MSG_TYPE_CON", function() { return 0; });
Lwm2mDevKit.Copper.__defineGetter__("MSG_TYPE_NON", function() { return 1; });
Lwm2mDevKit.Copper.__defineGetter__("MSG_TYPE_ACK", function() { return 2; });
Lwm2mDevKit.Copper.__defineGetter__("MSG_TYPE_RST", function() { return 3; });

Lwm2mDevKit.Copper.__defineGetter__("OPTION_IF_MATCH", function() { return 1; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_URI_HOST", function() { return 3; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_ETAG", function() { return 4; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_IF_NONE_MATCH", function() { return 5; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_URI_PORT", function() { return 7; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_LOCATION_PATH", function() { return 8; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_URI_PATH", function() { return 11; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_CONTENT_TYPE", function() { return 12; }); // for API compatibility
Lwm2mDevKit.Copper.__defineGetter__("OPTION_CONTENT_FORMAT", function() { return 12; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_MAX_AGE", function() { return 14; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_URI_QUERY", function() { return 15; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_ACCEPT", function() { return 17; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_TOKEN", function() { return 19; }); // for API compatibility
Lwm2mDevKit.Copper.__defineGetter__("OPTION_LOCATION_QUERY", function() { return 20; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_PROXY_URI", function() { return 35; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_PROXY_SCHEME", function() { return 39; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_SIZE1", function() { return 60; });

Lwm2mDevKit.Copper.__defineGetter__("OPTION_OBSERVE", function() { return 6; });

Lwm2mDevKit.Copper.__defineGetter__("OPTION_BLOCK", function() { return 23; }); // for API compatibility
Lwm2mDevKit.Copper.__defineGetter__("OPTION_BLOCK2", function() { return 23; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_BLOCK1", function() { return 27; });
Lwm2mDevKit.Copper.__defineGetter__("OPTION_SIZE", function() { return 28; }); // for API compatibility
Lwm2mDevKit.Copper.__defineGetter__("OPTION_SIZE2", function() { return 28; });


Lwm2mDevKit.Copper.__defineGetter__("CODE_2_01_CREATED", function() { return 65; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_2_02_DELETED", function() { return 66; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_2_03_VALID", function() { return 67; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_2_04_CHANGED", function() { return 68; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_2_05_CONTENT", function() { return 69; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_2_31_CONTINUE", function() { return 95; });

Lwm2mDevKit.Copper.__defineGetter__("CODE_4_00_BAD_REQUEST", function() { return 128; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_01_UNAUTHORIZED", function() { return 129; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_02_BAD_OPTION", function() { return 130; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_03_FORBIDDEN", function() { return 131; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_04_NOT_FOUND", function() { return 132; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_05_METHOD_NOT_ALLOWED", function() { return 133; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_06_NOT_ACCEPTABLE", function() { return 134; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_08_REQUEST_ENTITY_INCOMPLETE", function() { return 136; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_12_PRECONDITION_FAILED", function() { return 140; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_13_REQUEST_ENTITY_TOO_LARGE", function() { return 141; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_4_15_UNSUPPORTED_MEDIA_TYPE", function() { return 143; });

Lwm2mDevKit.Copper.__defineGetter__("CODE_5_00_INTERNAL_SERVER_ERROR", function() { return 160; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_5_01_NOT_IMPLEMENTED", function() { return 161; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_5_02_BAD_GATEWAY", function() { return 162; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_5_03_SERVICE_UNAVAILABLE", function() { return 163; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_5_04_GATEWAY_TIMEOUT", function() { return 164; });
Lwm2mDevKit.Copper.__defineGetter__("CODE_5_05_PROXYING_NOT_SUPPORTED", function() { return 165; });

Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_TEXT_PLAIN", function() { return 0; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_TEXT_XML", function() { return 1; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_TEXT_CSV", function() { return 2; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_TEXT_HTML", function() { return 3; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_IMAGE_GIF", function() { return 21; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_IMAGE_JPEG", function() { return 22; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_IMAGE_PNG", function() { return 23; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_IMAGE_TIFF", function() { return 24; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_AUDIO_RAW", function() { return 25; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_VIDEO_RAW", function() { return 26; }); // 03
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_LINK_FORMAT", function() { return 40; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_XML", function() { return 41; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_OCTET_STREAM", function() { return 42; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_RDF_XML", function() { return 43; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_SOAP_XML", function() { return 44; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_ATOM_XML", function() { return 45; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_XMPP_XML", function() { return 46; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_EXI", function() { return 47; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_FASTINFOSET", function() { return 48; }); // 04
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET", function() { return 49; }); // 04
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_JSON", function() { return 50; }); // 04
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_X_OBIX_BINARY", function() { return 51; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT", function() { return 1541; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV", function() { return 1542; });
Lwm2mDevKit.Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON", function() { return 1543; });

Lwm2mDevKit.Copper.__defineGetter__("GET", function() { return 1; });
Lwm2mDevKit.Copper.__defineGetter__("POST", function() { return 2; });
Lwm2mDevKit.Copper.__defineGetter__("PUT", function() { return 3; });
Lwm2mDevKit.Copper.__defineGetter__("DELETE", function() { return 4; });

Lwm2mDevKit.Copper.__defineGetter__("WELL_KNOWN_RESOURCES", function() { return '/.well-known/core'; });

Lwm2mDevKit.Copper.__defineGetter__("RESPONSE_TIMEOUT", function() { return 2000; }); // ms
Lwm2mDevKit.Copper.__defineGetter__("RESPONSE_RANDOM_FACTOR", function() { return 1.5; }); // ms
Lwm2mDevKit.Copper.__defineGetter__("MAX_RETRANSMIT", function() { return 4; });
Lwm2mDevKit.Copper.__defineGetter__("ETAG_LENGTH", function() { return 8; });
Lwm2mDevKit.Copper.__defineGetter__("TOKEN_LENGTH", function() { return 8; });

Lwm2mDevKit.Copper.__defineGetter__("DEFAULT_PORT", function() { return 5683; });

// CoAP draft-12 implementation
////////////////////////////////////////////////////////////////////////////////

Lwm2mDevKit.Copper.CoapPacket = function() {
	// WARNING: Must be sorted by option number for serialization
	this.options = new Array();
	//                                       length, value as byte array
	this.options[Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_MAX_AGE] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_PROXY_URI] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_ETAG] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_URI_HOST] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_LOCATION_PATH] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_URI_PORT] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_URI_PATH] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_OBSERVE] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_TOKEN] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_ACCEPT] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_IF_MATCH] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_URI_QUERY] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_BLOCK2] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_BLOCK1] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_SIZE2] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_SIZE1] = new Array(0, null);
	this.options[Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH] = new Array(0, null);

	this.tid = parseInt(Math.random()*0x10000);
	
	this.payload = new Array(0);
	
	return this;
};

Lwm2mDevKit.Copper.CoapPacket.prototype = {
	version :     Lwm2mDevKit.Copper.VERSION, // member for received packets
	type :        Lwm2mDevKit.Copper.MSG_TYPE_CON,
	optionCount : 0,
	code :        Lwm2mDevKit.Copper.GET,
	tid :         0,
	options :     null,
	payload :     null,
	
	// readable method or response code
	getCode : function(readable) {
		if (readable) {
			switch (parseInt(this.code)) {
				// empty
				case 0: return 'EMPTY';
				// methods
				case Lwm2mDevKit.Copper.GET: return 'GET';
				case Lwm2mDevKit.Copper.POST: return 'POST';
				case Lwm2mDevKit.Copper.PUT: return 'PUT';
				case Lwm2mDevKit.Copper.DELETE: return 'DELETE';
				// response codes
				case Lwm2mDevKit.Copper.CODE_2_01_CREATED: return '2.01 Created';
				case Lwm2mDevKit.Copper.CODE_2_02_DELETED: return '2.02 Deleted';
				case Lwm2mDevKit.Copper.CODE_2_03_VALID: return '2.03 Valid';
				case Lwm2mDevKit.Copper.CODE_2_04_CHANGED: return '2.04 Changed';
				case Lwm2mDevKit.Copper.CODE_2_05_CONTENT: return '2.05 Content';
				case Lwm2mDevKit.Copper.CODE_2_31_CONTINUE: return '2.31 Continue';
				case Lwm2mDevKit.Copper.CODE_4_00_BAD_REQUEST: return '4.00 Bad Request';
				case Lwm2mDevKit.Copper.CODE_4_01_UNAUTHORIZED: return '4.01 Unauthorized';
				case Lwm2mDevKit.Copper.CODE_4_02_BAD_OPTION: return '4.02 Bad Option';
				case Lwm2mDevKit.Copper.CODE_4_03_FORBIDDEN: return '4.03 Forbidden';
				case Lwm2mDevKit.Copper.CODE_4_04_NOT_FOUND: return '4.04 Not Found';
				case Lwm2mDevKit.Copper.CODE_4_05_METHOD_NOT_ALLOWED: return '4.05 Method Not Allowed';
				case Lwm2mDevKit.Copper.CODE_4_06_NOT_ACCEPTABLE: return '4.06 Not Acceptable';
				case Lwm2mDevKit.Copper.CODE_4_08_REQUEST_ENTITY_INCOMPLETE: return '4.08 Request Entity Incomplete';
				case Lwm2mDevKit.Copper.CODE_4_12_PRECONDITION_FAILED: return '4.12 Precondition Failed';
				case Lwm2mDevKit.Copper.CODE_4_13_REQUEST_ENTITY_TOO_LARGE: return '4.13 Request Entity Too Large';
				case Lwm2mDevKit.Copper.CODE_4_15_UNSUPPORTED_MEDIA_TYPE: return '4.15 Unsupported Content-Format';
				case Lwm2mDevKit.Copper.CODE_5_00_INTERNAL_SERVER_ERROR: return '5.00 Internal Server Error';
				case Lwm2mDevKit.Copper.CODE_5_01_NOT_IMPLEMENTED: return '5.01 Not Implemented';
				case Lwm2mDevKit.Copper.CODE_5_02_BAD_GATEWAY: return '5.02 Bad Gateway';
				case Lwm2mDevKit.Copper.CODE_5_03_SERVICE_UNAVAILABLE: return '5.03 Service Unavailable';
				case Lwm2mDevKit.Copper.CODE_5_04_GATEWAY_TIMEOUT: return '5.04 Gateway Timeout';
				case Lwm2mDevKit.Copper.CODE_5_05_PROXYING_NOT_SUPPORTED: return '5.05 Proxying Not Supported';
				// ...
				default: return Math.floor(this.code/32)+'.'+(this.code % 32)+' Unknown by Copper';
			}
		} else {
			return parseInt(this.code);
		}
	},
	
	// get options that are set in the package
	getOptions : function() {
		var list = new Array();
		for (let optTypeIt in this.options) {
	    	if (Array.isArray(this.options[optTypeIt][1])) {
				list.push(optTypeIt);
			}
		}
		return list;
	},
	
	// retrieve option
	getOptionLength : function(optType) {
		if (this.options[optType]!=null && this.options[optType][0]!=null) {
			return this.options[optType][0];
		} else {
			return -1;
		}
	},
	getOption : function(optType) {
		var opt = this.options[optType][1];
		
		// only set options are arrays
		if (!Array.isArray(opt)) {
			return null;
		}

		switch (parseInt(optType)) {
			// strings
			case Lwm2mDevKit.Copper.OPTION_URI_HOST:
			case Lwm2mDevKit.Copper.OPTION_URI_PATH:
			case Lwm2mDevKit.Copper.OPTION_URI_QUERY:
			case Lwm2mDevKit.Copper.OPTION_LOCATION_PATH:
			case Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY:
			case Lwm2mDevKit.Copper.OPTION_PROXY_URI:
			case Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME:
				return Lwm2mDevKit.Copper.bytes2str(opt);
				break;

			// integers
			case Lwm2mDevKit.Copper.OPTION_URI_PORT:
			case Lwm2mDevKit.Copper.OPTION_CONTENT_FORMAT:
			case Lwm2mDevKit.Copper.OPTION_MAX_AGE:
			case Lwm2mDevKit.Copper.OPTION_ACCEPT:
			case Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH:
			case Lwm2mDevKit.Copper.OPTION_OBSERVE:
			case Lwm2mDevKit.Copper.OPTION_BLOCK2:
			case Lwm2mDevKit.Copper.OPTION_BLOCK1:
			case Lwm2mDevKit.Copper.OPTION_SIZE2:
			case Lwm2mDevKit.Copper.OPTION_SIZE1:
				return Lwm2mDevKit.Copper.bytes2int(opt);
			
			// byte arrays
			case Lwm2mDevKit.Copper.OPTION_ETAG:
			case Lwm2mDevKit.Copper.OPTION_TOKEN:
			case Lwm2mDevKit.Copper.OPTION_IF_MATCH:
			default:
				return Lwm2mDevKit.Copper.bytes2hex(opt);
				break;
			
		}
		return null;
	},
	
	setOption : function(option, value) {
		switch (parseInt(option)) {
			// strings
			case Lwm2mDevKit.Copper.OPTION_PROXY_URI:
			case Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME:
			case Lwm2mDevKit.Copper.OPTION_LOCATION_PATH:
			case Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY:
			case Lwm2mDevKit.Copper.OPTION_URI_HOST:
			case Lwm2mDevKit.Copper.OPTION_URI_PATH:
			case Lwm2mDevKit.Copper.OPTION_URI_QUERY:
				this.options[option][0] = value.length;
				this.options[option][1] = Lwm2mDevKit.Copper.str2bytes(value);
				break;
			
			// byte arrays
			case Lwm2mDevKit.Copper.OPTION_ETAG:
			case Lwm2mDevKit.Copper.OPTION_TOKEN:
			case Lwm2mDevKit.Copper.OPTION_IF_MATCH:
				this.options[option][0] = value.length;
				this.options[option][1] = value;
				break;
				
			// special arrays
			case -1:
				this.options[option][0] += 1;
				if (this.options[option][1]==null) this.options[option][1] = new Array(0);
				this.options[option][1][ this.options[option][0] ] = value;
				this.options[option][0] += 1;
				break;
			
			// integers
			case Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE:
			case Lwm2mDevKit.Copper.OPTION_MAX_AGE:
			case Lwm2mDevKit.Copper.OPTION_URI_PORT:
			case Lwm2mDevKit.Copper.OPTION_OBSERVE:
			case Lwm2mDevKit.Copper.OPTION_ACCEPT:
			case Lwm2mDevKit.Copper.OPTION_BLOCK2:
			case Lwm2mDevKit.Copper.OPTION_BLOCK1:
			case Lwm2mDevKit.Copper.OPTION_SIZE2:
			case Lwm2mDevKit.Copper.OPTION_SIZE1:
			case Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH:
				this.options[option][1] = Lwm2mDevKit.Copper.int2bytes(value);
				this.options[option][0] = this.options[option][1].length;
				break;
			
			default:
				this.options[option] = new Array(value.length, value);
				Lwm2mDevKit.logEvent('WARNING: Setting custom option '+option+': '+value+'\n');
		}
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(inputUri) {
		
		var uri = document.createElementNS("http://www.w3.org/1999/xhtml","a");
/*
 * <a> tag as parser:
 * 
 *		parser.protocol; // => "http:"
 *		parser.hostname; // => "example.com"
 *		parser.port; // => "3000"
 *		parser.pathname; // => "/pathname/"
 *		parser.search; // => "?search=test"
 *		parser.hash; // => "#hash"
 *		parser.host; // => "example.com:3000"
 */
		uri.href = inputUri;
		
		if (uri.hostname!='' && !uri.hostname.match(/[0-9a-f]{0,4}(:?:[0-9a-f]{0,4})+/)) {
			this.setOption(Lwm2mDevKit.Copper.OPTION_URI_HOST, uri.hostname);
		}
		if (uri.pathname.length>1) {
			this.setOption(Lwm2mDevKit.Copper.OPTION_URI_PATH, uri.pathname.substr(1));
		}
		if (uri.search.length>1) {
			this.setOption(Lwm2mDevKit.Copper.OPTION_URI_QUERY, uri.search.substr(1));
		}
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
	    // first byte: version, type, and option count
		tempByte  = (0x03 & Lwm2mDevKit.Copper.VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][0]);
		
		byteArray.push(tempByte);
		
		// second byte: method or response code
	    byteArray.push(0xFF & this.code);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >>> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    for (let i=0; i<this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][0] && i<Lwm2mDevKit.Copper.TOKEN_LENGTH; ++i) {
	    	byteArray.push(0xFF & this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][1][i]);
	    }
	    
	    // options
	    this.optionCount = 0;
	    var optNumber = 0;
	    for (let optTypeIt in this.options) {
	    	
	    	if (!Array.isArray(this.options[optTypeIt][1]) || optTypeIt==Lwm2mDevKit.Copper.OPTION_TOKEN) {
				continue;
			} else {
				
				var splitOption = new Array();
				if (optTypeIt==Lwm2mDevKit.Copper.OPTION_LOCATION_PATH ||
					optTypeIt==Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY ||
					optTypeIt==Lwm2mDevKit.Copper.OPTION_URI_PATH ||
					optTypeIt==Lwm2mDevKit.Copper.OPTION_URI_QUERY) {
	    			
	    			var separator = '/'; // 0x002F
	    			if (optTypeIt==Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY || optTypeIt==Lwm2mDevKit.Copper.OPTION_URI_QUERY) {
	    				separator = '&'; // 0x0026
	    			}
				
	    			if (Lwm2mDevKit.Copper.bytes2str(this.options[optTypeIt][1])!="") {
						var splitString = Lwm2mDevKit.Copper.bytes2str(this.options[optTypeIt][1]).split(separator);
						for (let s in splitString) {
							splitOption.push(Lwm2mDevKit.Copper.str2bytes(splitString[s]));
						}
	    			}
				} else {
					splitOption.push(this.options[optTypeIt][1]);
				}
				
				while ((opt = splitOption.shift())) {
				
					var optDelta = optTypeIt - optNumber;
				
					var delta = this.optionNibble(optDelta);
					var len = this.optionNibble(opt.length);
					
					byteArray.push(0xFF & (delta<<4 | len));
					
					if (delta==13) {
						byteArray.push(optDelta-13);
					} else if (delta==14) {
						byteArray.push( (optDelta-269)>>>8 );
						byteArray.push( 0xFF & (optDelta-269) );
					}
					if (len==13) {
						byteArray.push(opt.length-13);
					} else if (len==14) {
						byteArray.push( (opt.length)>>>8 );
						byteArray.push( 0xFF & (opt.length-269) );
					}
					
					// add option value
					for(var i in opt) byteArray.push(opt[i]);
					
					this.optionCount++;

					optNumber = optTypeIt;
				}
			}
		}
	    
	    // option terminator
	    if (this.payload.length>0) {
			byteArray.push(0xFF);
	    }
		
	    // serialize as string
	    var message = Lwm2mDevKit.Copper.bytes2data(byteArray);
        
	    // payload
	    message += Lwm2mDevKit.Copper.bytes2data(this.payload);
	    
	    // finished
	    return message;
	},
	
	parse : function(packet) {
	
		// first byte: version, type, and option count
		var tempByte = packet.shift();
		
		this.version = 0xFF & ((tempByte & 0xC0) >>> 6);
		if (this.version != Lwm2mDevKit.Copper.VERSION) {
			throw new Error('CoapPacket.parse [CoAP version '+this.version+' not supported]');
        }

		this.type = 0x03 & ((tempByte) >>> 4);

        this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][0] = 0x0F & tempByte;
        if (this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][0]>0) this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][1] = new Array();
        
        this. code = packet.shift();

		// third and forth byte: transaction ID (TID)
        this.tid  = packet.shift() << 8;
        this.tid |= packet.shift();
		
		for (let i=0; i<this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][0]; ++i) {
			this.options[Lwm2mDevKit.Copper.OPTION_TOKEN][1].push(packet.shift());
		}

        //read options
		var optType = 0;
		while ((tempByte = packet.shift())>0) {
			if (tempByte!=0xFF) {
				optDelta = ((0xF0 & tempByte) >>> 4);
		    	optLen = (0x0F & tempByte);
		    	
		    	if (optDelta==13) {
		    		optDelta += packet.shift();
				} else if (optDelta==14) {
					optDelta += 255;
					optDelta += packet.shift()<<8;
					optDelta += 0xFF & packet.shift();
				}
				if (optLen==13) {
					optLen += packet.shift();
				} else if (optLen==14) {
					optLen += 255;
					optLen += packet.shift()<<8;
					optLen += 0xFF & packet.shift();
				}
				
				optType += optDelta;
				
				var opt = new Array(0);
		    	
			    for (let j=0; j<optLen; j++) {
			    	opt.push(packet.shift());
			    }
		    	
		    	// parse Option into Array
		    	
				if (optType==Lwm2mDevKit.Copper.OPTION_LOCATION_PATH ||
	    			optType==Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY ||
	    			optType==Lwm2mDevKit.Copper.OPTION_URI_PATH ||
	    			optType==Lwm2mDevKit.Copper.OPTION_URI_QUERY) {
	    			
	    			var separator = 0x002F; // /
	    			if (optType==Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY || optType==Lwm2mDevKit.Copper.OPTION_URI_QUERY) {
	    				separator = 0x0026; // &
	    			}
	    			
	    			if (this.options[optType][0]>0) {
	    				optLen += 1 + this.options[optType][0];
	    				opt = this.options[optType][1].concat(separator).concat(opt);
	    			}
	    		}
				
				this.options[optType] = new Array(optLen, opt);
		    	
			} else {
				this.payload = packet;
				break;
			}
		}
	    
	},
	
	optionNibble : function(value) {
		if (value<13) {
			return (0xFF & value);
		} else if (value<=0xFF+13) {
			return 13;
		} else if (value<=0xFFFF+269) {
			return 14;
		} else {
			throw 'ERROR: CoapPacket.serialize [Nibble value larger that 526345 is not supported]';
		}
	}
};


//Protocol helper functions
////////////////////////////////////////////////////////////////////////////////

Lwm2mDevKit.Copper.isPowerOfTwo = function(i) {
	return ((i & (i-1))==0);
};

Lwm2mDevKit.Copper.leadingZero = function(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
};

//for the string-oriented socket interface
Lwm2mDevKit.Copper.bytes2data = function(b) {
	var str = '';
	for (let i in b) {
		str += String.fromCharCode(b[i] & 0xFF);
	}
	return str;
};
Lwm2mDevKit.Copper.data2bytes = function(data) {
	var b = new Array(0);
	for (let i=0; i<data.length; i++) {
		b.push(0xFF & data.charCodeAt(i));
	}
	return b;
};

Lwm2mDevKit.Copper.str2bytes = function(str) {

	let b = new Array(0);
	
	if (str!=null) {
		let utf8 = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.lwm2m-devkit.encode-utf-8');
	
		for (let i=0; i<str.length; i++) {
			let c = str.charCodeAt(i);
			
			if (c < 128 || !utf8) {
				b.push(0xFF & c);
			} else if((c > 127) && (c < 2048)) {
				b.push(0xFF & ((c >> 6) | 192));
				b.push(0xFF & ((c & 63) | 128));
			} else {
				b.push(0xFF & ((c >> 12) | 224));
				b.push(0xFF & (((c >> 6) & 63) | 128));
				b.push(0xFF & ((c & 63) | 128));
			}
		}
	}
	
	return b;
};

Lwm2mDevKit.Copper.bytes2str = function(b) {
	var utf8 = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.lwm2m-devkit.encode-utf-8');

	var str = '';
	for (let i=0; i<b.length; ++i) {
		
		let c = b[i] & 0xFF;
		
		if (c < 128 || !utf8) {
			str += String.fromCharCode(c);
		} else if((c > 191) && (c < 224) && (i+1 < b.length)) {
			let c2 = b[i+1] & 0xFF;
			str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 1;
		} else if (c < 240 && (i+2 < b.length)) {
			let c2 = b[i+1] & 0xFF;
			let c3 = b[i+2] & 0xFF;
			str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 2;
		} else if (i+3 < b.length) {
			Lwm2mDevKit.logEvent('4-byte UTF-8');
			str += String.fromCharCode(0xFFFD); // char '�'
			i += 3;
		} else {
			Lwm2mDevKit.logEvent('Incomplete UTF-8 encoding');
			str += String.fromCharCode(0xFFFD); // char '�'
		}
	}
	return str;
};

Lwm2mDevKit.Copper.int2bytes = function(i) {
	var b = new Array(0);
	while (i>0) {
		b.unshift(0xFF & i);
		i >>>= 8;
	}
	return b;
};

Lwm2mDevKit.Copper.bytes2int = function(b) {
	var i = 0;
	for (let k in b) {
		i = (i << 8) | b[k];
	}
	//convert to unsigned int
	return i>>>0;
};

Lwm2mDevKit.Copper.hex2bytes = function(h) {
	var b = new Array();
	for (let i=h.length-2; i>0; i-=2) {
		b.unshift(parseInt(('0x'+h.substr(i,2)).replace(/xx/, 'x')));
	}
	return b;
};

Lwm2mDevKit.Copper.bytes2hex = function(b) {
	var hex = '0x';
	if (Array.isArray(b) && b.length==0) {
		hex += '00';
	} else {
		for (let k in b) {
			hex += Lwm2mDevKit.Copper.leadingZero(b[k].toString(16).toUpperCase());
		}
	}
	
	return hex;
};

Lwm2mDevKit.Copper.str2hex = function(s) {
	var temp;
	if (s.substr(0,2)=='0x') {
		temp = Lwm2mDevKit.Copper.hex2bytes(s);
	} else {
		temp = Lwm2mDevKit.Copper.str2bytes(s);
	}
	
	return Lwm2mDevKit.Copper.bytes2hex(temp);
};

Lwm2mDevKit.Copper.float2bytes = function(value) {
    var bytes = 0;
    switch (value) {
        case Number.POSITIVE_INFINITY: bytes = 0x7F800000; break;
        case Number.NEGATIVE_INFINITY: bytes = 0xFF800000; break;
        case +0.0: bytes = 0x40000000; break;
        case -0.0: bytes = 0xC0000000; break;
        default:
            if (Number.isNaN(value)) { bytes = 0x7FC00000; break; }

            if (value <= -0.0) {
                bytes = 0x80000000;
                value = -value;
            }

            var exponent = Math.floor(Math.log(value) / Math.log(2));
            var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;

            exponent += 127;
            if (exponent >= 0xFF) {
                exponent = 0xFF;
                significand = 0;
            } else if (exponent < 0) exponent = 0;

            bytes = bytes | (exponent << 23);
            bytes = bytes | (significand & ~(-1 << 23));
        break;
    }
    return bytes;
};

Lwm2mDevKit.Copper.double2bytes = function(value) {

	var hiWord = 0, loWord = 0;
	switch (value) {
	    case Number.POSITIVE_INFINITY: hiWord = 0x7FF00000; break;
	    case Number.NEGATIVE_INFINITY: hiWord = 0xFFF00000; break;
	    case +0.0: hiWord = 0x40000000; break;
	    case -0.0: hiWord = 0xC0000000; break;
	    default:
	        if (Number.isNaN(value)) { hiWord = 0x7FF80000; break; }
	
	        if (value <= -0.0) {
	            hiWord = 0x80000000;
	            value = -value;
	        }
	
	        var exponent = Math.floor(Math.log(value) / Math.log(2));
	        var significand = Math.floor((value / Math.pow(2, exponent)) * Math.pow(2, 52));
	
	        loWord = significand & 0xFFFFFFFF;
	        significand /= Math.pow(2, 32);
	
	        exponent += 1023;
	        if (exponent >= 0x7FF) {
	            exponent = 0x7FF;
	            significand = 0;
	        } else if (exponent < 0) exponent = 0;
	
	        hiWord = hiWord | (exponent << 20);
	        hiWord = hiWord | (significand & ~(-1 << 20));
	    break;
	}
	
	let bytes = new Array(0);

	bytes.unshift( loWord>>24 & 0xFF );
	bytes.unshift( loWord>>16 & 0xFF );
	bytes.unshift( loWord>>8 & 0xFF );
	bytes.unshift( loWord>>0 & 0xFF );
	bytes.unshift( hiWord>>24 & 0xFF );
	bytes.unshift( hiWord>>16 & 0xFF );
	bytes.unshift( hiWord>>8 & 0xFF );
	bytes.unshift( hiWord>>0 & 0xFF );
	
	return bytes;
};
