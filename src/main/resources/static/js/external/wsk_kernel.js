//##############################################################################
//
//          wsk_kernel.js
//
//                                          BridgeW Kernel
//                                          for CTIBridge 3.7x
//                                          Edit by Lee eon woo
//
//                                          Hansol Inticube Co., Ltd.
//                                          All rights reserved.
//
//##############################################################################

// 보류 유무 판단 
var wsk_boolean5_				= false; 
// 자동받기구분 (0:수동받기 , 1: 자동받기))
var wsk_AUTO_ANSWER_KIND;
// CALL 끊어졌음 한번만 판단 확인(TRUE : 종료전 , FALSE : 콜없음)
var wsk_call_alive = false;
//이전 이벤트
var previous_Event = '';
//==============================================================================
//  wsk_kernel
//==============================================================================
wsk_kernel = (function() {

    var wsk_observer_               = null;
    var wsk_connector_;//              = null;
    var wsk_event_callback_         = null;         // event callback 
    var wsk_req_processing_         = false;        
    var wsk_result_code_            = "";
    var rc                          = 0;
    
    var json_request_               = '{"WSK_PARAM":{}}';
    var json_event_                 = '{"WSK_EVENT":{}}';   
    
    // Set timer for Connect & Request
    var wsk_timer_connect_;
    var wsk_timer_request_;
    
    var wsk_loggedon_               = false;
    var wsk_connected_              = false;        // flag for websocket connection
    var wsk_reconnect_count_        = 0;
    var wsk_reconnect_processing_   = false;
    
    // Set mandatory parameter
    var wsk_server_ip_              = "";
    var wsk_server_port_            = 0;
    var wsk_station_                = "";
    var wsk_agentid_                = "";
    var wsk_group_                  = "";
    var wsk_reserved_               = "";
    var wsk_reason_code_            = "";
   
	var wsk_boolean1_				= false; 
	var wsk_boolean2_				= false; 
	var wsk_boolean3_				= false; 
	var wsk_boolean4_				= false; 
    
	var wsk_ani_ = "";
	var wsk_dnis_ = "";
	var wsk_data1_	= "";
	var wsk_data2_	= "";
	var wsk_ucid_ = "";
	
	var callStartTime;// 통화시간을 알기위한 통화시작시간

	var now_Event = 0;
    //==========================================================================
    //  wsk_singleton
    //==========================================================================
    function wsk_singleton(options)
    {
        WS_LOG("[wsk_singleton] Singleton...");
            
        // Set observer handler
        wsk_observer_   = new wso_observer(this);
 
        if (window.Worker) {
            WS_LOG("[wsk_singleton] create connector worker...");
            wsk_connector_ = new Worker("js/external/wsc_connector.js");
            wsk_connector_.onmessage = wsk_msg_procedure;
        } else {
            WS_LOG("[wsk_singleton] Create connector worker...Fail! (not supported!)");
        }
    

        //======================================================================
        //  wsk_reg_event_handler
        //======================================================================
        var wsk_reg_event_handler = function (event_handler) {
            WS_LOG("[wsk_reg_event_handler]");
            wsk_event_callback_ = event_handler;    
        };
  
 
        //======================================================================
        //  wsk_msg_procedure
        //======================================================================
        function wsk_msg_procedure(e) 
        {
            // [1] Check message validity
            if (e.data.message === undefined) {
                WS_LOG("[wsk_msg_procedure] Invalid data! [" + e.data.message + "]");
                return;
            }
    
            switch (e.data.message) {
            case "ws_on_opened":
            {
                //-------------------------------
                // Websocket Connected Event
                //-------------------------------
                WS_LOG("[wsk_msg_procedure] <Websocket connected>");
                wsk_observer_.fire_event('ob_on_opened');
                wsk_connected_              = true;
                ws_reconnect_count_         = 0;
                wsk_reconnect_processing_    = false;
                
                // Clear connect timer
                if (wsk_timer_connect_ != null){
                    clearTimeout(wsk_timer_connect_);
                    wsk_timer_connect_ = null;
                }
                
                // Clear request timer
                if (wsk_timer_request_ != null){
                    clearTimeout(wsk_timer_request_);
                    wsk_timer_request_ = null;
                }
                
                // Send reconnect success event
                if (wsk_loggedon_ === true) {
                    var json_event = JSON.parse(json_event_);
                    json_event.WSK_EVENT.svc_key       = SVC_KEY_EVT_RECONNECT_SUCCESS;
                    json_event.WSK_EVENT.svc_code      = SVC_CODE_EVT_RECONNECT_SUCCESS;
                    wsk_event_callback_(json_event);
                }
                break;
            }
            
            case "ws_on_closed":
            {
                //-------------------------------
                // Websocket Connection Closed
                //-------------------------------
                WS_LOG("[wsk_msg_procedure] <Websocket closed>");
                wsk_observer_.fire_event('ob_on_closed');
                
                // Disconnected
                wsk_connected_          = false;
                wsk_req_processing_     = false;
                                
                // Clear connect timer
                if (wsk_timer_connect_ != null){
                    clearTimeout(wsk_timer_connect_);
                    wsk_timer_connect_ = null;
                }
                
                // Clear request timer
                if (wsk_timer_request_ != null){
                    clearTimeout(wsk_timer_request_);
                    wsk_timer_request_ = null;
                }
                
                // Send Droped Event
                if (wsk_loggedon_ === true) {

                    WS_LOG("[wsk_msg_procedure] <Websocket closed> Loggedon, -----------------------------");   //2018.07.19
                    
                    if (g_dropped_ == true) {
                         WS_LOG("[wsk_msg_procedure] <Websocket closed> Logout! Do not send event! <<<<<<<<<<<<<<<<<<<<<Drop");  
                         g_dropped_ = false;
                    }
                    else {
                        wsk_reconnect_server();
                    }
                    
                    
                    /*
                    if (wsk_reconnect_processing_ === false) {
                        var json_event = JSON.parse(json_event_);
                        json_event.WSK_EVENT.svc_key       = SVC_KEY_EVT_DROP_SOCKET;
                        json_event.WSK_EVENT.svc_code      = SVC_CODE_EVT_DROP_SOCKET;
                        wsk_event_callback_(json_event);
                    }
                    */
                    
                    //wsk_reconnect_server();
                }
                else
                {
                    WS_LOG("[wsk_msg_procedure] <Websocket closed> Logout! Do not send event!");
                    
                }

                break;
            }
            
            case "ws_on_message":
            {
                WS_LOG("[wsk_msg_procedure] <Websocket Message>");
                
                // Parsing response or event packet
                var packet_key, recv_data, packet_length;
                    
                recv_data = e.data.data;
                packet_key = recv_data.substr(0, PK_LEN_PACKET_KEY);
                       
                                                            
                switch (packet_key) {
                case PACKET_KEY_AGT_SERVICE:
                    WS_LOG("[wsk_msg_procedure] Reply=[" + recv_data + "](" + recv_data.length + ")bytes");
                    wsk_rep_procedure (recv_data);
                    break;
                case PACKET_KEY_CTI_EVENT:
                    WS_LOG("[wsk_msg_procedure] Event=[" + recv_data + "](" + recv_data.length + ")bytes");
                    wsk_event_procedure(recv_data);
                    break;
                default:
                    WS_LOG("[wsk_msg_procedure] <Websocket Message> Invald data!");
                    break;
                }
                break;
            }
            
            default:
                WS_LOG("[wsk_msg_procedure] <Websocket Message> Undefined message=[" + e.data + "]");
                break;
            } // switch
        } // function
    
        //======================================================================
        //  request_procedure
        //======================================================================
        function wsk_req_procedure(send_data)
        {
            WS_LOG("[wsk_req_procedure] send_data=[" + send_data + "](" + send_data.length + ")bytes");
            //WS_LOG("[wsk_req_procedure] send_data, (" + send_data.length + ")bytes");         
            // Check processing
            if (wsk_req_processing_) {
                WS_LOG("[wsk_req_procedure] processing....");
                return false;
            }
            wsk_req_processing_ = true;
            
            // Send data message
            wsk_connector_.postMessage({
                command     : "connector_send",
                message     : send_data
            });
            return true;
        }
          
        //======================================================================
        //  wsk_rep_procedure
        //======================================================================
        function wsk_rep_procedure(recv_data)
        {
            //WS_LOG("[wsk_rep_procedure] recv_data=[" + recv_data + "](" + recv_data.length + ")bytes");
            WS_LOG("[wsk_rep_procedure] recv_data, (" + recv_data.length + ")bytes");
            wsk_req_processing_ = false;
            wsk_observer_.fire_event("ob_on_response", recv_data);
            
            // Clear request timer
            if (wsk_timer_request_ != null) {
                clearTimeout(wsk_timer_request_);
                wsk_timer_request_ = null;
            }
        }
             
             
        //======================================================================
        //  wsk_event_procedure
        //======================================================================
        function wsk_event_procedure(recv_data)
        {
            //WS_LOG("[wsk_event_procedure] event=[" + recv_data + "]");
            var json_event = JSON.parse(json_event_);
            var ib_data;
            var con_data;
            
			wsk_AUTO_ANSWER_KIND = document.getElementById('auto_answer_kind').value;
			logDisplay(2, 'wsk_AUTO_ANSWER_KIND : ' + wsk_AUTO_ANSWER_KIND);	

            {
                    // Make json format(basic event)
                    json_event.WSK_EVENT.length        = recv_data.substr(POS_PK_EVT_LENGTH,           PK_LEN_LENGTH).trim();
                    json_event.WSK_EVENT.time          = recv_data.substr(POS_PK_EVT_TIME,             PK_LEN_TIME).trim();
                    json_event.WSK_EVENT.svc_key       = recv_data.substr(POS_PK_EVT_SVC_KEY,          PK_LEN_SVC_KEY).trim();
                    json_event.WSK_EVENT.svc_code      = recv_data.substr(POS_PK_EVT_SVC_CODE,         PK_LEN_SVC_CODE).trim();
                    json_event.WSK_EVENT.station       = recv_data.substr(POS_PK_EVT_STATION,          PK_LEN_STATION).trim();
                    json_event.WSK_EVENT.agentid       = recv_data.substr(POS_PK_EVT_AGENTID,          PK_LEN_AGENTID).trim();
                    json_event.WSK_EVENT.callid        = recv_data.substr(POS_PK_EVT_CALLID,           PK_LEN_CALLID).trim();
                    json_event.WSK_EVENT.channel_type  = recv_data.substr(POS_PK_EVT_CHANNEL_TYPE,     PK_LEN_CHANNEL_TYPE).trim();
                    json_event.WSK_EVENT.direct_type   = recv_data.substr(POS_PK_EVT_DIRECT_TYPE,      PK_LEN_DIRECT_TYPE).trim();
                    json_event.WSK_EVENT.res_basic     = recv_data.substr(POS_PK_EVT_RES_BASIC,        PK_LEN_RES_BASIC).trim();
                    
                    json_event.WSK_EVENT.ani           = recv_data.substr(POS_PK_EVT_ANI,              PK_LEN_ANI).trim();
					json_event.WSK_EVENT.dnis          = recv_data.substr(POS_PK_EVT_DNIS,             PK_LEN_DNIS).trim();
                    json_event.WSK_EVENT.ucid          = recv_data.substr(POS_PK_EVT_UCID,             PK_LEN_UCID).trim();
					
	            	json_event.WSK_EVENT.inbound_data       = recv_data.substr(POS_PK_EVT_INBOUND_DATA,     PK_LEN_INBOUND_DATA).trim();
	                json_event.WSK_EVENT.consult_data       = recv_data.substr(POS_PK_EVT_CONSULT_DATA,     PK_LEN_CONSULT_DATA).trim();
            }
            
			previous_Event = now_Event;
			now_Event = json_event.WSK_EVENT.svc_key;
			if (json_event.WSK_EVENT.inbound_data){
				ib_data = json_event.WSK_EVENT.inbound_data.trim();
			}else{
				ib_data = '';
			}
			if (json_event.WSK_EVENT.consult_data){
				con_data = json_event.WSK_EVENT.consult_data.trim();
			}else{
				con_data = '';
			}
			logDisplay(1, 'WSK_EVENT[' + json_event.WSK_EVENT.svc_key + '<-' + previous_Event + ']' + 
           			' | station : ' + json_event.WSK_EVENT.station +
            		' | ani : ' + json_event.WSK_EVENT.ani.trim() + 
            		' | dnis : ' + json_event.WSK_EVENT.dnis + 
            		' | callid1 : ' + wse_callid1_ + ' | callid2 : ' + wse_callid2_ + 
            		' | channel_type : ' + json_event.WSK_EVENT.channel_type + 
            		' | direct_type : ' + json_event.WSK_EVENT.direct_type + 
            		' | svc_code : ' + json_event.WSK_EVENT.svc_code + 
            		' | alive : ' + wsk_call_alive +
            		' | alternate : ' + alternate_flag +
            		' | inbound_data : ' + ib_data);
            
            switch (json_event.WSK_EVENT.svc_key) {
            case SVC_KEY_EVT_DELIVERED:
            	wsk_call_alive = true;
				
				// 상담내선정보
				document.getElementById('ct_station').value = json_event.WSK_EVENT.station

        		wsk_ani_ = json_event.WSK_EVENT.ani.trim();
        		wsk_dnis_ = json_event.WSK_EVENT.dnis.trim();
				wsk_data1_	= ib_data;
				wsk_data2_	= con_data;
				wsk_ucid_ =  json_event.WSK_EVENT.ucid.trim();

				document.getElementById("consult_ucid").value = wsk_ucid_;

				if (json_event.WSK_EVENT.direct_type == '03'){
					document.getElementById("call_type").value = '1001';
				}
	        	if(json_event.WSK_EVENT.direct_type == '03' && json_event.WSK_EVENT.channel_type == '12'){
					$('#state_1').text('협의요청');
					if(wsk_ani_.length > 7){
						document.getElementById("consult_ani").value = wsk_ani_;
						document.getElementById('make_dest').value = wsk_ani_;
						document.getElementById("cti_dnis").value = wsk_dnis_;
//						document.getElementById('tel').value = '고객전화번호 : ' + wsk_ani_ + '\n협 의 요 청 : ' +  wsk_dnis_ + '\n상 담 내 용 :' + wsk_data2_;
//						document.getElementById('tel').value = '고객전화번호 : ' + wsk_ani_ + '\n최종IVR서비스 : ' + wsk_data1_;
						Call_popup(wsk_ani_,wsk_data1_);
					}else{
						document.getElementById("consult_ani").value = wsk_dnis_;
						document.getElementById('make_dest').value = wsk_dnis_;
						document.getElementById("cti_dnis").value = wsk_ani_;
//						document.getElementById('tel').value = '고객전화번호 : ' + wsk_dnis_;
						Call_popup(wsk_dnis_,'');
					}
					
            	}else{
            		document.getElementById("consult_ani").value = wsk_ani_;
            		document.getElementById('make_dest').value = wsk_ani_;
					document.getElementById("cti_dnis").value = wsk_dnis_;
            		
					//--------------------------------------------------------------
					// 고객전화번호
//					document.getElementById('tel').value = 'IB 고객전화번호 : ' + wsk_ani_ + '\n최종IVR서비스 : ' + wsk_data1_;
					
            		$('#state_1').text('호인입');
					Call_popup(wsk_ani_,wsk_data1_);
            	}
//            	if(wsk_AUTO_ANSWER_KIND == '1'){
//					btn_call(4);
//				}else{
//					raon_btnAble_event_code(10);
//					wrapWindowByMask();
//					$('#call_popup').show();
//					answer_btn.focus();
//				}
//				if (json_event.WSK_EVENT.direct_type == '03'){
//            		document.getElementById("call_type").value = '1001';
//				}
//				// 고객정보 조회 및 상담이력 조회
//				getCustID(1);
            	break;
            case SVC_KEY_EVT_ESTABLISHED: 
        		var call_popup = document.getElementById('call_popup');
        		
	 			getRecordKey(); // 녹취키 가져오기			
 	      		if(call_popup.style.display != 'none'){// 보일 때
                    toggleLayerPopup('#call_popup');
				}
            	wsk_call_alive = true;
                // Extend event
//                json_event.WSK_EVENT.ucid               = recv_data.substr(POS_PK_EVT_UCID,             PK_LEN_UCID).trim();
                 //수정한부분(3월16일)
//				json_event.WSK_EVENT.dnis               = recv_data.substr(POS_PK_EVT_DNIS,             PK_LEN_DNIS).trim();
//                json_event.WSK_EVENT.ani                = recv_data.substr(POS_PK_EVT_ANI,              PK_LEN_ANI);
                json_event.WSK_EVENT.que_time           = recv_data.substr(POS_PK_EVT_QUE_TIME,         PK_LEN_QUE_TIME).trim();
//                json_event.WSK_EVENT.inbound_data       = recv_data.substr(POS_PK_EVT_INBOUND_DATA,     PK_LEN_INBOUND_DATA).trim();
//                json_event.WSK_EVENT.consult_data       = recv_data.substr(POS_PK_EVT_CONSULT_DATA,     PK_LEN_CONSULT_DATA).trim();
                
                $('#state_1').text('통화중');
				callStartTime = new Date();
				// 콜이 하나만 존재할 경우
				if (wse_callid2_ == 0){
					raon_btnAble_event_code(11);
					document.getElementById('call_timer').value='0';
				}
				
                //인바운드
            	if(json_event.WSK_EVENT.direct_type == '03' && json_event.WSK_EVENT.channel_type != '12'){
//            		wsk_dnis_ = json_event.WSK_EVENT.dnis.trim;
//					wsk_ani_ = json_event.WSK_EVENT.ani.trim;
					
//        			document.getElementById('consult_dest').value = wsk_dnis_;
//					document.getElementById('cti_dnis').value = wsk_dnis_;
            		
				//아웃바운드	
            	}else if(json_event.WSK_EVENT.direct_type == '05' && json_event.WSK_EVENT.channel_type != '12'){
//            		wsk_dnis_ = json_event.WSK_EVENT.dnis.trim;
//					wsk_ani_ = json_event.WSK_EVENT.ani.trim;
					wsk_ucid_ = json_event.WSK_EVENT.ucid.trim();
					document.getElementById("consult_ucid").value = wsk_ucid_;
//        			document.getElementById('consult_dest').value = wsk_dnis_;
//					document.getElementById('cti_dnis').value = wsk_dnis_;
					
            		//document.getElementById('make_dest').value = wsk_dnis_;
				
				//협의전화 1(협의를 건사람)
            	}else if(json_event.WSK_EVENT.direct_type == '05' && json_event.WSK_EVENT.channel_type == '12'){
//        			wsk_dnis_ = json_event.WSK_EVENT.dnis;
//					wsk_ani_ = json_event.WSK_EVENT.ani;
//        			document.getElementById('consult_dest').value = wsk_dnis_;
//					document.getElementById('cti_dnis').value = wsk_dnis_;
					
        			// document.getElementById('make_dest').value = document.getElementById('consult_ani').value;
            		
            		$('#state_1').text('협의중');
            		if(wse_callid2_ > 0){
 						raon_btnAble_event_code(12);
            		}

				//협의전화 2(협의를 받은사람)
				}else if(json_event.WSK_EVENT.direct_type == '03' && json_event.WSK_EVENT.channel_type == '12'){
//        			wsk_dnis_ = json_event.WSK_EVENT.dnis;
//					wsk_ani_ = json_event.WSK_EVENT.ani;
//					wsk_data1_= json_event.WSK_EVENT.inbound_data;
					
//					document.getElementById("consult_dest").value = wsk_ani_;
//					document.getElementById("cti_dnis").value = wsk_dnis_;
//					document.getElementById('make_dest').value = wsk_ani_;
//					
//        			document.getElementById('consult_dest').value = wsk_dnis_;
//					document.getElementById('consult_ani').value = wsk_ani_;
					
//        			document.getElementById('make_dest').value = document.getElementById('consult_ani').value;
            		
					if(wsk_boolean2_){ // blind
//						document.getElementById('make_dest').value = document.getElementById('consult_dest').value;
						raon_btnAble_event_code(22);
						wsk_boolean2_ = false;
					}else{
						if (wse_callid2_ != 0){
							$('#state_1').text('협의중');
							raon_btnAble_event_code(13);
							wsk_boolean3_=true;
						}
					}
            	}
                break;
                    
            case SVC_KEY_EVT_PASS_SEND:
                // Password event
                json_event.WSK_EVENT.pw_ivr             = recv_data.substr(POS_PK_EVT_PW_IVR,           PK_LEN_PW_IVR);
                json_event.WSK_EVENT.pw_data            = recv_data.substr(POS_PK_EVT_PW_DATA,          PK_LEN_PW_DATA);
                
                
                break;
            
            case SVC_KEY_EVT_CALL_CLEARED: //통화종료
            	Call_End();
            	
//Call_End로 삭제처리
//            	$('#state_1').text('통화종료');
//            	setTimeout("ct_acw(1)", 500);
//  				if (wse_callid2_ == 0 && wsk_call_alive == true){
//	            	wsk_call_alive = false;
//					getRecordKey(); // 녹취키 가져오기
//					raon_btnAble_event_code(18);
//				}
//				document.getElementById('call_timer').value =  timeToSec() + 1;
//				document.getElementById('call_endtime').innerText = get_packet_time();            	
//--------------------------------------------------------------------------------------				
				wsk_boolean1_				= false; 
				wsk_boolean2_				= false; 
				wsk_boolean3_				= false; 
				wsk_boolean4_				= false; 
            	break;
            
            case SVC_KEY_EVT_DELIVERED_OUT:
	           	wsk_call_alive = true;
            	wsk_ani_ = json_event.WSK_EVENT.ani;
	           	if(document.getElementById('make_dest').value.trim() == ''){
					document.getElementById('make_dest').value = wsk_ani_;
				}
 				if (wse_callid2_ == 0){
					if(document.getElementById("call_type").value != '3001' && document.getElementById("call_type").value != '4001'){
						if(document.getElementById('make_dest').value.trim() != ''){
//							getCustID(1,0,document.getElementById("make_dest").value,'OB:AAAAAAA');
							getCustID(1);
//							Call_popup(document.getElementById('make_dest').value.trim(),'운항정보 문의');
						}
	            		document.getElementById("call_type").value = '1002';
					}
					raon_btnAble_event_code(27);
				}
           		$('#state_1').text('통화시도');
        		document.getElementById("consult_ani").value = wsk_ani_;
            	break;
            
            case SVC_KEY_EVT_SVC_INITIATED:
            	wsk_call_alive = true;
            	$('#state_1').text('연결시도');
  				if (wse_callid2_ == 0){
					raon_btnAble_event_code(14);
				}
            	
            	break;
            	
	        case SVC_KEY_EVT_ORIGINATED:
            	wsk_call_alive = true;
	            $('#state_1').text('연결중')
  				if (wse_callid2_ == 0){
					raon_btnAble_event_code(15);
				}
            	break;
	            
            case SVC_KEY_EVT_TRANSFER_CLEARED:	 
//            	$('#state_1').innerHTML="통화종료";
           		previous_Event = now_Event;
				wse_callid2_ = 0;
            	Call_End();
//Call_End로 삭제처리
//  				if (wse_callid2_ == 0 && wsk_call_alive == true){
//	           		wsk_call_alive = false;
//					getRecordKey(); // 녹취키 가져오기
//            		setTimeout("ct_acw(1)", 500);
//					raon_btnAble_event_code(19);
//					document.getElementById('call_timer').value = timeToSec() + 1;
//					document.getElementById('call_endtime').innerText = get_packet_time();  
//				}
//--------------------------------------------------------------------------------------				
				
				wsk_boolean1_				= false; 
				wsk_boolean2_				= false; 
				wsk_boolean3_				= false; 
				wsk_boolean4_				= false; 
            	break;
            	
            case SVC_KEY_EVT_ABANDON_CLEARED:
//            	$('#state_1').innerHTML="통화종료";
            	Call_End();
//Call_End로 삭제처리
// 				if (wse_callid2_ == 0 && wsk_call_alive == true){
//	           		wsk_call_alive = false;
//					getRecordKey(); // 녹취키 가져오기
//            		setTimeout("ct_acw(1)", 500);
// 					raon_btnAble_event_code(20);
//					document.getElementById('call_timer').value =  timeToSec() + 1;
//					document.getElementById('call_endtime').innerText = get_packet_time(); 
//				}				
//				$('#call_popup').hide();$('#mask').hide(); 

				wsk_boolean1_				= false; 
				wsk_boolean2_				= false; 
				wsk_boolean3_				= false; 
				wsk_boolean4_				= false; 
            	break;
            	
            case SVC_KEY_EVT_CONSULT_CLEARED: // 협의(Consultation) 중에 한곳과 연결되어 있는 Connection이 종료되었을 때 발생되는 이벤트
				if(wsk_boolean5_ == true && (json_event.WSK_EVENT.channel_type == '02' || json_event.WSK_EVENT.channel_type == '12' || (previous_Event == 'E_CONCLR' && json_event.WSK_EVENT.channel_type == ''))){
					// 협의중 내부에서 끊었을 경우
	            	$('#state_1').text="협의종료";
					if(json_event.WSK_EVENT.direct_type == '05'){
						setTimeout("ct_retrieve()", 500);
					}else{
						setTimeout("ct_reconnect()", 500);
					}
				}else if (wsk_boolean5_ == true && json_event.WSK_EVENT.channel_type == '10'){
	            	$('#state_1').text="고객끊음";
					// 고객측에서 끊었을 경우 콜을 협의자와 일반통화로 바꿀지 테스트 하여야 한다. 결과에 따라 아애 내용을 채용
					if(json_event.WSK_EVENT.direct_type == '05'){
						setTimeout("ct_retrieve()", 500);
					}else{
						setTimeout("ct_reconnect()", 500);
					}
//					wsk_boolean5_ = true;
//					raon_btnAble_event_code(16);
				}
//            	Call_End();
            	wsk_boolean3_ =false;
				wsk_boolean4_ = false; 
            	break;
            	
            case SVC_KEY_EVT_TRANSFERRED: // zendesk ticket create
				if(json_event.WSK_EVENT.direct_type == '03' && json_event.WSK_EVENT.channel_type == '12' && wsk_call_alive == false){
	           		wsk_call_alive = true;
					if(wsk_boolean3_){//호전환수신
						$('#state_1').text('통화중');
						raon_btnAble_event_code(17);
					}else{
						wsk_boolean2_= true;
						$('#state_1').text('호인입');
		        		wsk_ani_ = json_event.WSK_EVENT.ani.trim();
						if(wsk_ani_ == '' && con_data != ''){
							wsk_ani_ = con_data;
						}
		        		wsk_dnis_ = json_event.WSK_EVENT.dnis.trim();
						wsk_data1_	= ib_data;
						if(wsk_ani_.length > 7){
							document.getElementById("consult_ani").value = wsk_ani_;
							document.getElementById('make_dest').value = wsk_ani_;
							document.getElementById("cti_dnis").value = wsk_dnis_;
							Call_popup(wsk_ani_,wsk_data1_);
						}else{
							document.getElementById("consult_ani").value = wsk_dnis_;
							document.getElementById('make_dest').value = wsk_dnis_;
							document.getElementById("cti_dnis").value = wsk_ani_;
							Call_popup(wsk_dnis_,'');
						}
						
//		            	if(wsk_AUTO_ANSWER_KIND == '1'){
//							btn_call(4);					
//						}else{
//							raon_btnAble_event_code(21);
////							raon_btnAble_event_code(10);
//							wrapWindowByMask();
//							$('#call_popup').show();
//							answer_btn.focus();
//						}
//						getCustID(1);
					}
				}else{
					$('#state_1').text('통화중');
					raon_btnAble_event_code(22);
				}
            	break;
            	
			case SVC_KEY_EVT_HELD :
				if((alternate_flag == false && previous_Event != 'E_RETRIE') || wse_callid2_ == 0){
					$('#state_1').text('보류중');
					wsk_boolean5_ = true;
					
					wsk_boolean4_ = true;
					raon_btnAble_event_code(23);
				}
				break;
				
			case SVC_KEY_EVT_RETRIEVED :
				$('#state_1').text('통화중');
				if(alternate_flag == true || wse_callid2_ > 0){
					raon_btnAble_event_code(60);
					alternate_flag = false;
				}else{
					wsk_boolean5_ = false;
					wsk_boolean4_ = false;
					raon_btnAble_event_code(24);
				}
				break;
	
			case SVC_KEY_EVT_DIVERTED:
				if (wsk_call_alive == true){
            		setTimeout("btn_call(13)", 500);
	//				document.getElementById('make_dest').value = document.getElementById('consult_ani').value
					//display_reset(2);
					raon_btnAble_event_code(25);
		           	wsk_call_alive = false;
				}
				break;			
            
			case SVC_KEY_EVT_CONFERENCED:
				$('#state_1').text('3자통화');
				wsk_boolean5_ = false;
				raon_btnAble_event_code(26);
				break;			
			default:    
                break;
            
            }
            wsk_event_callback_(json_event);
         }
    
    
        //======================================================================
        //  wsk_connect
        //======================================================================
        function wsk_connect(server_ip, server_port, set_result)
        {
            svc_log = "wsk_connect("+ server_ip  + "," +  server_port + ")...";
            WS_LOG(svc_log);
            
            wsk_server_ip_      = server_ip;
            wsk_server_port_    = server_port;
        
            var promise = wsk_connect_server();                 
                    
            promise.done(function(message) {
                set_result(RT_CODE.RT_SUCCESS);
                WS_LOG(svc_log + "OK");
            }).fail(function(error) {
                set_result(RT_CODE.RT_SOCKET_CONNECT_FAIL);
                WS_LOG(svc_log + "Fail! (" + RT_CODE.RT_SOCKET_CONNECT_FAIL + ")");
            });
        }
            
      
        //======================================================================
        //  wsk_connect_server
        //======================================================================
        var wsk_connect_server = function () {
            WS_LOG("[wsk_connect_server] ..., (" + wsk_server_ip_ + ", " + wsk_server_port_ + ")");
                        
            var deferred = jQuery.Deferred();
            
            // [1] Check connected status
            if (wsk_connected_ == true) {
                WS_LOG("[wsk_connect_server] <Websocekt...already connected>");
                deferred.resolve("connected");      // Success
                return deferred.promise();          // Wait for complete
            }           
                
            // [2] Remove event handler
            wsk_observer_.remove_event("ob_on_closed");
            wsk_observer_.remove_event("ob_on_opened");
            wsk_observer_.remove_event("ob_on_error");
            wsk_observer_.remove_event("ob_on_response");   // 2018.04.04
        
        
            // [3] Add evnet (ob_on_opened) 
            wsk_observer_.add_event("ob_on_opened", function (e) {
                WS_LOG("[wsk_connect_server] <Websocket...connected>");
                wsk_connected_ = true;
                deferred.resolve("connected");      // Success
            });
            
            // [4] Add evnet(ob_on_closed) 
            wsk_observer_.add_event("ob_on_closed", function (e) {
                WS_LOG("[wsk_connect_server] <Websocket...closed>!");
                wsk_connected_ = false;
                deferred.reject("disconnected");    // Failure
            });
        
            // [5] Add evnet(ob_on_error) 
            wsk_observer_.add_event("ob_on_error", function (e) {
                WS_LOG("[wsk_connect_server] <Websocket...connect failure! (" + e.data.message + ")");
                wsk_connected_ = false;
                deferred.reject("connect error");   // Failure
            });
            
            //  [6] Send connection message
            wsk_connector_.postMessage({
                command     : "connector_start",
                server_ip   : wsk_server_ip_,
                server_port : wsk_server_port_
            });
            
            return deferred.promise();              // Wait for complete
        };
        
        
        //======================================================================
        //  wsk_disconnect
        //======================================================================
        function wsk_disconnect(set_result)
        {
            WS_LOG("[wsk_disconnect] Disconnect...");
                
            var promise = wsk_disconnect_server();                  
                    
            promise.done(function(message) {
                set_result(RT_CODE.RT_SUCCESS);
                WS_LOG("[wsk_disconnect] Disconnect...OK");
            }).fail(function(error) {
                rc = RT_CODE.RT_SOCKET_CONNECT_FAIL;
                set_result(rc);
                WS_LOG("[wsk_disconnect] Disconnect...Fail! (" + rc + ")");
            });
        }   
        
        
        //======================================================================
        //  wsk_disconnect_server
        //======================================================================
        var wsk_disconnect_server = function () {
                    
            WS_LOG("[wsk_disconnect_server] wsk_disconnect...");
                                    
            var deferred = jQuery.Deferred();
                                
            // [1] Remove Event Handler(ob_on_closed)
            wsk_observer_.remove_event("ob_on_closed");
                        
            // [2] Add event(ob_on_closed)
            wsk_observer_.add_event("ob_on_closed", function (e) {
                WS_LOG("[wsk_disconnect_server] <Websocket...disconnected>");
                wsk_connected_ = false;
                deferred.resolve("disconnected");
            });
    
            // [3] Send connector stop message
            wsk_connector_.postMessage({
                command     : "connector_stop"
            });
            

            // [4] Timer for disconnect
            wsk_timer_connect_ = setTimeout(function (){
                WS_LOG("[wsk_disconnect_server] Websocket disconnect...failure! (Timeout! 1sec)");
                wsk_connected_ = false;
                deferred.resolve("Disconnect Timeout");
            }, 1000);
            
            return deferred.promise();
        };

        //======================================================================
        //  wsk_logout_disconnect                                         
        //======================================================================    
        function  wsk_logout_disconnect(station, agentid, set_result)
        {
            WS_LOG("Logout...");
            wsk_logout(station, agentid, function(rc) {
                set_result(rc);
                if (rc) {
                    WS_LOG("Logout...Fail! (" + rc + ")");
                }
                else {
                    WS_LOG("Logout...OK, Disconnect...");
                    wsk_disconnect(function back(data) {
                        if (data === true) {
                            WS_LOG("Logout...OK, Disconnect...OK");
                        }
                        else {
                            WS_LOG("Logout...OK, Disconnect...Fail!");
                        }
                    });
                }
            });
        }
                
        //======================================================================
        //  wsk_reconnect_server
        //======================================================================
        function wsk_reconnect_server()
        {
            WS_LOG("[wsk_reconnect] Reconnect server");;
                  
            wsk_reconnect_count_        += 1;
            wsk_reconnect_processing_    = true;          
            
            svc_log = "[wsk_reconnect] Session recovery (" + wsk_reconnect_count_ + ")...";
            WS_LOG(svc_log);
                        
            //document.getElementById("conn_status").innerHTML = wsk_reconnect_count_ ;
             
             // Reconnect Event
            var json_event = JSON.parse(json_event_);
            json_event.WSK_EVENT.svc_key       = SVC_KEY_EVT_RECONNECT_PROCESS;
            json_event.WSK_EVENT.svc_code      = SVC_CODE_EVT_RECONNECT_PROCESS;
            json_event.WSK_EVENT.try_count     = wsk_reconnect_count_;
            //json_event.WSK_EVENT.limit_count   = wsk_reconnect_limit_;
            
            wsk_event_callback_(json_event);
               
            // Set wait timer
            var wait_timer = setTimeout(function() {
                //-------------------------------------------
                //  wsk_connect
                //-------------------------------------------        
                WSK_API.wsk_connect(wsk_server_ip_, wsk_server_port_, function(rc) {
                    if (rc === 0) {
                        disp_log("Connect...OK");
                        disp_conn_status(CONN_STATUS_ON);
                        wsk_reconnect_count_ = 0;
                        
                        //-------------------------------------------
                        //  WSK_API.wsk_ipt_login
                        //-------------------------------------------   
                        // Login
                        disp_log("IPT_Login..., (" + ct_station_  + "," +  ct_agentid_ + ")");
                        WSK_API.wsk_ipt_login(ct_station_, ct_agentid_, function(rc) {
                           if (rc == 0) {
                                disp_log("IPT_Login...OK");
                                disp_agent_status(SVC_CODE_SET_LOGIN, 0);
                            }
                            else {
                                disp_log("IPT_Login...Fail! (" + rc + ")");
                            }
                        });
                    }
                    else {
                        disp_log("Connect...Fail! (" + rc + ")");
                        disp_conn_status(CONN_STATUS_OFF);
                    }
                });
            }, 3000);
            
        } // function wsk_reconnect_server()
        
        
   
        //======================================================================
        //  ws_login
        //======================================================================
        function wsk_login(station, agentid, group, employeeid, set_result)
        {
            // [1] Set function name
            var svc_name         = "WSK_Login";
            WS_LOG(svc_name);
              
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_LOGIN;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_LOGIN;  
              
            // [3] Setting mandatory parameters
            wsk_station_        = station;
            wsk_agentid_        = agentid;      
            wsk_group_          = group;
            wsk_reserved_     = employeeid;
            wsk_reason_code_    = "";
      
            // [4] Websocket processing
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc === 0) {
                    wsk_loggedon_   = true;
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    wsk_loggedon_   = false;
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }
   
        //======================================================================
        //  wsk_logout
        //======================================================================
        function wsk_logout(station, agentid, set_result)
        {   
            // [1] Set function name     
            var svc_name         = "WSK_Logout";
            WS_LOG(svc_name);
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key     = SVC_KEY_SET_LOGOUT;
            json_request.WSK_PARAM.svc_code    = SVC_CODE_SET_LOGOUT;           
                    
            // [3] Setting mandatory parameters
            wsk_station_        = station;
            wsk_agentid_        = agentid;      
             
            // [4] Websocket processing        
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    wsk_loggedon_   = false;
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_session_login
        //======================================================================
        function wsk_session_login(station, agentid, group, employeeid, set_result)
        {        
            // [1] Set function name     
            var svc_name         = "WSK_SessionLogin...";
            WS_LOG(svc_name);
          
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key     = SVC_KEY_SESSION_LOGIN;
            json_request.WSK_PARAM.svc_code    = SVC_CODE_SESSION_LOGIN;            
            
            // [3] Setting mandatory parameters
            wsk_station_        = station;
            wsk_agentid_        = agentid;      
            wsk_group_          = group;
            wsk_reserved_     = employeeid;
            wsk_reason_code_    = "";
         
            // [4] Websocket processing  
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         
        
        
        //======================================================================
        //  wsk_ready
        //======================================================================
        function wsk_ready(station, agentid, set_result)
        {      
            // [1] Set function name       
            var svc_name         = "WSK_Ready";
            WS_LOG(svc_name);     
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_READY;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_READY;   
             
            // [3] Setting mandatory parameters     
            wsk_station_        = station;
            wsk_agentid_        = agentid;    
              
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_aux
        //======================================================================
        function wsk_aux(station, agentid, reason_code, set_result)
        {        
            // [1] Set function name    
            var svc_name         = "WSK_AUX(" + reason_code + ")";
            WS_LOG(svc_name);       
                
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name; 
            json_request.WSK_PARAM.svc_key     = SVC_KEY_SET_AUX;
            json_request.WSK_PARAM.svc_code    = SVC_CODE_SET_AUX;          
            
            // [3] Setting mandatory parameters     
            wsk_station_        = station;
            wsk_agentid_        = agentid;
            wsk_reason_code_    = reason_code;
            
            // [4] Websocket processing         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_acw
        //======================================================================
        function wsk_acw(station, agentid, set_result)
        {     
            // [1] Set function name       
            var svc_name         = "WSK_ACW";
            WS_LOG(svc_name);      
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_ACW;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_ACW;
            
            // [3] Setting mandatory parameters             
            wsk_station_        = station;
            wsk_agentid_        = agentid;
                           
            // [4] Websocket processing                                                                 
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         


        //======================================================================
        //  ws_ipt_login
        //======================================================================
        function wsk_ipt_login(station, agentid, set_result)
        {
            // [1] Set function name
            var svc_name         = "WSK_IPT_Login";
            WS_LOG(svc_name);
              
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_IPT_LOGIN;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_IPT_LOGIN;  
              
            // [3] Setting mandatory parameters
            wsk_station_        = station;
            wsk_agentid_        = agentid;
            wsk_group_          = "";
            wsk_reserved_       = "";
            wsk_reason_code_    = "";
      
            // [4] Websocket processing
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc === 0) {
                    wsk_loggedon_   = true;
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    wsk_loggedon_   = false;
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }


        //======================================================================
        //  wsk_ipt_logout
        //======================================================================
        function wsk_ipt_logout(station, agentid, set_result)
        {   
            // [1] Set function name     
            var svc_name         = "WSK_IPT_Logout";
            WS_LOG(svc_name);
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key     = SVC_KEY_SET_IPT_LOGOUT;
            json_request.WSK_PARAM.svc_code    = SVC_CODE_SET_IPT_LOGOUT;           
                    
            // [3] Setting mandatory parameters
            wsk_station_        = station;
            wsk_agentid_        = agentid;
             
            // [4] Websocket processing        
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    wsk_loggedon_   = false;
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_ipt_logout_disconnect                                         
        //======================================================================    
        function  wsk_ipt_logout_disconnect(station, agentid, set_result)
        {
            WS_LOG("WSK_IPT_Logout_Disconnect...");
            wsk_ipt_logout(station, agentid, function(rc) {
                set_result(rc);
                if (rc) {
                    WS_LOG("WSK_IPT_Logout_Disconnect...Fail! (" + rc + ")");
                }
                else {
                    WS_LOG("WSK_IPT_Logout_Disconnect...OK, Disconnect...");
                    wsk_disconnect(function back(data) {
                        if (data === true) {
                            WS_LOG("WSK_IPT_Logout_Disconnect...OK, Disconnect...OK");
                        }
                        else {
                            WS_LOG("WSK_IPT_Logout_Disconnect...OK, Disconnect...Fail!");
                        }
                    });
                }
            });
        }
        //======================================================================
        //  wsk_ipt_ready
        //======================================================================
        function wsk_ipt_ready(station, agentid, set_result)
        {      
            // [1] Set function name       
            var svc_name         = "WSK_IPT_Ready";
            WS_LOG(svc_name);     
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name;
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_IPT_READY;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_IPT_READY;   
             
            // [3] Setting mandatory parameters     
            wsk_station_        = station;
            wsk_agentid_        = agentid;
              
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_ipt_aux
        //======================================================================
        function wsk_ipt_aux(station, agentid, reason_code, set_result)
        {        
            // [1] Set function name    
            var svc_name         = "WSK_IPT_AUX(" + reason_code + ")";
            WS_LOG(svc_name);       
                
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_);
            json_request.WSK_PARAM.svc_name   = svc_name; 
            json_request.WSK_PARAM.svc_key     = SVC_KEY_SET_IPT_AUX;
            json_request.WSK_PARAM.svc_code    = SVC_CODE_SET_IPT_AUX;          
            
            // [3] Setting mandatory parameters     
            wsk_station_        = station;
            wsk_agentid_        = agentid;
            wsk_reason_code_    = reason_code;
            
            // [4] Websocket processing         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_ipt_acw
        //======================================================================
        function wsk_ipt_acw(station, agentid, set_result)
        {     
            // [1] Set function name       
            var svc_name         = "WSK_IPT_ACW";
            WS_LOG(svc_name);      
            
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_IPT_ACW;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_IPT_ACW;
            
            // [3] Setting mandatory parameters             
            wsk_station_        = station;
            wsk_agentid_        = agentid;
            
            // [4] Websocket processing                                                                 
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         





        //======================================================================
        //  ws_answer
        //======================================================================
        function wsk_answer(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Answer";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;             
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_ANSWER;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_ANSWER;           
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         

        //======================================================================
        //  wsk_clear
        //======================================================================
        function wsk_clear(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Clear";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_CLEAR;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_CLEAR;            
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }         


        //======================================================================
        //  wsk_hold
        //======================================================================
        function wsk_hold(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Hold";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_HOLD;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_HOLD;         
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }           

        //======================================================================
        //  wsk_retrieve
        //======================================================================
        function wsk_retrieve(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Retrieve";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_RETRIEVE;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_RETRIEVE;         
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_conference
        //======================================================================
        function wsk_conference(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Conference";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_CONFERENCE;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_CONFERENCE;           
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     

        //======================================================================
        //  wsk_transfer
        //======================================================================
        function wsk_transfer(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Transfer";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_TRANSFER;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_TRANSFER;         
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_reconnect
        //======================================================================
        function wsk_reconnect(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Reconnect";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_RECONNECT;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_RECONNECT;            
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     

        //======================================================================
        //  wsk_cancel_password
        //======================================================================
        function wsk_cancel_password(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_CancelPassword";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_PASS_CANCEL;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_PASS_CANCEL;           
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     
        //======================================================================
        //  wsk_set_fwd
        //======================================================================
        function wsk_set_fwd(station, fwd_type, fwd_dest, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_SetFWD(" + fwd_type + "," + fwd_dest + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_SET_FWD;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_SET_FWD;       
                    
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
            // FWD
            wsk_reason_code_    = fwd_type;
            wsk_reserved_       = fwd_dest;
                    
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_cancel_fwd
        //======================================================================
        function wsk_cancel_fwd(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_CancelFWD";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CANCEL_FWD;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CANCEL_FWD;        
                    
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
            // FWD
            wsk_reason_code_    = "";
            wsk_reserved_       = "";
            
            
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_make
        //======================================================================
        function wsk_make(station, make_dest, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Make(" + make_dest + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_MAKE;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_MAKE;  
            
            // Make         
            json_request.WSK_PARAM.make_dest  = make_dest;

            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                 
            // [4] Websocket processing                                         
            wsk_request_make(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     

        //======================================================================
        //  wsk_make_uui
        //======================================================================
        function wsk_make_uui(station, make_dest, uui_data, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_MakeUUI(" + make_dest + ", UUI=" + uui_data + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_MAKE_UUI;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_MAKE_UUI;  
            
            // Make UUI         
            json_request.WSK_PARAM.make_dest  = make_dest;
            json_request.WSK_PARAM.uui_data   = uui_data;

            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                 
            // [4] Websocket processing                                         
            wsk_request_make_uui(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_consultation
        //======================================================================
        function wsk_consultation(station, consult_dest, consult_ani, consult_ucid, inbound_data, consult_data, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_Consultation(" + consult_dest + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name       = svc_name;   
            json_request.WSK_PARAM.svc_key        = SVC_KEY_CALL_CONSULTATION;
            json_request.WSK_PARAM.svc_code       = SVC_CODE_CALL_CONSULTATION;    
            
            // Consult      
            json_request.WSK_PARAM.consult_dest   = consult_dest;
            json_request.WSK_PARAM.consult_ani    = consult_ani;
            json_request.WSK_PARAM.consult_ucid   = consult_ucid;
            json_request.WSK_PARAM.inbound_data   = inbound_data;
            json_request.WSK_PARAM.consult_data   = consult_data;
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                        
            // [4] Websocket processing                                                             
            wsk_request_consult(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     

        //======================================================================
        //  wsk_blind_transfer
        //======================================================================
        function wsk_blind_transfer(station, consult_dest, consult_ani, consult_ucid, inbound_data, consult_data, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_BlindTransfer(" + consult_dest + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name       = svc_name;   
            json_request.WSK_PARAM.svc_key        = SVC_KEY_CALL_BLIND_TRANSFER;
            json_request.WSK_PARAM.svc_code       = SVC_CODE_CALL_BLIND_TRANSFER;   
            
            // Consult
            json_request.WSK_PARAM.consult_dest   = consult_dest;
            json_request.WSK_PARAM.consult_ani    = consult_ani;
            json_request.WSK_PARAM.consult_ucid   = consult_ucid;
            json_request.WSK_PARAM.inbound_data   = inbound_data;
            json_request.WSK_PARAM.consult_data   = consult_data;
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                        
            // [4] Websocket processing    
            wsk_request_consult(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     


        //======================================================================
        //  wsk_ask_password
        //======================================================================
        function wsk_ask_password(station, pw_control, pw_data, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_AskPassword(" + pw_control + ")";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name       = svc_name;   
            json_request.WSK_PARAM.svc_key        = SVC_KEY_PASS_ASK;
            json_request.WSK_PARAM.svc_code       = SVC_CODE_PASS_ASK;  
            
            // Password
            json_request.WSK_PARAM.pw_control      = pw_control;
            json_request.WSK_PARAM.pw_data         = pw_data;
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                        
            // [4] Websocket processing                                                                 
            wsk_request_password(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     





        //======================================================================
        //  wsk_request_common
        //======================================================================
        function wsk_request_common(json_request, set_result)
        {
            
            //  [1] Get required parameters
            var svc_name    = json_request.WSK_PARAM.svc_name;
            var svc_key     = json_request.WSK_PARAM.svc_key;
            var svc_code    = json_request.WSK_PARAM.svc_code;

            //  [2] Checking the Websocket connection
            if (!wsk_connected_) { 
                rc = RT_CODE.RT_SESSION_DROPPED;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Websocket connection dropped!");
                
                return;
            }
                    
            //  [3] Checking the parameters
            if (wsk_station_.length < 4 ) {
                rc = RT_CODE.RT_INVALID_PARAMETER;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc  + ") Invalid parameter! (Station=" + wsk_station_ + ")");
                return;
            }
                
            //  [4] Get common packet
            var request_packet = get_common_packet(svc_key, svc_code, wsk_station_, wsk_agentid_, wsk_group_, wsk_reason_code_, wsk_reserved_);
                
            //  [5] Checking the length of common packet
            if (request_packet.length !== PK_LEN_AGT_COMMON) {
                rc = RT_CODE.RT_INVLAID_PACKET_LENGTH;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Invalid packet length:(" + request_packet.length + ")!");
                return;
            }
                     
            //  [6] Calling the websocket procedure(Send/Receive)
            if (!wsk_req_procedure(request_packet)) {
                rc = RT_CODE.RT_AGENT_REQUEST_PROCESSING;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Returned during processing!");
                return;
            } 
            
            // [7] Regiseter the response handler
            wsk_observer_.add_event("ob_on_response", function (recv_data) {
                wsk_result_code_ = recv_data.substr(POS_PK_EVT_RESULT_CODE, PK_LEN_RESULT_CODE);
                
                if (wsk_result_code_ == "00000" || wsk_result_code_ == "     ") {
                    rc = RT_CODE.RT_SUCCESS;
                    set_result(rc);
                    return;
                }
                else {
                    rc = wsk_result_code_;
                    set_result(rc);
                    return;                 
                }
            });
            
            // [8] Response timeout
            wsk_timer_request_ = setTimeout(function() {
                set_result(rc);
                rc = RT_CODE.RT_SOCKET_RECV_TIMEOUT;
                WS_LOG(svc_name +  "...Fail! (" + rc + ") Receive timeout!");
                wsk_req_processing_ = false;
            }, 3000);
        }
        
        //======================================================================
        //  wsk_request_make
        //======================================================================
        function wsk_request_make(json_request, set_result)
        {
            
            //  [1] Get required parameters
            var svc_name    = json_request.WSK_PARAM.svc_name;
            var svc_key     = json_request.WSK_PARAM.svc_key;
            var svc_code    = json_request.WSK_PARAM.svc_code;
            
            // Make parameter
            var make_dest   = json_request.WSK_PARAM.make_dest;
            
            
            //  [2] Checking the Websocket connection
            if (!wsk_connected_) { 
                rc = RT_CODE.RT_SESSION_DROPPED;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Websocket connection dropped!");
                
                return;
            }
                    
            //  [3] Checking the parameters
            if (wsk_station_.length < 4 || make_dest.length === 0) {
                rc = RT_CODE.RT_INVALID_PARAMETER;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc  + ") Invalid parameter! (Station=" + wsk_station_ + ")");
                return;
            }
                
            //  [4] Get common packet
            var request_packet = get_make_packet(svc_key, svc_code, wsk_station_, wsk_agentid_, make_dest);
                
            //  [5] Checking the length of make packet
            if (request_packet.length !== PK_LEN_AGT_MAKE) {
                rc = RT_CODE.RT_INVLAID_PACKET_LENGTH;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Invalid packet length:(" + request_packet.length + ")!");
                return;
            }
                     
            //  [6] Calling the websocket procedure(Send/Receive)
            if (!wsk_req_procedure(request_packet)) {
                rc = RT_CODE.RT_AGENT_REQUEST_PROCESSING;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Returned during processing!");
                return;
            } 
            
            // [7] Regiseter the response handler
            wsk_observer_.add_event("ob_on_response", function (recv_data) {
                wsk_result_code_ = recv_data.substr(POS_PK_EVT_RESULT_CODE, PK_LEN_RESULT_CODE);
                
                if (wsk_result_code_ == "00000" || wsk_result_code_ == "     ") {
                    rc = RT_CODE.RT_SUCCESS;
                    set_result(rc);
                    return;
                }
                else {
                    rc = wsk_result_code_;
                    set_result(rc);
                    return;                 
                }
            });
            
            // [8] Response timeout
            wsk_timer_request_ = setTimeout(function() {
                set_result(rc);
                rc = RT_CODE.RT_SOCKET_RECV_TIMEOUT;
                WS_LOG(svc_name +  "...Fail! (" + rc + ") Receive timeout!");
                wsk_req_processing_ = false;
            }, 3000);
        }
        
        //======================================================================
        //  wsk_request_make_uui
        //======================================================================
        function wsk_request_make_uui(json_request, set_result)
        {
            
            //  [1] Get required parameters
            var svc_name    = json_request.WSK_PARAM.svc_name;
            var svc_key     = json_request.WSK_PARAM.svc_key;
            var svc_code    = json_request.WSK_PARAM.svc_code;
            
            // MakeUUI parameter
            var make_dest   = json_request.WSK_PARAM.make_dest;
            var uui_data    = json_request.WSK_PARAM.uui_data;
            
            //  [2] Checking the Websocket connection
            if (!wsk_connected_) { 
                rc = RT_CODE.RT_SESSION_DROPPED;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Websocket connection dropped!");
                return;
            }
                    
            //  [3] Checking the parameters
            if (wsk_station_.length < 4 || make_dest.length === 0) {
                rc = RT_CODE.RT_INVALID_PARAMETER;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc  + ") Invalid parameter! (Station=" + wsk_station_ + ")");
                return;
            }
                
            //  [4] Get common packet
            var request_packet = get_make_uui_packet(svc_key, svc_code, wsk_station_, wsk_agentid_, make_dest, uui_data);
                
            //  [5] Checking the length of make packet
            if (request_packet.length !== PK_LEN_AGT_MAKE_UUI) {
                rc = RT_CODE.RT_INVLAID_PACKET_LENGTH;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Invalid packet length:(" + request_packet.length + ")!");
                return;
            }
                     
            //  [6] Calling the websocket procedure(Send/Receive)
            if (!wsk_req_procedure(request_packet)) {
                rc = RT_CODE.RT_AGENT_REQUEST_PROCESSING;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Returned during processing!");
                return;
            } 
            
            // [7] Regiseter the response handler
            wsk_observer_.add_event("ob_on_response", function (recv_data) {
                wsk_result_code_ = recv_data.substr(POS_PK_EVT_RESULT_CODE, PK_LEN_RESULT_CODE);
                
                if (wsk_result_code_ == "00000" || wsk_result_code_ == "     ") {
                    rc = RT_CODE.RT_SUCCESS;
                    set_result(rc);
                    return;
                }
                else {
                    rc = wsk_result_code_;
                    set_result(rc);
                    return;                 
                }
            });
            
            // [8] Response timeout
            wsk_timer_request_ = setTimeout(function() {
                set_result(rc);
                rc = RT_CODE.RT_SOCKET_RECV_TIMEOUT;
                WS_LOG(svc_name +  "...Fail! (" + rc + ") Receive timeout!");
                wsk_req_processing_ = false;
            }, 3000);
        }
        
        
        //======================================================================
        //  wsk_request_consult
        //======================================================================
        function wsk_request_consult(json_request, set_result)
        {
            
            //  [1] Get required parameters
            var svc_name    = json_request.WSK_PARAM.svc_name;
            var svc_key     = json_request.WSK_PARAM.svc_key;
            var svc_code    = json_request.WSK_PARAM.svc_code;
           
            // Consult paramter
            var consult_dest    = json_request.WSK_PARAM.consult_dest;
            var consult_ani     = json_request.WSK_PARAM.consult_ani;
            var consult_ucid    = json_request.WSK_PARAM.consult_ucid;
            var inbound_data    = json_request.WSK_PARAM.inbound_data;
            var consult_data    = json_request.WSK_PARAM.consult_data;
            
            
            //  [2] Checking the Websocket connection
            if (!wsk_connected_) { 
                rc = RT_CODE.RT_SESSION_DROPPED;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Websocket connection dropped!");
                
                return;
            }
                    
            //  [3] Checking the parameters
            if (wsk_station_.length < 4 || consult_dest.length === 0) {
                rc = RT_CODE.RT_INVALID_PARAMETER;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc  + ") Invalid parameter! (Station=" + wsk_station_ + ")");
                return;
            }
                
            //  [4] Get common packet
            var request_packet = get_consult_packet(svc_key, svc_code, wsk_station_, wsk_agentid_, consult_dest, consult_ani, consult_ucid, inbound_data, consult_data);

            //  [5] Checking the length of make packet
            if (request_packet.length !== PK_LEN_AGT_CONSULT) {
                rc = RT_CODE.RT_INVLAID_PACKET_LENGTH;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Invalid packet length:(" + request_packet.length + ")!");
                return;
            }
                     
            //  [6] Calling the websocket procedure(Send/Receive)
            if (!wsk_req_procedure(request_packet)) {
                rc = RT_CODE.RT_AGENT_REQUEST_PROCESSING;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Returned during processing!");
                return;
            } 
            
            // [7] Regiseter the response handler
            wsk_observer_.add_event("ob_on_response", function (recv_data) {
                wsk_result_code_ = recv_data.substr(POS_PK_EVT_RESULT_CODE, PK_LEN_RESULT_CODE);
                
                if (wsk_result_code_ == "00000" || wsk_result_code_ == "     ") {
                    rc = RT_CODE.RT_SUCCESS;
                    set_result(rc);
                    return;
                }
                else {
                    rc = wsk_result_code_;
                    set_result(rc);
                    return;                 
                }
            });
            
            // [8] Response timeout
            wsk_timer_request_ = setTimeout(function() {
                set_result(rc);
                rc = RT_CODE.RT_SOCKET_RECV_TIMEOUT;
                WS_LOG(svc_name +  "...Fail! (" + rc + ") Receive timeout!");
                wsk_req_processing_ = false;
            }, 3000);
        }
            

        //======================================================================
        //  wsk_request_password
        //======================================================================
        function wsk_request_password(json_request, set_result)
        {
            
            //  [1] Get required parameters
            var svc_name    = json_request.WSK_PARAM.svc_name;
            var svc_key     = json_request.WSK_PARAM.svc_key;
            var svc_code    = json_request.WSK_PARAM.svc_code;
           
            // Password paramter
            var pw_control  = json_request.WSK_PARAM.pw_control;
            var pw_data     = json_request.WSK_PARAM.pw_data;
            
            
            //  [2] Checking the Websocket connection
            if (!wsk_connected_) { 
                rc = RT_CODE.RT_SESSION_DROPPED;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Websocket connection dropped!");
                
                return;
            }
                    
            //  [3] Checking the parameters
            if (wsk_station_.length < 4) {
                rc = RT_CODE.RT_INVALID_PARAMETER;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc  + ") Invalid parameter! (Station=" + wsk_station_ + ")");
                return;
            }
                
            //  [4] Get common packet
            var request_packet = get_password_packet(svc_key, svc_code, wsk_station_, wsk_agentid_, "", pw_control, pw_data);
            
            //  [5] Checking the length of make packet
            if (request_packet.length !== PK_LEN_AGT_PASSWORD) {
                rc = RT_CODE.RT_INVLAID_PACKET_LENGTH;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Invalid packet length:(" + request_packet.length + ")!");
                return;
            }
                     
            //  [6] Calling the websocket procedure(Send/Receive)
            if (!wsk_req_procedure(request_packet)) {
                rc = RT_CODE.RT_AGENT_REQUEST_PROCESSING;
                set_result(rc);
                WS_LOG(svc_name + "...Fail! (" + rc + ") Returned during processing!");
                return;
            } 
            
            // [7] Regiseter the response handler
            wsk_observer_.add_event("ob_on_response", function (recv_data) {
                wsk_result_code_ = recv_data.substr(POS_PK_EVT_RESULT_CODE, PK_LEN_RESULT_CODE);
                
                if (wsk_result_code_ == "00000" || wsk_result_code_ == "     ") {
                    rc = RT_CODE.RT_SUCCESS;
                    set_result(rc);
                    return;
                }
                else {
                    rc = wsk_result_code_;
                    set_result(rc);
                    return;                 
                }
            });
            
            // [8] Response timeout
            wsk_timer_request_ = setTimeout(function() {
                set_result(rc);
                rc = RT_CODE.RT_SOCKET_RECV_TIMEOUT;
                WS_LOG(svc_name +  "...Fail! (" + rc + ") Receive timeout!");
                wsk_req_processing_ = false;
            }, 3000);
        }
    
        //======================================================================
        //  wsk_alternatecall  2022.07.09
        //======================================================================
        function wsk_alternatecall(station, set_result)
        {        
            // [1] Set function name       
            var svc_name         = "WSK_AlternateCall";
            WS_LOG(svc_name);  
                  
            // [2] Setting the json request parameter
            var json_request    = JSON.parse(json_request_); 
            json_request.WSK_PARAM.svc_name   = svc_name;   
            json_request.WSK_PARAM.svc_key    = SVC_KEY_CALL_ALTERNATE;
            json_request.WSK_PARAM.svc_code   = SVC_CODE_CALL_ALTERNATE;         
            
            // [3] Setting mandatory parameters         
            wsk_station_        = station;
                           
            // [4] Websocket processing                                                         
            wsk_request_common(json_request, function(rc) {
                set_result(rc);
                if (rc == 0) {
                    WS_LOG(svc_name + "...OK");
                }
                else {
                    WS_LOG(svc_name + "...Fail! (" + rc + ")");  
                }
            });
        }     

       return {
            // Event
            wsk_reg_event_handler       : wsk_reg_event_handler,
            
            // Connect & Disconnet
            wsk_connect                 : wsk_connect,
            wsk_disconnect              : wsk_disconnect,
            wsk_logout_disconnect       : wsk_logout_disconnect,
            wsk_ipt_logout_disconnect   : wsk_ipt_logout_disconnect,
            
            
            // IPCC
            wsk_login                   : wsk_login, 
            wsk_logout                  : wsk_logout,
            wsk_session_login           : wsk_session_login,
            wsk_ready                   : wsk_ready,
            wsk_aux                     : wsk_aux,
            wsk_acw                     : wsk_acw,
            
            // IPT
            wsk_ipt_login               : wsk_ipt_login, 
            wsk_ipt_logout              : wsk_ipt_logout,
            wsk_ipt_ready               : wsk_ipt_ready,
            wsk_ipt_aux                 : wsk_ipt_aux,
            wsk_ipt_acw                 : wsk_ipt_acw,
            wsk_set_fwd                 : wsk_set_fwd,
            wsk_cancel_fwd              : wsk_cancel_fwd,
            
            // Common
            wsk_answer                  : wsk_answer,
            wsk_clear                   : wsk_clear,
            wsk_hold                    : wsk_hold,
            wsk_retrieve                : wsk_retrieve,
            wsk_alternatecall           : wsk_alternatecall,
            wsk_conference              : wsk_conference,
            wsk_transfer                : wsk_transfer,
            wsk_reconnect               : wsk_reconnect,
            wsk_cancel_password         : wsk_cancel_password,
            
            // Extend
            wsk_make                    : wsk_make,
            wsk_make_uui                : wsk_make_uui,
            wsk_consultation            : wsk_consultation,
            wsk_blind_transfer          : wsk_blind_transfer,
            wsk_ask_password            : wsk_ask_password
            
        }; // return
    
    } // Singleton
    
    
    // Our instance holder
    var instance;
 
    // An emulation of static variables and methods
    var _static = {
 
        // Method for getting an instance.
        // It returns a wsk_singleton instance of a singleton object
        get_instance: function (options) {
            if (instance === undefined) {
                instance = new wsk_singleton(options);
            }
            return instance;
        }
    };
 
    return _static;
    
}());






