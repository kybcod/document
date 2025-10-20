//##############################################################################
//
//			wsw_wrapper.js
//
//											BridgeW Wrapper
//                                          for CTIBridge 3.7x
//                                          Edit by Lee eon woo
//
//											Hansol Inticube Co., Ltd.
//											All rights reserved.
//
//##############################################################################


// Connection Info
var ct_server_ip_ = "127.0.0.1";
var ct_server_port_ = 28090;


// CTI Parameter
var ct_station_ = "";
var ct_agentid_ = "";
var ct_group_code_ = "";
var ct_employeeid_ = "";
var ct_reason_code_ = 0;
var rc = 0;
var ct_login_count = 0;

var alternate_flag = false;

//==============================================================================
//  raon_btnAble 컨트롤
//==============================================================================
//function raon_btnAble(log_on,log_off,call_s,call_a,call_e, ready,consul,conference,transfer,transfer_tr, held,held_c,after,notready,consul_re,edu,meal,meeting){
//	// 0: 파란색(ON), 1: 회색(OFF), 2: 없음
//	
//	//1 로그인
//	if(log_on == 0){
//		$("#btnLogOn").show();
//		$("#btnLogOff").hide();
//		//$("#btnLogOn_off").hide();
//	}else if(log_on == 1){
//		//$("#btnLogOn_off").hide();
//		//$("#btnLogOn").hide();
//		//$("#btnLogOff").hide();
//	}else if(log_on == 2){
//		//$("#btnLogOn_off").hide();
//		$("#btnLogOn").hide();
//		$("#btnLogOff").show();
//	}
//	
//	//2 로그아웃
//	if(log_off == 0){
//		//$("#btnLogOff").show();
//		//$("#btnLogOn").hide();
//		//$("#btnLogOff_off").hide();
//	}else if(log_off == 1){
//		//$("#btnLogOff_off").show();
//		//$("#btnLogOff").hide();
//		//$("#btnLogOn").hide();
//	}else if(log_off == 2){
//		//$("#btnLogOff_off").hide();
//		//$("#btnLogOff").hide();
//		//$("#btnLogOn").show();
//	}
//	
//	//3 전화걸기
//	if(call_s == 0){
//		$("#call_start").show();
//		$("#call_start_off").hide();
//	}else if(call_s == 1){
//		$("#call_start_off").show();
//		$("#call_start").hide();
//	}else if(call_s == 2){
//		$("#call_start_off").hide();
//		$("#call_start").hide();
//	}
//	
//	//4 전화받기
//	if(call_a == 0){
//		$("#answer_call").show();
//		$("#answer_call_off").hide();
//	}else if(call_a == 1){
//		$("#answer_call_off").show();
//		$("#answer_call").hide();
//	}else if(call_a == 2){
//		$("#answer_call_off").hide();
//		$("#answer_call").hide();
//	}
//	
//	//5 전화끊기
//	if(call_e == 0){
//		$("#call_end").show();
//		$("#call_end_off").hide();
//	}else if(call_e == 1){
//		$("#call_end_off").show();
//		$("#call_end").hide();
//	}else if(call_e == 2){
//		$("#call_end_off").hide();
//		$("#call_end").hide();
//	}
//	
//	
//	//6 대기
//	if(ready == 0){
//		$("#ready_btn").show();
//		$("#ready_btn_off").hide();
//	}else if(ready == 1){
//		$("#ready_btn_off").show();
//		$("#ready_btn").hide();
//	}else if(ready == 2){
//		$("#ready_btn_off").hide();
//		$("#ready_btn").hide();
//	}
//	
//	//7 2자
//	if(consul == 0){
//		$("#consultation_btn").show();
//		$("#consultation_btn_off").hide();
//	}else if(consul == 1){
//		$("#consultation_btn_off").show();
//		$("#consultation_btn").hide();
//	}else if(consul == 2){
//		$("#consultation_btn_off").hide();
//		$("#consultation_btn").hide();
//	}
//	
//	//8 3자
//	if(conference == 0){
//		$("#conference_btn").show();
//		$("#conference_btn_off").hide();
//	}else if(conference == 1){
//		$("#conference_btn_off").show();
//		$("#conference_btn").hide();
//	}else if(conference == 2){
//		$("#conference_btn_off").hide();
//		$("#conference_btn").hide();
//	}
//	
//	//9 즉시
//	if(transfer == 0){
//		$("#transfer_btn").show();
//		$("#transfer_btn_off").hide();
//	}else if(transfer == 1){
//		$("#transfer_btn_off").show();
//		$("#transfer_btn").hide();
//	}else if(transfer == 2){
//		$("#transfer_btn_off").hide();
//		$("#transfer_btn").hide();
//	}
//	
//	//10 협의전환
//	if(transfer_tr == 0){
//		$("#transfer_btn_tr").show();
//		$("#transfer_btn_tr_off").hide();
//	}else if(transfer_tr == 1){
//		$("#transfer_btn_tr_off").show();
//		$("#transfer_btn_tr").hide();
//	}else{
//		$("#transfer_btn_tr_off").hide();
//		$("#transfer_btn_tr").hide();
//	}
//	
//	
//	//11 보류
//	if(held == 0){
//		$("#held_btn").show();
//		$("#held_btn_off").hide();
//	}else if(held == 1){
//		$("#held_btn_off").show();
//		$("#held_btn").hide();
//	}else if(held == 2){
//		$("#held_btn_off").hide();
//		$("#held_btn").hide();
//	}
//	
//	//12 보류해제
//	if(held_c == 0){
//		$("#heldC_btn").show();
//		$("#heldC_btn_off").hide();
//	}else if(held_c == 1){
//		$("#heldC_btn_off").show();
//		$("#heldC_btn").hide();
//	}else if(held_c == 2){
//		$("#heldC_btn_off").hide();
//		$("#heldC_btn").hide();
//	}
//	
//	//13 후처리
//	if(after == 0){
//		$("#after_btn").show();
//		$("#after_btn_off").hide();
//	}else if(after == 1){
//		$("#after_btn_off").show();
//		$("#after_btn").hide();
//	}else if(after == 2){
//		$("#after_btn_off").hide();
//		$("#after_btn").hide();
//	}
//	
//	//14 이석
//	if(notready == 0){
//		$("#notready_btn").show();
//		$("#notready_btn_off").hide();
//	}else if(notready == 1){
//		$("#notready_btn_off").show();
//		$("#notready_btn").hide();
//	}else if(notready == 2){
//		$("#notready_btn_off").hide();
//		$("#notready_btn").hide();
//	}
//	
//	//15 협의복귀
//	if(consul_re == 0){
//		$("#consultation_re_btn").show();
//		$("#consultation_re_btn_off").hide();
//	}else if(consul_re == 1){
//		$("#consultation_re_btn_off").show();
//		$("#consultation_re_btn").hide();
//	}else if(consul_re == 2){
//		$("#consultation_re_btn_off").hide();
//		$("#consultation_re_btn").hide();
//	}
//	
//	//16 교육
//	if(edu == 0){
//		$("#seminar_btn").show();
//		$("#seminar_btn_off").hide();
//	}else if(edu == 1){
//		$("#seminar_btn_off").show();
//		$("#seminar_btn").hide();
//	}else if(edu == 2){
//		$("#seminar_btn_off").hide();
//		$("#seminar_btn").hide();
//	}
//	
//	//17 식사
//	if(meal == 0){
//		$("#lunch_btn").show();
//		$("#lunch_btn_off").hide();
//	}else if(meal == 1){
//		$("#lunch_btn_off").show();
//		$("#lunch_btn").hide();
//	}else if(meal == 2){
//		$("#lunch_btn_off").hide();
//		$("#lunch_btn").hide();
//	}
//	
//	//18 회의
//	if(meeting == 0){
//		$("#meeting_btn").show();
//		$("#meeting_btn_off").hide();
//	}else if(meeting == 1){
//		$("#meeting_btn_off").show();
//		$("#meeting_btn").hide();
//	}else if(meeting == 2){
//		$("#meeting_btn_off").hide();
//		$("#meeting_btn").hide();
//	}
//}



