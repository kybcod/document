//##############################################################################
//
//      sp_result_code.js
//  
//##############################################################################


RT_CODE = {
	RT_SUCCESS					: 0,
	RT_INVALID_PARAMETER		: "90001",
	RT_SOCKET_CONNECT_FAIL		: "90002",
	RT_SOCKET_NOT_USE			: "90003",
	RT_SOCKET_SEND_FAIL			: "90004",
	RT_SOCKET_RECV_TIMEOUT		: "90005",
	RT_NO_HELD_CALL				: "90006",
	RT_INVLAID_PACKET_LENGTH	: "90007",
	
	RT_AGENT_ALREADY_LOGGEDIN	: "90010",
	RT_AGENT_NOT_LOGGEDIN		: "90011",
	RT_AGENT_INFO_MISMATCH		: "90012",
	RT_AGENT_REQUEST_PROCESSING	: "90013",
	
	RT_TRANSFER_EXCEPTION		: "91000",
	RT_SESSION_DROPPED			: "91001"
};


function    sp_get_result_msg(result_code)
{
    var ret_msg = "";
    
    switch(String(result_code)) { 
        case RT_CODE.RT_SUCCESS                     : ret_msg = "성공입니다.";                      break;                  // "Success";                           break;
        case RT_CODE.RT_INVALID_PARAMETER           : ret_msg = "파라미터가 올바르지 않습니다.";    break;                  // "Invald parameter!";                 break;
	    case RT_CODE.RT_SOCKET_CONNECT_FAIL         : ret_msg = "통신 연결에 문제가 있습니다.";     break;                  // "Socket connection failure!";        break;
	    case RT_CODE.RT_SOCKET_NOT_USE              : ret_msg = "사용 소켓이 아닙니다.";            break;                  // "Socket not use!";                   break;
	    case RT_CODE.RT_SOCKET_SEND_FAIL            : ret_msg = "소켓 전송이 실패했습니다.";      break;                  // "Socke send failure!";               break;
	    case RT_CODE.RT_SOCKET_RECV_TIMEOUT         : ret_msg = "소켓 수신에서 Timeout이 발생하였습니다.";  break;          // "Socket receive timeout!";           break;
	    case RT_CODE.RT_NO_HELD_CALL                : ret_msg = "보류중인 콜이 없습니다.";          break;                  // "No held call!";                     break;
	    case RT_CODE.RT_INVLAID_PACKET_LENGTH       : ret_msg = "패킷 길이가 다릅니다.";            break;                  // "Invalid packet length!";            break;
	    case RT_CODE.RT_AGENT_ALREADY_LOGGEDIN      : ret_msg = "이미 로그인 되어 있습니다";        break;                  // "Agent already loggedon!";           break;
        case RT_CODE.RT_AGENT_NOT_LOGGEDIN          : ret_msg = "로그인 상태가 아닙니다.";          break; 
	    case RT_CODE.RT_AGENT_INFO_MISMATCH         : ret_msg = "상담원 정보가 맞지 않습니다.";     break;                  // "Agnet info was mismatched!";       break;
	    case RT_CODE.RT_AGENT_REQUEST_PROCESSING    : ret_msg = "서비스 요청이 아직 처리중에 있습니다."; break;             // "Agent reqeust processing!";        break;
	    case RT_CODE.RT_TRANSFER_EXCEPTION          : ret_msg = "서비스 요청 처리중에 예외가 발생하였습니다.";  break;      // "Agent Transfer exception!";        break;
	    case RT_CODE.RT_SESSION_DROPPED             : ret_msg = "서버와 연결이 끊겼습니다.";        break;                  // "Socket session dropped!";          break;
	    
	    case "20040"                                : ret_msg = "연결된 콜이 없습니다.";            break;                  // "No active call!";                  break;
	    case "20050"                                : ret_msg = "보류중인 콜이 없습니다.";          breakl                  // "No held call!";                    break;
	    case "20070"                                : ret_msg = "이미 연결이 끊어졌거나 연결된 콜이 없습니다.";break;       // "Already connection dropped or No active call!";    break;
	    case "20330"                                : ret_msg = "요청한 리소스가 Busy상태 입니다."; break;                  // "Resource busy!";                   break;
	    case "50100"                                : ret_msg = "이미 로그인 상태입니다.";          break;                  // "Agent already loggedon!";          break;
	    case "50101"                                : ret_msg = "잘못된 Device입니다.";             break;                  // "Invald device!";                   break;
	    case "50102"                                : ret_msg = "연결된 콜이 없습니다.";            break;                  // "No active call!";                  break;
	    case "50103"                                : ret_msg = "저장된 정보가 없습니다.";          break;                  // "No resrved call info!";            break;
	    case "50104"                                : ret_msg = "잘못된 Socket Handler 입니다.";    break;                  // "Invalid sockete handler!";         break;
	    case "50105"                                : ret_msg = "잘못된 Station Key입니다.";        break;                  // "Invald station key!";              break;
	    case "50106"                                : ret_msg = "잘못된 Resource Handler입니다.";   break;                  // "Invald resource handler!";         break;
	    default                                     : ret_msg = "정의되지 않은 코드입니다.";        break;                  // "Undefined message!";               break;
	}
	return String(result_code) +":" + ret_msg;
}

ws_get_reason = function(ws_code, reason)
{
		switch(ws_code) { 
			case 1000 : reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled."; break;
			case 1001 : reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page."; break;
			case 1002 : reason = "An endpoint is terminating the connection due to a protocol error";	break;
			case 1003 : reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message)."; break;
			case 1004 : reason = "Reserved. The specific meaning might be defined in the future."; break;
			case 1005 : reason = "No status code was actually present."; break;
			case 1006 : reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame"; break;
			case 1007 : reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message)."; break;
			case 1008 : reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy."; break;
			case 1009 : reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process."; break;
			case 1010 : // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
            			reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason; break;
			case 1011 : reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";break;
			case 1015 : reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified)."; break;
			default	 : reason = "Unknown reason"; break;
		}
}