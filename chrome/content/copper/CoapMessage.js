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
 *         A wrapper for the different CoAP versions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

/*
 * Constants that must be present in all CoAP version modules
 * 
 * GET, POST, DELETE, SUBSCRIBE
 * WELL_KNOWN_RESOURCES
 * RESPONSE_TIMEOUT, MAX_RETRANSMIT
 */

//create a request/ack, received responses use parse()
Lwm2mDevKit.CoapMessage = function(type, code, uri, pl) {
	this.packet = new Lwm2mDevKit.Copper.CoapPacket();
	
	this.packet.type = type;
	this.packet.code = code ? code : 0;
	
	this.retries = 0;
	
	// URI
	if (uri!=null) {
		this.setUri(uri);
	}
	// payload
	if (pl!=null) {
		this.setPayload(pl);
	}
	
	return this;
};

Lwm2mDevKit.CoapMessage.prototype = {
	packet : null,
	
	// message summary (e.g., for info/debug dumps)
	getSummary : function() {
		var ret = '';
		ret += ' Type: '+this.getType(true);
		ret += '\n Code: '+this.getCode(true);
		ret += '\n Message ID: '+this.getTID();
		if (this.getOptions().length>0) {
			ret += '\n Options:'+this.getOptions(true);
		}
		if (this.getPayload().length>0) {
			ret += '\n Payload: '+this.getPayload().length+' bytes';
			if (this.isPrintable(this.getContentFormat())) {
				ret += '\n'+Lwm2mDevKit.Copper.bytes2str(this.getPayload());
			}
		}
		return ret;
	},
	
	// readable type
	getType : function(readable) {
		if (readable) {
			switch (parseInt(this.packet.type)) {
				case Lwm2mDevKit.Copper.MSG_TYPE_CON: return 'CON';
				case Lwm2mDevKit.Copper.MSG_TYPE_NON: return 'NON';
				case Lwm2mDevKit.Copper.MSG_TYPE_ACK: return 'ACK';
				case Lwm2mDevKit.Copper.MSG_TYPE_RST: return 'RST';
				default: return 'unknown ('+this.packet.type+')';
			}
		} else {
			return parseInt(this.packet.type);
		}
	},
	setType : function(type) {
		this.packet.type = type;
	},

	isConfirmable : function() {
		return this.packet.type==Lwm2mDevKit.Copper.MSG_TYPE_CON;
	},
	
	getOptionCount : function() {
		return this.packet.optionCount;
	},
	
	// readable method or response code
	getCode : function(readable) {
		// codes are version specific
		return this.packet.getCode(readable);
	},
	setCode : function(code) {
		this.packet.code = code;
	},
	
	getTID : function() {
		return this.packet.tid;
	},
	setTID : function(id) {
		this.packet.tid = id;
	},
	
	getRetries : function() {
		return this.retries;
	},
	
	incRetries : function() {
		++this.retries;
	},
	
	isRequest: function() {
		//FIXME official range draft-08: 1-31, define range in .jsm
		return this.getCode()>=1 && this.getCode()<=31;
	},
	isResponse: function() {
		return this.getCode()>=64;
	},
	
	isSuccess: function() {
		return Math.floor(this.getCode() / 32) == 2;
	},
	isClientError: function() {
		return Math.floor(this.getCode() / 32) == 4;
	},
	isServerError: function() {
		return Math.floor(this.getCode() / 32) == 5;
	},
	
	/*
	 * Option definitions for different versions
	 * 
	draft-05                            draft-03                            draft-00
	const Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE = 1;		const Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE = 1;		const Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE = 0;
										MUST be supported, once
										
	const Lwm2mDevKit.Copper.OPTION_MAX_AGE = 2;			const Lwm2mDevKit.Copper.OPTION_MAX_AGE = 2;			const Lwm2mDevKit.Copper.OPTION_MAX_AGE = 3;
										once
										
	const Lwm2mDevKit.Copper.OPTION_PROXY_URI = 3;			
	
	const Lwm2mDevKit.Copper.OPTION_ETAG = 4;				const Lwm2mDevKit.Copper.OPTION_ETAG = 4;				const Lwm2mDevKit.Copper.OPTION_ETAG = 4;
										SHOULD be included for cache refresh, multiple
										
	const Lwm2mDevKit.Copper.OPTION_URI_HOST = 5;			const Lwm2mDevKit.Copper.OPTION_URI_AUTH = 5;			const Lwm2mDevKit.Copper.OPTION_URI = 1;
										MUST be supported by proxy
										SHOULD be included if known, once
										
	const Lwm2mDevKit.Copper.OPTION_LOCATION_PATH = 6;		const Lwm2mDevKit.Copper.OPTION_LOCATION = 6;
										MAY be included for 30x response, once
										
	const Lwm2mDevKit.Copper.OPTION_URI_PORT = 7;
	
	const Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY = 8;
	
	const Lwm2mDevKit.Copper.OPTION_URI_PATH = 9;			const Lwm2mDevKit.Copper.OPTION_URI_PATH = 9;			const Lwm2mDevKit.Copper.OPTION_URI = 1;
										MUST be supported, once
										
	const Lwm2mDevKit.Copper.OPTION_OBSERVE = 10;			const Lwm2mDevKit.Copper.OPTION_SUB_LIFETIME = 10;		const Lwm2mDevKit.Copper.OPTION_SUB_LIFETIME = 6;
	
	const Lwm2mDevKit.Copper.OPTION_TOKEN = 11;			const Lwm2mDevKit.Copper.OPTION_TOKEN = 11;
										MUST be included for delayed response (SHOULD omit Uri), once
										If delayed and no option in req, return 240
										
	const Lwm2mDevKit.Copper.OPTION_BLOCK = 13;			const Lwm2mDevKit.Copper.OPTION_BLOCK = 13;
	
	const Lwm2mDevKit.Copper.OPTION_NOOP = 14;				const Lwm2mDevKit.Copper.OPTION_NOOP = 14;
	
	const Lwm2mDevKit.Copper.OPTION_URI_QUERY = 15;		const Lwm2mDevKit.Copper.OPTION_URI_QUERY = 15;		const Lwm2mDevKit.Copper.OPTION_URI = 1;
										MUST be supported, once
																			const Lwm2mDevKit.Copper.OPTION_URI_CODE = 2;
																			const Lwm2mDevKit.Copper.OPTION_DATE = 5;
	*/
	
	// Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE:00+
	getContentFormat : function(readable) {
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE); // integer

		if (opt==null) return null;
		
		if (readable) {
			return new Array(Lwm2mDevKit.Copper.getContentFormatName(opt), opt);
		} else {
			return opt;
		}
	},
	setContentType : function(content) {
		if (content>0xFFFF) {
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setContentType [Must be 1 or 2 bytes; ignoring]');
		} else {
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE, content);
		}
	},
	
	// Lwm2mDevKit.Copper.OPTION_MAX_AGE:00+
	getMaxAge : function(readable) {
		var optLen = this.packet.getOptionLength(Lwm2mDevKit.Copper.OPTION_MAX_AGE);
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_MAX_AGE); // integer
		
		if (opt==null) return null;

		if (readable) {
			
			var ret = '';
			var time = opt;
			
			if (time==0) {
				ret += '0 ';
			} else {
				// split into weeks, days, hours, minutes, and seconds
				var s = time % 60;
				time = Math.floor(time/60);
				var m = time % 60;
				time = Math.floor(time/60);
				var h = time % 24;
				time = Math.floor(time/24);
				var d = time % 7;
				time = Math.floor(time/7);
				var w = time;
				
				var y = 0;
				if (w>104) var y = Math.round(1212424351/60.0/60.0/24.0/365.25*100.0)/100.0;
				
				// only print from largest to smallest given unit
				if (w) ret += w+'w ';
				if (d||(w&&(h||m||s))) ret += d+'d ';
				if (h||((w||d)&&(m||s))) ret += h+'h ';
				if (m||((w||d||h)&&s)) ret += m+'m ';
				if (s) ret += s+'s ';
				if (y) ret += '(~'+y+'y) ';
			}
			
			return new Array(ret.substring(0, ret.length-1), optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setMaxAge : function(age) {
		if (age>0xFFFFFFFF) {
			age = (0xFFFFFFFF & age);
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setMaxAge [max-age must be 1-4 bytes; masking to 4 bytes]');
		}
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_MAX_AGE, age);
	},
	
	// Lwm2mDevKit.Copper.OPTION_PROXY_URI:04+
	getProxyUri : function(readable) {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_PROXY_URI); // string
	},
	setProxyUri : function(proxy) {
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_PROXY_URI, proxy);
	},
	
	// Lwm2mDevKit.Copper.OPTION_PROXY_URI:04+
	getProxyScheme : function(readable) {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME); // string
	},
	setProxyScheme : function(scheme) {
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_PROXY_SCHEME, scheme);
	},
	
	// Lwm2mDevKit.Copper.OPTION_ETAG:00+
	getETag : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_ETAG); // byte array
	},
	setETag : function(tag) {
		
		if (!Array.isArray(tag)) {
			Lwm2mDevKit.logEvent('INFO: Converting ETag to byte array');
			if (tag.substr(0,2)=='0x') {
				tag = Lwm2mDevKit.Copper.hex2bytes(tag);
			} else {
				tag = Lwm2mDevKit.Copper.str2bytes(tag);
			}
		}
		
		while (tag.length>Lwm2mDevKit.Copper.ETAG_LENGTH) {
			tag.pop();
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setETag [ETag must be 1-'+Lwm2mDevKit.Copper.ETAG_LENGTH+' bytes; cropping to '+Lwm2mDevKit.Copper.ETAG_LENGTH+' bytes]');
		}
		
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_ETAG, tag);
	},
	
	// Lwm2mDevKit.Copper.OPTION_URI_HOST:04+ / Lwm2mDevKit.Copper.OPTION_URI_AUTH:03*renamed
	getUriHost : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_URI_HOST); // string
	},
	setUriHost : function(host) {
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_URI_HOST, host);
	},
	// Lwm2mDevKit.Copper.OPTION_URI_PORT:04+
	getUriPort : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_URI_PORT); // int
	},
	setUriPort : function(port) {
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_URI_PORT, port);
	},
	// multiple Lwm2mDevKit.Copper.OPTION_URI_PATH:04+ / Lwm2mDevKit.Copper.OPTION_URI_PATH:03+
	getUriPath : function() {
		// multiple Lwm2mDevKit.Copper.OPTION_URI_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later

		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_URI_PATH); // string
	},
	// Lwm2mDevKit.Copper.OPTION_URI_QUERY:03+
	getUriQuery : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_URI_QUERY); // string
	},
	// convenience function
	getUri : function(readable) {
		
		var host = this.getUriHost();
		var port = this.getUriPort();
		var path = this.getUriPath();
		var query = this.getUriQuery();
		
		var uri = '';
		var decoded = 0;
		var multiple = null;
		
		if (host) {
			uri += 'coap://' + host;
			++decoded;
		}
		if (port) {
			uri += ':' + port;
			++decoded;
		}
		if (path) {
			uri += '/' + path;
			multiple = path.match(/\//g);
			decoded += 1 + (multiple!=null ? multiple.length : 0);
		}
		if (query) {
			uri += '?' + query;
			multiple = query.match(/&/g);
			decoded += 1 + (multiple!=null ? multiple.length : 0);
		}

		if (decoded<=0) return null;
		
		if (readable) {
			return new Array('Uri', uri, decoded+(decoded==1 ? ' option' : ' options'));
		} else {
			return uri;
		}
	},
	setUri : function(uri) {
		// URI encoding is version specific
		this.packet.setUri(uri);
	},
	
	// multiple Lwm2mDevKit.Copper.OPTION_LOCATION_PATH:04+ / Lwm2mDevKit.Copper.OPTION_LOCATION:03*renamed
	getLocationPath : function() {
		// multiple Lwm2mDevKit.Copper.OPTION_LOCATION_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later
		
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_LOCATION_PATH); // string
	},
	setLocationPath : function(path) {
		while (path.charAt(0)=='/') path = path.substr(1);
		
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_LOCATION_PATH, path);
	},
	// Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY:05+
	getLocationQuery : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY); // string
	},
	setLocationQuery : function(query) {
		while (query.charAt(0)=='?') query = query.substr(1);
		
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY, query);
	},
	// convenience function
	getLocation : function(readable) {
		var optLen = this.packet.getOptionLength(Lwm2mDevKit.Copper.OPTION_LOCATION_PATH);
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_LOCATION_PATH); // string
		
		var optLen2 = 0;
		
		if (this.packet.getOptionLength(Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY)) {
			opt += '?' + this.packet.getOption(Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY);
			optLen2 = this.packet.getOptionLength(Lwm2mDevKit.Copper.OPTION_LOCATION_QUERY);
		}
		
		if (optLen+optLen2<=0) return null;
		
		
		if (readable) {
			var multiple = opt.match(/\/|&/g);
			var decoded = 1 + (multiple!=null ? multiple.length : 0) + (optLen2>0 ? 1 : 0);
			if (opt.charAt(0)!='/') opt = '/' + opt;
			return new Array(opt, decoded+(decoded==1 ? ' option' : ' options'));
		} else {
			if (opt) opt = '/'+opt;
			return opt;
		}
	},
	
	// Lwm2mDevKit.Copper.OPTION_TOKEN:03+
	getToken : function(readable) {
		if (readable && this.packet.getOption(Lwm2mDevKit.Copper.OPTION_TOKEN)==null) return 'empty';
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_TOKEN); // byte array, treat as hex string
	},
	setToken : function(token) {
		
		// if copying an empty token
		if (!token) return;
		
		if (!Array.isArray(token)) {
			if (token.substr(0,2)=='0x') {
				token = Lwm2mDevKit.Copper.hex2bytes(token);
			} else {
				token = Lwm2mDevKit.Copper.str2bytes(token);
			}
		}
		
		while (token.length > Lwm2mDevKit.Copper.TOKEN_LENGTH) {
			token.pop();
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setToken [token must be 1-'+Lwm2mDevKit.Copper.TOKEN_LENGTH+' bytes; masking to '+Lwm2mDevKit.Copper.TOKEN_LENGTH+' bytes]');
		}
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_TOKEN, token);
	},
	
	// Lwm2mDevKit.Copper.OPTION_ACCEPT:07+
	getAccept : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_ACCEPT); // integer
	},
	setAccept : function(content) {
		if (content>0xFFFF) {
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setAccept [Must be 1 or 2 bytes; ignoring]');
		} else {
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_ACCEPT, content);
		}
	},
	
	// Lwm2mDevKit.Copper.OPTION_IF_MATCH:07+
	getIfMatch : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_IF_MATCH); // byte array
	},
	setIfMatch : function(tag) {
		if (!Array.isArray(tag)) {
			Lwm2mDevKit.logEvent('INFO: Converting ETag to byte array');
			if (tag.substr(0,2)=='0x') {
				tag = Lwm2mDevKit.Copper.hex2bytes(tag);
			} else {
				tag = Lwm2mDevKit.Copper.str2bytes(tag);
			}
		}
		
		while (tag.length>Lwm2mDevKit.Copper.ETAG_LENGTH) {
			tag.pop();
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setIfMatch [ETag must be 1-'+Lwm2mDevKit.Copper.ETAG_LENGTH+' bytes; cropping to '+Lwm2mDevKit.Copper.ETAG_LENGTH+' bytes]');
		}
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_IF_MATCH, tag);
	},
	
	// Lwm2mDevKit.Copper.OPTION_BLOCK2:06+ / Lwm2mDevKit.Copper.OPTION_BLOCK:03+
	getBlock : function(readable) {
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_BLOCK); // integer

		if (opt==null) return null;
		
		if (readable) {
			var ret = this.getBlockNumber();
			if (this.getBlockMore()) ret += '+';
			ret += ' ('+this.getBlockSize()+' B/block)';
			
			return ret;
		} else {
			return opt;
		}
	},
	setBlock : function(num, size, more) {
		
		if (size!=null) {
		
			var block = num << 4;
			var szx = 0;
			
			// check for power of two and correct size
			if (!Lwm2mDevKit.Copper.isPowerOfTwo(size)) {
				Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock ['+size+' not a power of two; using next smaller power]');
			}
			if (size<16) {
				size = 16;
				Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock [block size must be >=16; using 16]');
			}
			if (size>1024) {
				size = 1024;
				Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock [block size must be <=1024; using 1024]');
			}
			
			size >>= 4;
			for (let szx = 0; size; ++szx) size >>= 1;
			block |= szx - 1;
			
			if (more!=null) {
				block |= more ? 0x08 : 0x00;
			}
			
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_BLOCK, block);
			
		} else {
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_BLOCK, num);
		}
	},
	// convenience functions for block option parts
	getBlockNumber : function() {
		return (this.getBlock() >> 4);
	},
	getBlockSize : function() {
		return (16 << (0x07 & this.getBlock()));
	},
	getBlockMore : function() {
		return (parseInt(0x08 & this.getBlock())!=0) ? 1 : 0;
	},
	getBlockOffset : function() {
		return this.getBlockSize() * (this.getBlockNumber() + 1);
	},
	
	// Lwm2mDevKit.Copper.OPTION_BLOCK1:06+
	getBlock1 : function(readable) {
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_BLOCK1); // integer

		if (opt==null) return null;
		
		if (readable) {
			var ret = this.getBlock1Number();
			if (this.getBlock1More()) ret += '+';
			ret += ' ('+this.getBlock1Size()+' B/block)';
			
			return ret;
		} else {
			return opt;
		}
	},
	setBlock1 : function(num, size, more) {
		var block = num << 4;
		var szx = 0;
		
		// check for power of two and correct size
		if (!Lwm2mDevKit.Copper.isPowerOfTwo(size)) {
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock1 ['+size+' not a power of two; using next smaller power]');
		}
		if (size<16) {
			size = 16;
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock1 [block size must be >=16; using 16]');
		}
		if (size>1024) {
			size = 1024;
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setBlock1 [block size must be <=1024; using 1024]');
		}
		
		size >>= 4;
		for (let szx = 0; size; ++szx) size >>= 1;
		block |= szx - 1;
		if (more) {
			block |= 0x08;
		}
		
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_BLOCK1, block);
	},
	// convenience functions for block option parts
	getBlock1Number : function() {
		return (this.getBlock1() >> 4);
	},
	getBlock1Size : function() {
		return (16 << (0x07 & this.getBlock1()));
	},
	getBlock1More : function() {
		return (0x08 & this.getBlock1()) ? 1 : 0;
	},
	getBlock1Offset : function() {
		return this.getBlock1Size() * (this.getBlock1Number() + 1);
	},

	// Lwm2mDevKit.Copper.OPTION_SIZE2:18+ / Lwm2mDevKit.Copper.OPTION_SIZE:09+
	getSize : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_SIZE); // integer
	},
	setSize : function(num) {
		if (num>0xFFFFFFFF) {
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setSize [Must be 0-4 bytes; ignoring]');
		} else {
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_SIZE, num);
		}
	},
	// Lwm2mDevKit.Copper.OPTION_SIZE1:18+
	getSize1 : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_SIZE1); // integer
	},
	setSize1 : function(num) {
		if (num>0xFFFFFFFF) {
			Lwm2mDevKit.logEvent('WARNING: CoapMessage.setSize1 [Must be 0-4 bytes; ignoring]');
		} else {
			this.packet.setOption(Lwm2mDevKit.Copper.OPTION_SIZE1, num);
		}
	},
	
	// Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH:07+
	getIfNoneMatch : function() {
		var opt = this.packet.getOption(Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH); // byte array

		return (opt==null ? null : 'none');
	},
	setIfNoneMatch : function() {
		// only set option with length 0 (int=0)
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH, 0);
	},

	// Lwm2mDevKit.Copper.OPTION_SUB_LIFETIME:draft-ietf-core-observe-00*renamed
	getObserve : function() {
		return this.packet.getOption(Lwm2mDevKit.Copper.OPTION_OBSERVE); // int
	},
	setObserve : function(num) {
		if (num> 0xFFFFFF) num = num % 0xFFFFFF;
		this.packet.setOption(Lwm2mDevKit.Copper.OPTION_OBSERVE, num);
	},
	
	setCustom : function(num, value) {
		if (Lwm2mDevKit.Copper.getOptionName(num).match(/^Unknown/)) {
			if (value.substr(0,2)=='0x') {
				this.packet.setOption(parseInt(num), Lwm2mDevKit.Copper.hex2bytes(value));
			} else {
				this.packet.setOption(parseInt(num), Lwm2mDevKit.Copper.str2bytes(value));
			}
		} else {
			throw new Error('Cannot set '+Lwm2mDevKit.Copper.getOptionName(num)+' as custom option');
		}
	},
	
	// readable options list
	getOptions : function(asString) {
		
		if (asString) {
			var ret = '';

			for (let optTypeIt in this.packet.options) {
				if (optTypeIt==Lwm2mDevKit.Copper.OPTION_TOKEN) continue;
				
				if (Array.isArray(this.packet.options[optTypeIt][1])) {
					
					if (ret!='') ret += ', ';
					
					let name = Lwm2mDevKit.Copper.getOptionName(optTypeIt);
					let val = this.packet.getOption(optTypeIt);
					let info = this.packet.options[optTypeIt][0];
					
					switch (parseInt(optTypeIt)) {
			    		case Lwm2mDevKit.Copper.OPTION_BLOCK:
			    			val = this.getBlockNumber();
			    			val += '/'+this.getBlockMore();
			    			val += '/'+this.getBlockSize();
							break;
			    		case Lwm2mDevKit.Copper.OPTION_BLOCK1:
			    			val = this.getBlock1Number();
			    			val += '/'+this.getBlock1More();
			    			val += '/'+this.getBlock1Size();
							break;
					}
					
					ret += name + ': ' + val;
				}
			}

			return ret;
		} else {
			var ret = new Array();
			
			for (let optTypeIt in this.packet.options) {
		    	if (Array.isArray(this.packet.options[optTypeIt][1])) {
		    		var name = Lwm2mDevKit.Copper.getOptionName(optTypeIt);
		    		var value = this.packet.getOption(optTypeIt);
		    		var info = this.packet.options[optTypeIt][0]+' byte' + (this.packet.options[optTypeIt][0]!=1 ? 's' : '');
		    		
		    		switch (parseInt(optTypeIt)) {
			    		case Lwm2mDevKit.Copper.OPTION_URI_PATH:
			    		case Lwm2mDevKit.Copper.OPTION_LOCATION_PATH:
			    			value = '/' + value;
			    			break;
			    		case Lwm2mDevKit.Copper.OPTION_CONTENT_TYPE:
			    			info = value;
			    			value = Lwm2mDevKit.Copper.getContentFormatName(value);
			    			break;
			    		case Lwm2mDevKit.Copper.OPTION_ACCEPT:
			    			info = value;
			    			value = Lwm2mDevKit.Copper.getContentFormatName(value);
			    			break;
			    		case Lwm2mDevKit.Copper.OPTION_IF_NONE_MATCH:
			    			info = '';
			    			value = 'Set';
			    			break;
			    		case Lwm2mDevKit.Copper.OPTION_BLOCK:
			    			value = this.getBlockNumber();
			    			if (this.getBlockMore()) value += '+';
							value += ' ('+this.getBlockSize()+' B/block)';
							break;
			    		case Lwm2mDevKit.Copper.OPTION_BLOCK1:
			    			value = this.getBlock1Number();
			    			if (this.getBlock1More()) value += '+';
							value += ' ('+this.getBlock1Size()+' B/block)';
							break;
		    		}
		    		
		    		ret.push(new Array(name, value, info));
		    	}
			}
			
			return ret;
		}
	},
	
	// check if option is present
	isOption : function(optType) {
		var list = this.packet.getOptions();
		for (let i in list) {
			if (list[i]==optType) return true;
		}
		return false;
	},
	
	
	// payload functions
	getPayload : function() {
		return this.packet.payload;
	},
	getPayloadText : function() {
		return Lwm2mDevKit.Copper.bytes2str(this.getPayload());
	},
	setPayload : function(pl) {
		if (!Array.isArray(pl)) pl = Lwm2mDevKit.Copper.str2bytes(pl);
		this.packet.payload = pl;
	},
	appendPayload : function(pl) {
		this.packet.payload = this.packet.payload.concat(pl);
	},
	isPrintable : function(ct) {
		if (ct==null) ct = this.getContentFormat();
		
		switch (ct) {
			case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_PLAIN:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_CSV:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_TEXT_HTML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_RDF_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_SOAP_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_ATOM_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_XMPP_XML:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_JSON:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON:
			case null:
				return true;
				
			case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_GIF:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_JPEG:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_PNG:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_IMAGE_TIFF:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_AUDIO_RAW:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_VIDEO_RAW:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_EXI:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_FASTINFOSET:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV:
			case Lwm2mDevKit.Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE:
			default:
				return false;
		}
	},
	
	
	// convert message into datagram bytes
	serialize : function() {
		return this.packet.serialize();
	},
	
	// convert datagram bytes into message
	parse : function(datagram) {
		this.packet.parse(datagram);
	},
	
	// maybe more arguments needed 
	respond : function(code, payload, format) {
		this.reply = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.Copper.MSG_TYPE_ACK, code, null, payload);
		this.reply.setTID(this.getTID());
		this.reply.setToken(this.packet.getOption(Lwm2mDevKit.Copper.OPTION_TOKEN));
		
		if (format) this.reply.setContentType(format);
	},
	
	getReply : function() {
		return this.reply;
	}
};