//==============================================================================
//  ct_connect_login
//==============================================================================
function ct_connect_login() {
	// Get connection info
	ct_server_ip_ = document.getElementById("server_ip").value;
	ct_server_port_ = document.getElementById("server_port").value;

	var server_ip = document.getElementById("server_ip").value;
	var server_port = document.getElementById("server_port").value;

	// Get CTI parameter
	ct_station_ = document.getElementById("station").value;
	ct_agentid_ = document.getElementById("agentid").value;
	ct_group_code_ = "";
	ct_employeeid_ = ""; //document.getElementById("employeeid").value;


	disp_log("Connect & Login..., (" + server_ip + "," + server_port + ")");
	//-------------------------------------------
	//  wsk_connect
	//-------------------------------------------        
	raon_btnAble_event_code(1);
	WSK_API.wsk_connect(server_ip, server_port, function(rc) {
		if (rc === 0) {
			disp_log("Connect...OK");
			disp_conn_status(CONN_STATUS_ON);

			//-------------------------------------------
			//  WSK_API.wsk_login
			//-------------------------------------------   
			// Login
			disp_log("Login..., (" + ct_station_ + "," + ct_agentid_ + ")");

			WSK_API.wsk_login(ct_station_, ct_agentid_, ct_group_code_, ct_employeeid_, function(rc) {
				if (rc == 0) {
					disp_log("Login...OK");
					disp_agent_status(SVC_CODE_SET_LOGIN, 0);
					//로그인 성공시
					$('#state_1').text("로그인");
					raon_btnAble_event_code(2);
					//raon_btnAble(2, 2, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0);
					//setTimeout(function() {raon_btnAble(2, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0)} , 2000);
					//raon_btnAble(2, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0);
					wsk_boolean5_ = false;
					setTimeout(() => ct_aux('4'), 500);

					// 녹취를 하기위하여 보내주는 함수
					loginREC(ct_agentid_, ct_station_);

					//setTimeout(ct_aux,5000);          	    
				}
				else {
					if ( ct_login_count < 1 ) {
						disp_log("Login...Fail! (" + rc + ", " + ct_login_count + ")");
						ct_logout_disconnect();
						ct_login_count += 1;
						ct_connect_login();
					} else {
						//					raon_btnAble_event_code(1);
						basicAlert({ icon: 'error', title: '로그인이 실패했습니다.', text: '' });
						disp_log("Login...Fail! (" + rc + ", " + ct_login_count + ")");
						ct_login_count = 0;
					}
				}
			});
		}
		else {
			basicAlert({ icon: 'error', title: 'CTI와 연결이 되지 않습니다.', text: '관리자에게 문의하시기 바랍니다.' });
			disp_log("Connect...Fail! (" + rc + ")");
			disp_conn_status(CONN_STATUS_OFF);
		}
	});
}


