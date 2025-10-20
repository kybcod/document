//##############################################################################
//
//          sp_display.js
//
//                                          Softphone display
//                                          for CTIBridge 3.7
//                                          Edit by Lee eon woo
//  
//                                          Hansol Inticube Co., Ltd.
//                                          All rights reserved.
//
//##############################################################################


//-----------------------------------------------
//  Define connection status
//-----------------------------------------------
const CONN_STATUS_DEFAULT = 0;
const CONN_STATUS_ON = 1;
const CONN_STATUS_OFF = 2;

//-----------------------------------------------
//  Define global variable
//-----------------------------------------------
var log_text_ = "";
var log_count_ = 0;
var debug_text_ = "";
var debug_count_ = 0;

var pre_svc_code_ = 0;
var pre_reason_code_ = 0;
var flag_divert_ = false;
var conn_status_ = 0;


//==============================================================================
//  disp_log
//==============================================================================
WS_LOG = function() {
	var now = new Date();
	var date_string = pad(now.getHours()) +
		":" + pad(now.getMinutes()) +
		":" + pad(now.getSeconds()) +
		"." + pad(now.getMilliseconds(), 3);


	date_string = "[" + date_string + "] ";
	if (arguments[1] !== undefined && arguments[1] == 'error') {
		//        console.error(date_string + arguments[0]);
		//        logDisplay(3, date_string + arguments[0]);
	} else {
		//        logDisplay(3, date_string + arguments[0]);
	}

	disp_debug(arguments[0]);

}




//==============================================================================
//  disp_log
//==============================================================================
function disp_log(log_msg) {
	logDisplay(3, 'disp_log : ' + log_msg);
}





//==============================================================================
//  clear_log
//==============================================================================
function clear_log() {
	log_count_ = 0;
	log_text_ = "";
	$('#log').text(log_text_);
}

//==============================================================================
//  disp_log
//==============================================================================
function disp_debug(debug_msg) {
	if (debug_count_ >= 30) {
		debug_count_ = 0;
		debug_text_ = "";
	}

	debug_count_ += 1;
	debug_text_ += log_time() + " " + debug_msg + '\n';
	$('#log_debug').text(debug_text_);
}


//==============================================================================
//  clear_debug
//==============================================================================
function clear_debug() {
	debug_count_ = 0;
	debug_text_ = "";
	$('#log_debug').text(debug_text_);
}

//==============================================================================
//  disp_elapse_time
//==============================================================================
function disp_elapse_time(e) {
	if (e.data.message === 'elapse_time') {
		document.getElementById("elapse_time").innerHTML = e.data.data;
	}

	if (conn_status_ == CONN_STATUS_OFF) {
		if (flag_divert_) {
			//            document.getElementById("conn_status").className = "btn btn-danger";
			//            document.getElementById("conn_status").disabled  = false;
			flag_divert_ = false;
		}
		else {
			// button(class)
			//            document.getElementById("conn_status").className = "btn btn-warning";
			//            document.getElementById("conn_status").disabled  = false;
			flag_divert_ = true;
		}
	}
}

//==============================================================================
//  disp_connection
//==============================================================================
function disp_conn_status(conn_status) {
	conn_status_ = conn_status;

	switch (conn_status) {
		case CONN_STATUS_OFF:
			//            document.getElementById("conn_status").className = "btn btn-danger";
			//            document.getElementById("conn_status").disabled  = false;
			break;

		case CONN_STATUS_ON:
			//            document.getElementById("conn_status").className = "btn btn-info";
			//            document.getElementById("conn_status").disabled  = false;
			break;
		case CONN_STATUS_DEFAULT:
		default:
			//            document.getElementById("conn_status").className = "btn btn-default";
			//            document.getElementById("conn_status").disabled  = true;
			break;
	}

}




