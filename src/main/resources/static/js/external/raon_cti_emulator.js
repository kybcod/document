// Connection Info
var raon_ct_server_ip_ = "127.0.0.1";
var raon_ct_server_port_ = 28090;


// CTI Parameter
var raon_ct_station_ = "";
var raon_ct_agentid_ = "";
var raon_ct_group_code_ = "";
var raon_ct_employeeid_ = "";
var raon_ct_reason_code_ = 0;
var raon_rc = 0;
var raon_ct_login_count = 0;

var raon_alternate_flag = false;
var raon_command = null;

//==============================================================================
//  ct_connect_login
//==============================================================================
function raon_ct_connect_login() {
	// Get connection info
	raon_ct_server_ip_ = document.getElementById("server_ip").value;
	raon_ct_server_port_ = document.getElementById("server_port").value;

	var raon_server_ip = document.getElementById("server_ip").value;
	var raon_server_port = document.getElementById("server_port").value;

	// Get CTI parameter
	raon_ct_station_ = document.getElementById("station").value;
	raon_ct_agentid_ = document.getElementById("agentid").value;
	raon_ct_group_code_ = "";
	raon_ct_employeeid_ = ""; //document.getElementById("employeeid").value;


	disp_log("Connect & Login..., (" + raon_server_ip + "," + raon_server_port + ")");
	//-------------------------------------------
	//  wsk_connect
	//-------------------------------------------        
	raon_btnAble_event_code(1);
    raon_command = raon_wsc_connector(raon_server_ip, raon_server_port);
    wsc_connector_ = true
}