//==============================================================================
//  ct_logout_disconnect
//==============================================================================
function ct_logout_disconnect() {
	disp_log("Logout...");

	WSK_API.wsk_logout_disconnect(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			raon_btnAble_event_code(1);
			disp_log("Logout...OK");
			disp_agent_status(SVC_CODE_SET_LOGOUT, 0);
			$('#state_1').text("로그아웃");
			//			raon_btnAble(0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);
			wsk_boolean5_ = false;
		}
		else {
			disp_log("Logout...Fail! (" + rc + ")");
		}
	});
}






//======================================================================
//  ct_connect
//======================================================================
function ct_connect() {
	server_ip = document.getElementById("server_ip").value;
	server_port = document.getElementById("server_port").value;

	disp_log("Connect..., (" + server_ip + "," + server_port + ")");

	WSK_API.wsk_connect(server_ip, server_port, function(rc) {
		if (rc === 0) {
			disp_log("Connect...OK");
			disp_conn_status(CONN_STATUS_ON);
		}
		else {
			disp_log("Connect...Fail! (" + rc + ")");
			disp_conn_status(CONN_STATUS_OFF);
		}
	});


}

//======================================================================
//  ct_disconnect
//======================================================================
function ct_disconnect() {
	disp_log("Disconnect...");

	var promise = WSK_API.wsk_disconnect(function(rc) {
		if (rc === 0) {
			disp_log("Disconnect...OK");
			disp_conn_status(CONN_STATUS_OFF);
		}
		else {
			disp_log("Disconnect...Fail! (" + rc + ")");
			disp_conn_status(CONN_STATUS_OFF);
		}
	});
}