//------------------------------------------------------------------
//  disp_agent_status
//------------------------------------------------------------------
function disp_agent_status(svc_code, reason_code) {

	switch (svc_code) {
		case SVC_CODE_SET_LOGOUT:
			// Label
			disp_conn_status(CONN_STATUS_DEFAULT);
			document.getElementById("sp_status").innerHTML = "Please Login";

			// button(class)
			//            document.getElementById("btn_ready").className      = "btn btn-default";    
			//            document.getElementById("btn_aux").className        = "btn btn-default";                    
			//            document.getElementById("btn_acw").className        = "btn btn-default";    

			break;

		//-----------------------------
		//  Login (AUX0)
		//-----------------------------
		case SVC_CODE_SET_LOGIN:
			// Label
			disp_conn_status(CONN_STATUS_ON);
			document.getElementById("sp_status").innerHTML = "AUX(0)";

			// button(class)
			//            document.getElementById("btn_ready").className      = "btn btn-default";    
			//            document.getElementById("btn_aux").className        = "btn btn-success";                    
			//            document.getElementById("btn_acw").className        = "btn btn-default";    
			break;

		//-----------------------------
		//  Ready
		//-----------------------------
		case SVC_CODE_SET_READY:
			// Label
			document.getElementById("sp_status").innerHTML = "Ready";

			// button(class)
			//            document.getElementById("btn_ready").className      = "btn btn-success";    
			//            document.getElementById("btn_aux").className        = "btn btn-default";                    
			//            document.getElementById("btn_acw").className        = "btn btn-default";    
			break;

		//-----------------------------
		//  AUX
		//-----------------------------
		case SVC_CODE_SET_AUX:
			// Label
			document.getElementById("sp_status").innerHTML = "AUX(" + reason_code + ")";

			// button(class)
			//            document.getElementById("btn_ready").className      = "btn btn-default";    
			//            document.getElementById("btn_aux").className        = "btn btn-success";                    
			//            document.getElementById("btn_acw").className        = "btn btn-default";    
			if (pre_svc_code_ == SVC_CODE_SET_AUX && pre_reason_code_ == reason_code) return;
			pre_reason_code_ = reason_code;
			break;

		//-----------------------------
		//  ACW
		//-----------------------------
		case SVC_CODE_SET_ACW:
			// Label
			document.getElementById("sp_status").innerHTML = "ACW";

			// button(class)
			//            document.getElementById("btn_ready").className      = "btn btn-default";    
			//            document.getElementById("btn_aux").className        = "btn btn-default";                    
			//            document.getElementById("btn_acw").className        = "btn btn-success";    
			break;

		default:
			break;
	}

	if (pre_svc_code_ === svc_code)
		return;

	pre_svc_code_ = svc_code;

	// Restart elapse time
	sp_elapse_time_.postMessage({
		command: "elapse_start",
		data: ""
	});

}


function disp_multi_appear() {
	if (wse_callid1_ != 0)
		//        document.getElementById("call_appear1").className   = "btn btn-warning";    
		if (wse_callid2_ != 0) {
			//        document.getElementById("call_appear2").className   = "btn btn-warning";
		} else {
			//        document.getElementById("call_appear2").className   = "btn btn-default";    
		}
}

function disp_single_apprar() {
	//    document.getElementById("call_appear1").className   = "btn btn-warning"; 
	//    document.getElementById("call_appear2").className   = "btn btn-default";
}

function disp_none_apprar() {
	//    document.getElementById("call_appear1").className   = "btn btn-default"; 
	//    document.getElementById("call_appear2").className   = "btn btn-default";
}



