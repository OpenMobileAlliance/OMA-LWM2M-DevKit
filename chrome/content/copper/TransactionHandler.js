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
 *         Code handling message transactions for the CoAP protocol
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

Lwm2mDevKit.Transaction = function(myMessage, myTimer) {
	this.message = myMessage;
	this.timer = myTimer;
	
	this.rttStart = new Date().getTime();
	
	return this;
};
Lwm2mDevKit.Transaction.prototype = {
	message : null,
	timer : null,
	
	rttStart : 0
};

Lwm2mDevKit.TransactionHandler = function(myClient) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0x10000);
	
	this.client = myClient;
	this.client.register( Lwm2mDevKit.myBind(this, this.handle) );
	
	this.transactions = new Object();
	this.requests = new Object();
	this.registeredTokens = new Object();
	this.registeredTIDs = new Object();
	this.dupFilter = new Array();
	this.dupCache = new Object();
	
	return this;
};

Lwm2mDevKit.TransactionHandler.prototype = {

	tid : 0,

	client : null,
	defaultCB : null,
	
	transactions : null,
	
	requests : null,
	registeredTokens : null,
	registeredTIDs : null,
	
	dupFilter : null,
	dupCache : null,
	
	registerCallback : function(myCB) {
		this.defaultCB = myCB;
	},
	
	incTID : function() {
		this.tid = 0xFFFF & (this.tid+1);
		return this.tid;
	},
	
	stopRetransmissions : function() {
		for (let t in this.transactions) {
			// only cancel default transactions corresponding to the user requests
			if (this.transactions[t] && this.transactions[t].cb==null) {
				if (this.transactions[t].timer) {
					window.clearTimeout(this.transactions[t].timer);
				}
				delete this.transactions[t];
				Lwm2mDevKit.logEvent('INFO: TransactionHandler.cancelTransactions [canceled message '+t+']');
			}
		}
	},
	
	cancelTransactions : function() {
		this.stopRetransmissions();
		
		this.requests = new Object();
		this.registeredTokens = new Object();
		this.registeredTIDs = new Object();
	},
	
	registerToken : function(token, cb) {
		Lwm2mDevKit.logEvent('INFO: Registering token '+token);
		this.registeredTokens[token] = cb;
	},
	
	deRegisterToken : function(token) {
		if (this.registeredTokens[token]) {
			Lwm2mDevKit.logEvent('INFO: Deregistering token '+token);
			delete this.registeredTokens[token];
		}
		for (let i in this.registeredTokens) {
			if (this.registeredTokens[i]) Lwm2mDevKit.logEvent('  '+i);
		}
	},
	
	send : function(message, reqCB) {
		
		if (this.client.ended) return;
		
		// set transaction ID for message
		if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON || message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_NON) {
			message.setTID( this.incTID() );
		}
		
		var that = this; // struggling with the JavaScript scope thing...
		var timer = null;
		
		// store reliable transaction
		if (message.isConfirmable()) {
			if (Lwm2mDevKit.behavior.retransmissions) {
				// schedule resend without RANDOM_FACTOR since we already have human jitter
				timer = window.setTimeout(function(){Lwm2mDevKit.myBind(that,that.resend(message.getTID()));}, Lwm2mDevKit.Copper.RESPONSE_TIMEOUT);
			} else {
				// also schedule 'not responding' timeout when retransmissions are disabled 
				timer = window.setTimeout(function(){Lwm2mDevKit.myBind(that,that.resend(message.getTID()));}, 16000); // 16 seconds
			}
			Lwm2mDevKit.logEvent('INFO: Storing transaction '+ message.getTID());
			this.transactions[message.getTID()] = new Lwm2mDevKit.Transaction(message, timer);
		}
		
		// store request callback through token matching
		if (message.isRequest()) {
			
			while (this.requests[message.getToken()]!=null && this.registeredTokens[message.getToken()]==null) {
				Lwm2mDevKit.logEvent('INFO: Default token already in use');
				message.setToken(new Array([parseInt(Math.random()*0x100)]));
			}
			this.requests[message.getToken()] = reqCB==null ? this.defaultCB : reqCB;
			
			// also save callback by TID
			this.registeredTIDs[message.getTID()] = this.requests[message.getToken()];
		// store ping
		} else if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON && message.getCode()==0) {
			this.registeredTIDs[message.getTID()] = Lwm2mDevKit.pingHandler;
		}

		Lwm2mDevKit.logMessage(message, true);
		
		this.client.send( message.serialize() );
	},
	
	resend : function(tid) {
		if (Lwm2mDevKit.behavior.retransmissions && this.transactions[tid]!==undefined && (this.transactions[tid].message.getRetries() < Lwm2mDevKit.Copper.MAX_RETRANSMIT)) {
			
			var that = this;
			this.transactions[tid].message.incRetries();
			
			var timeout = Lwm2mDevKit.Copper.RESPONSE_TIMEOUT*Math.pow(2,this.transactions[tid].message.getRetries());
			this.transactions[tid].timer = window.setTimeout(function(){Lwm2mDevKit.myBind(that,that.resend(tid));}, timeout);
			
			Lwm2mDevKit.logMessage(this.transactions[tid].message, true);
			
			this.client.send( this.transactions[tid].message.serialize() );
			
			Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Re-transmitting message '+tid+' ('+this.transactions[tid].message.getRetries()+'/'+Lwm2mDevKit.Copper.MAX_RETRANSMIT+')');
		} else {
			delete this.transactions[tid];
			Lwm2mDevKit.logEvent('WARNING: Message ' + tid + ' timed out.');
			Lwm2mDevKit.InformationReporting.cancelAll();
			Lwm2mDevKit.coapEndpoint.cancelTransactions();
			Lwm2mDevKit.Registration.onDeregister();
		}
	},
	
	handle : function(datagram) {
		// parse byte message to CoAP message
		var message = new Lwm2mDevKit.CoapMessage();
		message.parse(datagram);
		
		if (this.transactions[message.getTID()]) {
			// calculate round trip time
			var ms = (new Date().getTime() - this.transactions[message.getTID()].rttStart);
			message.getRTT = function() { return ms; };

			// stop retransmission
			Lwm2mDevKit.logEvent('INFO: Closing message ' + message.getTID() );
			if (this.transactions[message.getTID()].timer) window.clearTimeout(this.transactions[message.getTID()].timer);
			
			// check observe cancellation
			if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_RST && this.transactions[message.getTID()].message.getObserve())
				Lwm2mDevKit.InformationReporting.cancel(this.transactions[message.getTID()].message.getToken(true), message);
			
			// clear transaction
			delete this.transactions[message.getTID()];
			
		// filter duplicates
		} else if (this.dupFilter.indexOf(message.getTID()) != -1) {
			
			if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON) {
				var reply = this.dupCache[message.getTID()];
				if (reply) {
					Lwm2mDevKit.logEvent('INFO: Replying to duplicate (Message ID: '+message.getTID()+')');
					this.send(reply);
				} else if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON) {
					Lwm2mDevKit.logEvent('INFO: Acking duplicate (Message ID: '+message.getTID()+')');
					this.ack(message.getTID());
				}
			} else {
				Lwm2mDevKit.logEvent('INFO: Ignoring duplicate (Message ID: '+message.getTID()+')');
			}
			return;
		}
		
		

		// callback for message
		var callback = null;
		
		// Empty messages
		if (message.getCode()==0) {
		
			if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_ACK) {
				callback = this.registeredTIDs[message.getTID()];
				delete this.registeredTIDs[message.getTID()];
				
			} else if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_RST) {
				callback = this.registeredTIDs[message.getTID()];
				delete this.registeredTIDs[message.getTID()];
				
			}
			
		// Requests
		} else if (message.getCode()<32) {
			
			callback = Lwm2mDevKit.serverHandler;
			
		// Responses
		} else {
			
			// request matching by token
			if (this.requests[message.getToken()]) {
				
				if (!this.registeredTIDs[message.getTID()]) {
					if (message.getType()!=Lwm2mDevKit.Copper.MSG_TYPE_CON && message.getType()!=Lwm2mDevKit.Copper.MSG_TYPE_NON) {
						Lwm2mDevKit.logEvent('WARNING: TransactionHandler.handle [wrong type for separate from server: '+message.getType(true)+']');
					} else {
						Lwm2mDevKit.logEvent('INFO: Incoming separate reponse (Token: '+message.getToken()+')');
						// implicit acknowledgement
						this.stopRetransmissions();
					}
				}

				callback = this.requests[message.getToken()];
				delete this.requests[message.getToken()];
				delete this.registeredTIDs[message.getTID()];
			
			// check registered Tokens, e.g., subscriptions
			} else if (this.registeredTokens[message.getToken()]) {
				callback = this.registeredTokens[message.getToken()];
			
			// error
			} else {
				Lwm2mDevKit.logEvent('WARNING: TransactionHandler.handle [unknown token]');
				
				if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON) {
					this.reset(message.getTID());
				}
			}
		}
		
		Lwm2mDevKit.logMessage(message, false);
		
		// callback might set reply for message used by deduplication
		if (callback) {
			callback(message);
		}
		
		// ack all successfully received CON messages
		if (message.reply) {
			this.send(message.reply);
		} else if (message.getType()==Lwm2mDevKit.Copper.MSG_TYPE_CON) {
			this.ack(message.getTID());
		}
		
		// add to duplicates filter
		if (message.getType()!=Lwm2mDevKit.Copper.MSG_TYPE_RST) {
			this.dupFilter.unshift(message.getTID());
			if (message.reply) this.dupCache[message.getTID()] = message.reply;
			if (this.dupFilter.length>10) {
				delete this.dupCache[this.dupFilter.pop()];
			}
		}
	},
	
	ack : function(tid) {
		var ack = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.Copper.MSG_TYPE_ACK);
		ack.setTID( tid );
		Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Sending ACK for message '+tid);
		this.send( ack );
	},
	
	reset : function(tid) {
		var rst = new Lwm2mDevKit.CoapMessage(Lwm2mDevKit.Copper.MSG_TYPE_RST);
		rst.setTID( tid );
		Lwm2mDevKit.popup(Lwm2mDevKit.hostname+':'+Lwm2mDevKit.port, 'Sending RST for message '+tid);
		this.send( rst );
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