//==============================================================================
//  ct_ready 대기
//==============================================================================
function ct_ready() {
	disp_log("Ready...");
	WSK_API.wsk_ready(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			disp_log("Ready...OK");
			disp_agent_status(SVC_CODE_SET_READY, 0);
			$('#state_1').text("대기중");
			raon_btnAble_event_code(30);
			//			raon_btnAble(2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0,	0);//총18개
			wsk_boolean5_ = false;
		}
		else {
			disp_log("Ready...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_aux
//==============================================================================
function ct_aux(reason_code) {
	disp_log("AUX(" + reason_code + ")...");
	WSK_API.wsk_aux(ct_station_, ct_agentid_, reason_code, function(rc) {
		if (rc == 0) {
			disp_log("AUX(" + reason_code + ")...OK");
			disp_agent_status(SVC_CODE_SET_AUX, reason_code);
			raon_btnAble_event_code(31);
			wsk_boolean5_ = false;
			switch (reason_code) {
				case "1":
					$('#state_1').text("이석(휴식)");
					break;
				case "2":
					$('#state_1').text("이석(교육)");
					break;
				case "3":
					$('#state_1').text("이석(회의)");
					break;
				default:
					$('#state_1').text("이석(기타)");
					break;
			}
		}
		else {
			disp_log("AUX(" + reason_code + ")...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_acw
//==============================================================================
function ct_acw() {
	disp_log("ACW...");
	WSK_API.wsk_acw(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			disp_log("ACW...OK");
			disp_agent_status(SVC_CODE_SET_ACW, 0);
			$('#state_1').text("후처리");
			raon_btnAble_event_code(32);
			wsk_boolean5_ = false;
		}
		else {
			disp_log("ACW...Fail! (" + rc + ")");
		}
	});

}


//==============================================================================
//  ct_ipt_connect_login
//==============================================================================
function ct_ipt_connect_login() {
	// Get connection info
	ct_server_ip_ = document.getElementById("server_ip").value;
	ct_server_port_ = document.getElementById("server_port").value;

	var server_ip = document.getElementById("server_ip").value;
	var server_port = document.getElementById("server_port").value;

	// Get CTI parameter
	ct_station_ = document.getElementById("station").value;
	ct_agentid_ = document.getElementById("agentid").value;
	ct_group_code_ = "";
	ct_employeeid_ = "";


	disp_log("Connect & IPT_Login..., (" + server_ip + "," + server_port + ")");

	//-------------------------------------------
	//  wsk_connect
	//-------------------------------------------        
	WSK_API.wsk_connect(server_ip, server_port, function(rc) {
		if (rc === 0) {
			disp_log("Connect...OK");
			disp_conn_status(CONN_STATUS_ON);

			//-------------------------------------------
			//  WSK_API.wsk_ipt_login
			//-------------------------------------------   
			// IPT Login
			disp_log("IPT Login..., (" + ct_station_ + "," + ct_agentid_ + ")");
			WSK_API.wsk_ipt_login(ct_station_, ct_agentid_, function(rc) {
				if (rc == 0) {
					disp_log("IPT_Login...OK");
					disp_agent_status(SVC_CODE_SET_READY, 0);
				}
				else {
					disp_log("IPT_Login...Fail! (" + sp_get_result_msg(rc) + ")");
				}
			});
		}
		else {
			disp_log("Connect...Fail! (" + sp_get_result_msg(rc) + ")");
			disp_conn_status(CONN_STATUS_OFF);
		}
	});
}



//==============================================================================
//  ct_ipt_logout_disconnect
//==============================================================================
function ct_ipt_logout_disconnect() {
	disp_log("IPT_LogoutDisconnect...");
	WSK_API.wsk_ipt_logout_disconnect(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			disp_log("IPT_LogoutDisconnect...OK");
			disp_agent_status(SVC_CODE_SET_LOGOUT, 0);
		}
		else {
			disp_log("IPT_LogoutDisconnect...Fail! (" + rc + ")");
		}
	});
}


//==============================================================================
//  ct_ipt_ready
//==============================================================================
function ct_ipt_ready() {
	disp_log("IPT_Ready...");
	WSK_API.wsk_ipt_ready(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			disp_log("IPT_Ready...OK");
			disp_agent_status(SVC_CODE_SET_READY, 0);
		}
		else {
			disp_log("IPT_Ready...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_ipt_aux
//==============================================================================
function ct_ipt_aux(reason_code) {
	disp_log("IPT_AUX(" + reason_code + ")...");
	WSK_API.wsk_ipt_aux(ct_station_, ct_agentid_, reason_code, function(rc) {
		if (rc == 0) {
			disp_log("IPT_AUX(" + reason_code + ")...OK");
			disp_agent_status(SVC_CODE_SET_AUX, reason_code);
		}
		else {
			disp_log("IPT_AUX(" + reason_code + ")...Fail! (" + rc + ")");
		}
	});


}

//==============================================================================
//  ct_ipt_acw
//==============================================================================
function ct_ipt_acw() {
	disp_log("IPT_ACW...");
	WSK_API.wsk_ipt_acw(ct_station_, ct_agentid_, function(rc) {
		if (rc == 0) {
			disp_log("IPT_ACW...OK");
			disp_agent_status(SVC_CODE_SET_ACW, 0);
		}
		else {
			disp_log("IPT_ACW...Fail! (" + rc + ")");
		}
	});

}




//==============================================================================
//  ct_set_fwd
//==============================================================================
function ct_set_fwd() {
	var fwd_dest = document.getElementById("fwd_dest").value;

	disp_log("SetFWD(" + fwd_dest + ")...");
	WSK_API.wsk_set_fwd(ct_station_, "00", fwd_dest, function(rc) {
		if (rc == 0) {
			disp_log("SetFWD(" + fwd_dest + ")...OK");
		}
		else {
			disp_log("SetFWD(" + fwd_dest + ")...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_cancel_fwd
//==============================================================================
function ct_cancel_fwd() {
	disp_log("CancelFWD...");
	WSK_API.wsk_cancel_fwd(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("CancelFWD...OK");
		}
		else {
			disp_log("CancelFWD...Fail! (" + rc + ")");
		}
	});
}


//==============================================================================
//  ct_clear
//==============================================================================
function ct_clear() {
	disp_log("Clear...");
	WSK_API.wsk_clear(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Clear...OK");
			$('#state_1').text("후처리");
			raon_btnAble_event_code(33);
			//			raon_btnAble(2, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0,	0);
		}
		else {
			disp_log("Clear...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_answer
//==============================================================================
function ct_answer() {
	var ct_station_ = document.getElementById('ct_station').value;

	disp_log("Answer...");
	WSK_API.wsk_answer(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Answer...OK");
			$('#state_1').text("통화중");
		}
		else {
			disp_log("Answer...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_hold
//==============================================================================
function ct_hold() {
	disp_log("Hold...");
	WSK_API.wsk_hold(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Hold...OK");
			raon_btnAble_event_code(34);
			//			raon_btnAble(2, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1);
			$('#state_1').text("보류중");
		}
		else {
			disp_log("Hold...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_retrieve 보류해제
//==============================================================================
function ct_retrieve() {
	disp_log("Retrieve...");
	WSK_API.wsk_retrieve(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Retrieve...OK");
			wsk_boolean5_ = false;
			raon_btnAble_event_code(35);
			$('#state_1').text("통화중");
		}
		else {
			disp_log("Retrieve...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_conference
//==============================================================================
function ct_conference() {
	disp_log("Conference...");
	let testflag = document.getElementById('CallTestFlag').value;
	if (wsc_connector_ == null && testflag == '1') {
		disp_log("Conference...OK");
		raon_btnAble_event_code(38);
		$('#state_1').text("3자통화");
	} else {
		WSK_API.wsk_conference(ct_station_, function(rc) {
			if (rc == 0) {
				disp_log("Conference...OK");
				raon_btnAble_event_code(38);
				$('#state_1').text("3자통화");
			}
			else {
				disp_log("Conference...Fail! (" + rc + ")");
			}
		});
	}
}

//==============================================================================
//  ct_transfer
//==============================================================================
function ct_transfer() {
	disp_log("Transfer...");
	WSK_API.wsk_transfer(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Transfer...OK");
			//            
			//			$('#state_1').text("후처리");
			//			wsk_boolean5_ = false;
			//			raon_btnAble_event_code(19);
			//   			ct_acw(1);
		}
		else {
			disp_log("Transfer...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_reconnect
//==============================================================================
function ct_reconnect() {
	disp_log("Reconnect...");
	WSK_API.wsk_reconnect(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("Reconnect...OK");
			$('#state_1').text("통화중");
			wsk_boolean5_ = false;
			raon_btnAble_event_code(36);
		}
		else {
			disp_log("Reconnect...Fail! (" + rc + ")");
		}
	});
}

//==============================================================================
//  ct_cancel_password
//==============================================================================
function ct_cancel_password() {
	disp_log("CancelPassword...");
	WSK_API.wsk_cancel_password(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("CancelPassword...OK");
		}
		else {
			disp_log("CancelPassword...Fail! (" + rc + ")");
		}
	});
}



//==============================================================================
//  ct_make
//==============================================================================
function ct_make() {
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

		disp_log("Make(" + make_dest + ")...");
		WSK_API.wsk_make(ct_station_, make_dest, function(rc) {
			if (rc == 0) {
				disp_log("Make(" + make_dest + ")...OK");
				$('#state_1').text("통화중");
			}
			else {
				disp_log("Make(" + make_dest + ")...Fail! (" + rc + ")");
			}
		});
	}
}

//==============================================================================
//  ct_make
//==============================================================================
function ct_make_uui() {
	var make_dest = document.getElementById("make_uui_dest").value;
	var uui_data = document.getElementById("make_uui_data").value;


	disp_log("MakeUUI(" + make_dest + ", UUI=" + uui_data + ")...");
	WSK_API.wsk_make_uui(ct_station_, make_dest, uui_data, function(rc) {
		if (rc == 0) {
			disp_log("MakeUUI(" + make_dest + ")...OK");
		}
		else {
			disp_log("MakeUUI(" + make_dest + ")...Fail! (" + rc + ")");
		}
	});
}


//==============================================================================
//  ct_consultation
//==============================================================================
function ct_consultation() {

	document.getElementById("reconn_dest").value = document.getElementById("consult_ani").value;

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

	//	var consult_dest    = document.getElementById("consult_dest").value;   
	var consult_ani = document.getElementById("make_dest").value;
	var consult_ucid = document.getElementById("consult_ucid").value;
	var consult_data1 = document.getElementById("consult_data1").value;
	var consult_data2 = consult_ani;
	//    var consult_data2   = document.getElementById("consultationContents").value;  

	logDisplay(2, "[Consultation]ct_station:" + ct_station_ + ' | consult_dest=' + consult_dest + " | consult_ani=" + consult_ani +
		" | consult_ucid=" + consult_ucid + " | consult_data1=" + consult_data1 + " | consult_data2=" + consult_data2);

	let testflag = document.getElementById('CallTestFlag').value;
	if (wsc_connector_ == null && testflag == '1') {
		$('#state_1').text("협의통화");
		raon_btnAble_event_code(37);
	} else {
		WSK_API.wsk_consultation(ct_station_, consult_dest, consult_ani, consult_ucid, consult_data1, consult_data2, function(rc) {
			if (rc == 0) {
				disp_log("Consultation(" + consult_dest + ")...OK");
				$('#state_1').text("협의통화");
				raon_btnAble_event_code(37);
			}
			else {
				disp_log("Consultation(" + consult_dest + ")...Fail! (" + rc + ")");
			}
		});
	}
}

//==============================================================================
//  ct_blind_transfer
//==============================================================================
function ct_blind_transfer() {
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

	//    var consult_dest    = document.getElementById("consult_dest").value;   
	var consult_ani = document.getElementById("make_dest").value;
	var consult_ucid = document.getElementById("consult_ucid").value;
	var consult_data1 = document.getElementById("consult_data1").value;
	var consult_data2 = consult_ani;
	//    var consult_data2   = document.getElementById("consultationContents").value;  

	logDisplay(2, "[BlindTransfer]ct_station:" + ct_station_ + ' | consult_dest=' + consult_dest + " | consult_ani=" + consult_ani +
		" | consult_ucid=" + consult_ucid + " | consult_data1=" + consult_data1 + " | consult_data2=" + consult_data2);
	WSK_API.wsk_blind_transfer(ct_station_, consult_dest, consult_ani, consult_ucid, consult_data1, consult_data2, function(rc) {
		if (rc == 0) {
			disp_log("BlindTransfer(" + consult_dest + ")...OK");
			//            SVC_KEY_EVT_TRANSFER_CLEARED에서 처리함

			//			$('#state_1').text("후처리");
			//			wsk_boolean5_ = false;
			//			raon_btnAble_event_code(19);
			//    		ct_acw(1);

		}
		else {
			disp_log("BlindTransfer(" + consult_dest + ")...Fail! (" + rc + ")");
		}
	});
}




//==============================================================================
//  ct_ask_password
//==============================================================================
function ct_ask_password() {
	disp_log("AskPassword...");

	var pw_control = document.getElementById("pw_control").value;
	var pw_data = document.getElementById("pw_data").value;


	WSK_API.wsk_ask_password(ct_station_, pw_control, pw_data, function(rc) {
		if (rc == 0) {
			disp_log("AskPassword...OK");
		}
		else {
			disp_log("AskPassword...Fail! (" + rc + ")");
		}
	});
}


//==============================================================================
//  ct_alternatecall 2022.07.09
//==============================================================================
function ct_alternatecall() {
	disp_log("AlternateCall...");
	WSK_API.wsk_alternatecall(ct_station_, function(rc) {
		if (rc == 0) {
			disp_log("AlternateCall...OK");
			//			wsk_boolean5_ = false;
			//			raon_btnAble_event_code(35);
			$('#state_1').text("통화중");
		}
		else {
			disp_log("AlternateCall...Fail! (" + rc + ")");
		}
	});
}