function raon_ct_login() {
	let param = {
		event: 101,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message

}

//==============================================================================
//  ct_logout_disconnect
//==============================================================================
function raon_ct_logout_disconnect() {
	let param = {
		event: 102,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
			raon_btnAble_event_code(1);
			disp_log("Logout...OK");
			disp_agent_status(SVC_CODE_SET_LOGOUT, 0);
			$('#state_1').text("로그아웃");
			wsk_boolean5_ = false;
}






//======================================================================
//  ct_connect
//======================================================================
function raon_ct_connect() {
	raon_server_ip = document.getElementById("server_ip").value;
	raon_server_port = document.getElementById("server_port").value;

	disp_log("Connect..., (" + raon_server_ip + "," + raon_server_port + ")");

		if (raon_rc === 0) {
			disp_log("Connect...OK");
			disp_conn_status(CONN_STATUS_ON);
		}
}

//======================================================================
//  ct_disconnect
//======================================================================
function raon_ct_disconnect() {
	disp_log("Disconnect...");

		if (raon_rc === 0) {
			disp_log("Disconnect...OK");
			disp_conn_status(CONN_STATUS_OFF);
		}
}





//==============================================================================
//  ct_ready 대기
//==============================================================================
function raon_ct_ready() {
	let param = {
		event: 103,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			disp_agent_status(SVC_CODE_SET_READY, 0);
//			$('#state_1').text("대기중");
//			raon_btnAble_event_code(30);
//			wsk_boolean5_ = false;
}

//==============================================================================
//  ct_aux
//==============================================================================
function raon_ct_aux(reason_code) {
	let param = {
		event: 104,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		reason_code: reason_code,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			disp_agent_status(SVC_CODE_SET_AUX, reason_code);
}

//==============================================================================
//  ct_acw
//==============================================================================
function raon_ct_acw() {
	let param = {
		event: 105,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			disp_agent_status(SVC_CODE_SET_ACW, 0);
}

//==============================================================================
//  ct_set_fwd
//==============================================================================
function raon_ct_set_fwd() {
	var fwd_dest = document.getElementById("fwd_dest").value;

	disp_log("SetFWD(" + fwd_dest + ")...");
		if (rc == 0) {
			disp_log("SetFWD(" + fwd_dest + ")...OK");
		}
}

//==============================================================================
//  ct_cancel_fwd
//==============================================================================
function raon_ct_cancel_fwd() {
	disp_log("CancelFWD...");
		if (rc == 0) {
			disp_log("CancelFWD...OK");
		}
}


//==============================================================================
//  ct_clear
//==============================================================================
function raon_ct_clear() {
	var make_dest = document.getElementById("make_dest").value.replace(/-/gi, '');
	var make_tel = make_dest;

	if (make_dest == null || make_dest == "") {
		basicAlert({ icon: 'error', title: '발신 번호를 입력해주세요.', text: '' });
		$('#make_dest').focus();
	} else {
		if (make_dest.substring(0, 1) == "9") {
			make_dest = make_dest.substring(1);
		}
		if (make_dest.length > 6) {
			logDisplay(2, "make_dest length > 6 , 1make call : " + make_dest);
			make_tel = make_dest;
			make_dest = "9" + make_dest;
		} else {
			logDisplay(2, "make_dest length < 6 , 2make call : " + make_dest);
		}

		document.getElementById("make_dest").value = make_tel;
	}
	let param = {
		event: 203,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: make_tel
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
			//			raon_btnAble(2, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0,	0);
}

//==============================================================================
//  ct_answer
//==============================================================================
function raon_ct_answer() {
	var make_dest = document.getElementById("make_dest").value.replace(/-/gi, '');
	var make_tel = make_dest;
	if (document.getElementById("consult_dest").value) {
		make_tel = document.getElementById("consult_dest").value;
	}


	if (make_tel == null || make_tel == "") {
		basicAlert({ icon: 'error', title: '발신 번호를 입력해주세요.', text: '' });
		$('#make_dest').focus();
	}
	let param = {
		event: 202,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: make_tel
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			$('#state_1').text("통화중");
}

//==============================================================================
//  ct_hold
//==============================================================================
function raon_ct_hold() {
	let param = {
		event: 204,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			raon_btnAble_event_code(34);
			//			raon_btnAble(2, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1);
//			$('#state_1').text("보류중");
}

//==============================================================================
//  ct_retrieve 보류해제
//==============================================================================
function raon_ct_retrieve() {
	let param = {
		event: 205,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: ''
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			wsk_boolean5_ = false;
//			raon_btnAble_event_code(35);
//			$('#state_1').text("통화중");
}

//==============================================================================
//  ct_conference
//==============================================================================
function raon_ct_conference() {
	var make_dest = document.getElementById("make_dest").value.replace(/-/gi, '');
	var make_tel = make_dest;
	if (document.getElementById("consult_dest").value) {
		make_tel = document.getElementById("consult_dest").value;
	}
	let param = {
		event: 207,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: make_tel
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//		raon_btnAble_event_code(38);
//		$('#state_1').text("3자통화");
}

//==============================================================================
//  ct_transfer
//==============================================================================
function raon_ct_transfer() {
	var make_dest = document.getElementById("make_dest").value.replace(/-/gi, '');
	var make_tel = make_dest;
	if (document.getElementById("consult_dest").value) {
		make_tel = document.getElementById("consult_dest").value;
	}
	let param = {
		event: 208,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: make_tel
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
}

//==============================================================================
//  ct_reconnect
//==============================================================================
function raon_ct_reconnect() {
	reconn_dest = document.getElementById("reconn_dest").value;
	let param = {
		event: 209,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: reconn_dest
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
//			$('#state_1').text("통화중");
//			wsk_boolean5_ = false;
//			raon_btnAble_event_code(36);
}

//==============================================================================
//  ct_cancel_password
//==============================================================================
function raon_ct_cancel_password() {
	disp_log("CancelPassword...");
		if (rc == 0) {
			disp_log("CancelPassword...OK");
		}
}



//==============================================================================
//  ct_make
//==============================================================================
function raon_ct_make() {
	var make_dest = document.getElementById("make_dest").value.replace(/-/gi, '');
	var make_tel = make_dest;

	if (make_dest == null || make_dest == "") {
		basicAlert({ icon: 'error', title: '발신 번호를 입력해주세요.', text: '' });
		$('#make_dest').focus();
	} else {
		if (make_dest.substring(0, 1) == "9") {
			make_dest = make_dest.substring(1);
		}
		if (make_dest.length > 6) {
			logDisplay(2, "make_dest length > 6 , 1make call : " + make_dest);
			make_tel = make_dest;
			make_dest = "9" + make_dest;
		} else {
			logDisplay(2, "make_dest length < 6 , 2make call : " + make_dest);
		}

		document.getElementById("make_dest").value = make_tel;
		var consult_data1 = document.getElementById("consultationContents").value;
		var consult_data2 = make_tel;

		let param = {
			event: 201,
			agent: raon_ct_agentid_,
			dn: raon_ct_station_,
			target: make_tel,
			uui: consult_data2,
			uei: consult_data1
		}
	//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
	    raon_command(JSON.stringify(param)); // Call the returned function to send the message

				disp_log("Make(" + make_dest + ")...OK");
				$('#state_1').text("통화중");
		if  (make_dest.substring(0, 1) == "9") {
			setTimeout("btn_call(4)", 5000);
		}

	}
}

//==============================================================================
//  ct_make
//==============================================================================
function raon_ct_make_uui() {
	var make_dest = document.getElementById("make_uui_dest").value;
	var uui_data = document.getElementById("make_uui_data").value;


	disp_log("MakeUUI(" + make_dest + ", UUI=" + uui_data + ")...");
		if (rc == 0) {
			disp_log("MakeUUI(" + make_dest + ")...OK");
		}
}


//==============================================================================
//  ct_consultation
//==============================================================================
function raon_ct_consultation() {

	document.getElementById("reconn_dest").value = document.getElementById("consult_dest").value;

	var consult_dest = document.getElementById("consult_dest").value.replace(/-/gi, '');

	if (consult_dest.substring(0, 1) == "9") {
		consult_dest = consult_dest.substring(1);
	}
	if (consult_dest.length > 6) {
		logDisplay(2, "consult_dest length > 6 , 1make call : " + consult_dest);
		consult_dest = "9" + consult_dest;
	} else {
		logDisplay(2, "consult_dest length < 6 , 2make call : " + consult_dest);
	}
	sessionStorage.setItem("TEL_NO", consult_dest);
	//	var consult_dest    = document.getElementById("consult_dest").value;   
	var consult_ani = document.getElementById("make_dest").value;
	var consult_ucid = document.getElementById("consult_ucid").value;
	var consult_data1 = document.getElementById("consultationContents").value;
	var consult_data2 = consult_ani;
	//    var consult_data2   = document.getElementById("consultationContents").value;  

	logDisplay(2, "[Consultation]ct_station:" + ct_station_ + ' | consult_dest=' + consult_dest + " | consult_ani=" + consult_ani +
		" | consult_ucid=" + consult_ucid + " | consult_data1=" + consult_data1 + " | consult_data2=" + consult_data2);

	let param = {
		event: 206,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: consult_dest,
		uui: consult_data2,
		uei: consult_data1
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
			$('#state_1').text("협의통화");
//		raon_btnAble_event_code(37);
}

//==============================================================================
//  ct_blind_transfer
//==============================================================================
function raon_ct_blind_transfer() {
	var consult_dest = document.getElementById("consult_dest").value.replace(/-/gi, '');

	if (consult_dest.substring(0, 1) == "9") {
		consult_dest = consult_dest.substring(1);
	}
	if (consult_dest.length > 6) {
		logDisplay(2, "consult_dest length > 6 , 1make call : " + consult_dest);
		consult_dest = "9" + consult_dest;
	} else {
		logDisplay(2, "consult_dest length < 6 , 2make call : " + consult_dest);
	}

	sessionStorage.setItem("TEL_NO", consult_dest);
	//    var consult_dest    = document.getElementById("consult_dest").value;   
	var consult_ani = document.getElementById("make_dest").value;
	var consult_ucid = document.getElementById("consult_ucid").value;
	var consult_data1 = document.getElementById("consult_data1").value;
	var consult_data2 = consult_ani;
	//    var consult_data2   = document.getElementById("consultationContents").value;  

	logDisplay(2, "[BlindTransfer]ct_station:" + ct_station_ + ' | consult_dest=' + consult_dest + " | consult_ani=" + consult_ani +
		" | consult_ucid=" + consult_ucid + " | consult_data1=" + consult_data1 + " | consult_data2=" + consult_data2);

	let param = {
		event: 211,
		agent: raon_ct_agentid_,
		dn: raon_ct_station_,
		callid: (wse_callid2_ == 0) ? wse_callid1_ : wse_callid2_,
		target: consult_dest,
		uui: consult_data2,
		uei: consult_data1
	}
//	logDisplay(1,"send AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+JSON.stringify(param))
    raon_command(JSON.stringify(param)); // Call the returned function to send the message
}

//==============================================================================
//  ct_ask_password
//==============================================================================
function raon_ct_ask_password() {
	disp_log("AskPassword...");

	var pw_control = document.getElementById("pw_control").value;
	var pw_data = document.getElementById("pw_data").value;


		if (rc == 0) {
			disp_log("AskPassword...OK");
		}
}


//==============================================================================
//  ct_alternatecall 2022.07.09
//==============================================================================
function raon_ct_alternatecall() {
	disp_log("AlternateCall...");
		if (rc == 0) {
			disp_log("AlternateCall...OK");
			//			wsk_boolean5_ = false;
			//			raon_btnAble_event_code(35);
			$('#state_1').text("통화중");
		}
}

function raon_time_reset() {
	sp_elapse_time_.postMessage({
		command: "elapse_start",
		data: ""
	});
}

function raon_wsc_connector(server_ip, server_port, data) {
    var raon_wsc_url = server_ip + ":" + server_port;
//	console.log("000 AAAAAAAAAAAAAAAAAAAAAAAAAAA:"+raon_wsc_url);
    var raon_wsc_sock = new WebSocket(raon_wsc_url);
    // WebSocket onopen event
    raon_wsc_sock.onopen = function () {
        console.log('WebSocket connected.');
        // Send a message to the server when the connection is open
//        raon_sendMessage(data);
        //raon_wsc_sock.send(data);
    };

    // WebSocket onmessage event
    raon_wsc_sock.onmessage = function (e) {
        logDisplay(1,"Message from server:"+ e.data + " , wse_callid1_:"+wse_callid1_+" , wse_callid2_:"+wse_callid2_);
        let json_data = e.data;
        try {
	        let json_parse = JSON.parse(json_data);
			let event = 0;
	        let sdn = '';
	        let ani = '';
	        let uei = '';
	        let callid = 0;
	        let reason = '';
	        event = (json_parse.TYPE) ? json_parse.TYPE : null;
	        sdn = (json_parse.SDN) ? json_parse.SDN : null;
	        ani = (json_parse.ANI) ? json_parse.ANI : null;
	        uei = (json_parse.UEI) ? json_parse.UEI : null;
	        callid = (json_parse.CALLID) ? json_parse.CALLID : 0;
	        reason = (json_parse.REASON) ? json_parse.REASON : '0';
//	        logDisplay(1,"111 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+event+ " , " + reason)

	        if (json_parse.RECV) {
				switch(event) {
				  case 451: //SVC_KEY_SET_LOGON
				  	raon_ct_ready();
				    break;
				  case 453: //SVC_KEY_SET_READY
			       	wsk_boolean5_ = false;
			       	raon_btnAble_event_code(30);
			       	$('#state_1').text('대기중');
			       	raon_time_reset();
				    break;
				  case 454: //SVC_KEY_SET_AUX
					wsk_boolean5_ = false;
			       	raon_btnAble_event_code(31);
					nrindex = -1;
					for (let i = 0; i < notreadyReason.length; i++) {
						if (notreadyReason[i][0] == reason) {
							$('#state_1').text("이석("+notreadyReason[i][1]+")");
							nrindex = i;
							break;
						}
					}	
					if ( nrindex == -1) {
						$('#state_1').text("이석(기타)");
					}
					raon_time_reset();
				    break;
				  case 455: //SVC_KEY_SET_ACW
					wsk_boolean5_ = false;
			       	raon_btnAble_event_code(32);
					$('#state_1').text("후처리");
					raon_btnAble_event_code(32);
					raon_time_reset();
				    break;
				  case 456: //SVC_KEY_SET_WORK
			       	raon_btnAble_event_code(10);
				    break;
				  case 401: //SVC_CODE_EVT_SVC_INITIATED
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
				    break;
				  case 402: //SVC_KEY_EVT_DELIVERED
//			        logDisplay(1,"222 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+json_parse.ANI+ " , "+ json_parse.UEI)
					wse_callid1_ = callid;
				    wse_callid2_ = 0;
				    wsk_call_alive = true;
				    $('#state_1').text('호인입');
					// Restart elapse time
					raon_time_reset();
					treeClickMenuPopup('12013');
					setTimeout(function() {
						raon_btnAble_event_code(10);
						document.getElementById("consult_ani").value = ani;
						document.getElementById("consult_dest").value = sdn
						document.getElementById('make_dest').value = ani;
				       	Call_popup(ani,uei);
					},300);					
				    break;
				  case 403: //SVC_CODE_EVT_FAILED
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
				    break;
				  case 404: //SVC_KEY_EVT_ESTABLISHED
				  	$('#state_1').text("통화중");
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
				       	raon_btnAble_event_code(11);
					} else if (wse_callid1_ == callid) {
				       	raon_btnAble_event_code(11);
						null;
					} else {
						wse_callid2_ = callid;
						raon_btnAble_event_code(12);
					}
				    break;
				  case 405: //SVC_KEY_EVT_CALL_CLEARED
				  	if ( wse_callid2_ > 0 ) {
						  if (callid == wse_callid1_) {
							  wse_callid1_ = wse_callid2_;
						  }
						  raon_btnAble_event_code(11);
						  wse_callid2_ = 0;
					} else {
				       	raon_btnAble_event_code(18);
						wse_callid1_ = 0;
						document.getElementById("consult_ani").value = '';
						document.getElementById("consult_dest").value = ''
						Call_End();
						raon_ct_acw();
						wsk_call_alive = false;
//						$('#state_1').text("후처리");
//						raon_btnAble_event_code(33);
					}
				    break;
				  case 406: //SVC_KEY_EVT_HELD
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
			       	wsk_boolean5_ = true;
			       	wsk_boolean4_ = true;
			       	raon_btnAble_event_code(23);
			       	$('#state_1').text("보류중");
				    break;
				  case 407: //SVC_KEY_EVT_RETRIEVED
				    wse_callid2_ = 0;
			       	wsk_boolean5_ = false;
			       	wsk_boolean4_ = false;
			       	raon_btnAble_event_code(24);
			       	$('#state_1').text("통화중");
				    break;
				  case 408: //SVC_KEY_EVT_CONFERENCED
					wse_callid1_ = callid;
				    wse_callid2_ = 0;
			       	raon_btnAble_event_code(26);
				    break;
				  case 409: //SVC_KEY_EVT_TRANSFERRED
					wse_callid1_ = callid;
				    wse_callid2_ = 0;
				    
				  	if (wsk_call_alive == false) {
						wsk_call_alive = true;
						$('#state_1').text('호인입');
						raon_btnAble_event_code(17);
						raon_time_reset();
						treeClickMenuPopup('12013');
						setTimeout(function() {
							raon_btnAble_event_code(10);
							document.getElementById("consult_ani").value = ani;
							document.getElementById("consult_dest").value = sdn
							document.getElementById('make_dest').value = ani;
					       	Call_popup(ani,uei);
						},300);					
					} else {
						$('#state_1').text("통화중");
						raon_btnAble_event_code(22);
					}
				    break;
				  case 410: //SVC_KEY_EVT_TRANSFER_CLEARED
			       	raon_btnAble_event_code(19);
					wse_callid1_ = 0;
				    wse_callid2_ = 0;
					document.getElementById("consult_ani").value = '';
					document.getElementById("consult_dest").value = ''
					Call_End();
					raon_ct_acw();
					wsk_call_alive = false;
//					$('#state_1').text("후처리");
//					raon_btnAble_event_code(33);
				    break;
				  case 411: //SVC_KEY_EVT_CONSULT_CLEARED
			       	raon_btnAble_event_code(16);
				    wse_callid2_ = 0;
				    break;
				  case 412: //SVC_CODE_EVT_ABANDON_CLEARED
			       	raon_btnAble_event_code(18);
					wse_callid1_ = 0;
				    wse_callid2_ = 0;
				    Call_End();
				    raon_ct_acw();
				    wsk_call_alive = false;
				    break;
				  case 415: //SVC_CODE_EVT_DIVERTED
					wse_callid1_ = 0;
				    wse_callid2_ = 0;
				    Call_End();
				    raon_ct_acw();
				    wsk_call_alive = false;
//					$('#state_1').text("후처리");
//					raon_btnAble_event_code(33);
				    break;
				  case 416: //SVC_KEY_EVT_DELIVERED_OUT
				  	wsk_call_alive = true;
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
						$('#state_1').text("발신중");
						// Restart elapse time
						raon_time_reset();
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
			       	raon_btnAble_event_code(27);
				    break;
				  case 417: //SVC_CODE_EVT_NETWORK_REACHED
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
				    break;
				  case 418: //SVC_CODE_EVT_ORIGINATED
					if (wse_callid1_ == 0) {
						wse_callid1_ = callid;
					    wse_callid2_ = 0;
					} else if (wse_callid1_ == callid) {
						null;
					} else {
						wse_callid2_ = callid;
					}
				    break;
				  case 421: //SVC_KEY_EVT_CONSULT_OK
				  	wse_callid2_ = callid;
			       	raon_btnAble_event_code(28);
			       	$('#state_1').text('협의중');
				    break;
				  case 997: //미니전광판 큐대기 및 상담사 상태
//    temp_msg = '{"RECV":"E_DISPLAY","TYPE":997,"MDN":"ALL","RPWAIT":' + str(rpWait) + ',"EMPTOTAL":' + str(empTotal) + ',"EMPREADY":' + str(empReady) + ',"EMPNOTREADY":' + str(empNotReady) + ',"EMPAFTERCALLWORK":' + str(empAfterCallWork) + ',"EMPWORK":' + str(empWork) +'}'
				    let rpWait = 0;
				    let empReady = 0;
				    let empNotReady = 0;
				    let empAfterCallWork = 0;
				    let empWork = 0;
				    let empTotal = 0
				    
			        rpWait = (json_parse.RPWAIT) ? json_parse.RPWAIT : 0;
			        empTotal = (json_parse.EMPTOTAL) ? json_parse.EMPTOTAL : 0;
			        empReady = (json_parse.EMPREADY) ? json_parse.EMPREADY : 0;
			        empNotReady = (json_parse.EMPNOTREADY) ? json_parse.EMPNOTREADY : 0;
			        empAfterCallWork = (json_parse.EMPAFTERCALLWORK) ? json_parse.EMPAFTERCALLWORK : 0;
			        empWork = (json_parse.EMPWORK) ? json_parse.EMPWORK : 0;
					document.getElementById('wait_call_board').innerHTML = rpWait;
					document.getElementById('work_person').innerHTML = empTotal;
					document.getElementById('ready_call').innerHTML = empReady;
					document.getElementById('bu_call').innerHTML = empWork;
					document.getElementById('aw_call_board').innerHTML = empAfterCallWork;
					document.getElementById('nr_board').innerHTML = empNotReady;
					document.getElementById('etc').innerHTML = empTotal - (empReady + empWork + empAfterCallWork + empNotReady);
				    break;
				  default:
				    break;
				}
			}
		} catch (err) {
			logDisplay(1,"222 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA: parse error");
		}

        // Display the received message on the webpage if needed
    };

    // WebSocket onerror event
//    raon_wsc_sock.onerror = function (e) {
//        console.error('WebSocket error:', e);
//    };

    // WebSocket onclose event
    raon_wsc_sock.onclose = function (e) {
        console.log('WebSocket connection closed:');
    };

    // Function to send messages to the server
    function raon_sendMessage(data) {
        console.log('WebSocket send:', data);
        raon_wsc_sock.send(data);
    }

    // Return a function that can be used to send messages
    return function (message) {
        raon_sendMessage(message);
    };
}