//------------------------------------------------------------------
//  disp_call_status
//------------------------------------------------------------------
function disp_call_status(evt_key) {

	switch (evt_key) {

		//-------------------------------------------------
		// Has Multi-Call appearance
		//-------------------------------------------------          
		case SVC_KEY_EVT_SVC_INITIATED:
			document.getElementById("sp_status").innerHTML = "Off-Hook";
			disp_multi_appear();    // Multi-Call appearance
			break;

		case SVC_KEY_EVT_DELIVERED_OUT:
			document.getElementById("sp_status").innerHTML = "Ring";
			disp_multi_appear();    // Multi-Call appearance
			break;

		case SVC_KEY_EVT_NETWORK_REACHED:
			document.getElementById("sp_status").innerHTML = "Ring";
			disp_multi_appear();    // Multi-Call appearance
			break;

		case SVC_KEY_EVT_ORIGINATED:
			document.getElementById("sp_status").innerHTML = "Originated";
			disp_multi_appear();    // Multi-Call appearance
			break;


		case SVC_KEY_EVT_FAILED:
			document.getElementById("sp_status").innerHTML = "Failed!";
			disp_multi_appear();    // Multi-Call appearance
			break;


		case SVC_KEY_EVT_ESTABLISHED:
			document.getElementById("sp_status").innerHTML = "Established";
			disp_multi_appear();    // Multi-Call appearance
			break;

		case SVC_KEY_EVT_HELD:
			document.getElementById("sp_status").innerHTML = "Held";
			disp_multi_appear();    // Multi-Call appearance
			break;

		case SVC_KEY_EVT_RETRIEVED:
			document.getElementById("sp_status").innerHTML = "Connected";
			disp_multi_appear();    // Multi-Call appearance
			break;


		//-------------------------------------------------
		//  Only Single-Call appearance
		//-------------------------------------------------          
		case SVC_KEY_EVT_DELIVERED:
			document.getElementById("sp_status").innerHTML = "Inbound";
			disp_single_apprar();   // Single-Call appearance

			break;

		case SVC_KEY_EVT_TRANSFERRED:
			document.getElementById("sp_status").innerHTML = "Transferred";
			disp_single_apprar();   // Single-Call appearance
			break;


		//-------------------------------------------------
		//  Multi-Call appearance ===> Single-Call appearance 
		//-------------------------------------------------          
		case SVC_KEY_EVT_CONFERENCED:
			document.getElementById("sp_status").innerHTML = "Conferenced";
			disp_single_apprar();   // Single-Call appearance
			break;

		case SVC_KEY_EVT_CONSULT_CLEARED:
			document.getElementById("sp_status").innerHTML = "Connected";
			disp_single_apprar();   // Single-Call appearance
			break;

		case SVC_KEY_EVT_IVR_CLEARED:
			document.getElementById("sp_status").innerHTML = "Connected";
			disp_single_apprar();   // Single-Call appearance
			break;


		//-------------------------------------------------
		//  Single-Call appearance ===> No call appearance
		//-------------------------------------------------          

		case SVC_KEY_EVT_CALL_CLEARED:
			document.getElementById("sp_status").innerHTML = "Idle";
			disp_none_apprar();     // None appearance      
			disp_agent_status(pre_svc_code_, pre_reason_code_);
			break;

		case SVC_KEY_EVT_TRANSFER_CLEARED:
			document.getElementById("sp_status").innerHTML = "Idle";
			disp_none_apprar();     // None appearance          
			disp_agent_status(pre_svc_code_, pre_reason_code_);
			break;

		case SVC_KEY_EVT_ABANDON_CLEARED:
			document.getElementById("sp_status").innerHTML = "Idle";
			disp_none_apprar();     // None appearance        
			disp_agent_status(pre_svc_code_, pre_reason_code_);
			break;

		case SVC_KEY_EVT_DIVERTED:
			document.getElementById("sp_status").innerHTML = "Diverted";
			disp_none_apprar();     // None appearance        
			disp_agent_status(pre_svc_code_, pre_reason_code_);
			break;


		//-------------------------------------------------
		//  Call appearance(NONE)
		//-------------------------------------------------                      
		case SVC_KEY_EVT_MONITOR_END:
			document.getElementById("sp_status").innerHTML = "Please Login";
			break;

		case SVC_KEY_EVT_PASS_SEND:
			document.getElementById("sp_status").innerHTML = "Pass";
			break;

		default:
			break;
	}

	sp_elapse_time_.postMessage({
		command: "elapse_start",
		data: ""
	});

}

