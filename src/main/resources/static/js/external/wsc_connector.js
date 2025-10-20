//##############################################################################
//
//			wsc_connector.js
//
//											Web Worker for Websocket Connector
//                                          for CTIBridge 3.7x
//                                          Edit by Lee eon woo
//
//											Hansol Inticube Co., Ltd.
//											All rights reserved.
//
//##############################################################################


//------------------------------------------------------------------------------
// ready state constants
// 0:CONNECTING, 1:OPEN, 2:CLOSING, 3:CLOSED

//  Websocket Code
// 1000:CLOSE_NORMAL 
// 1001:CLOSE_GOING_AWAY 
// 1002:CLOSE_PROTOCOL_ERROR 
// 1003:CLOSE_UNSUPPORTED 
// 1006:CLOSE_ABNORMAL
//------------------------------------------------------------------------------
 
  
var wsc_connector_       = null;
 
//==============================================================================
//  onmessage
//============================================================================== 
onmessage = function(e) {
    
    switch (e.data.command) {
    case "connector_start":
    {
        if (wsc_connector_ != null) {
            wsc_connector_.close();
            delete wsc_connector_;
        }
        // TODO CTI 연동 시 주석 해제
		wsc_connector_ = new wsc_connector(e.data.server_ip, e.data.server_port);
        break;
    }
            
    case "connector_stop":
    {
        if (wsc_connector_ != null) {
            wsc_connector_.close();
            delete wsc_connector_;
            wsc_connector_ = null;
        }
        break;
    }
        
    case "connector_send":
    {
        if (wsc_connector_ != null) {
            wsc_connector_.send(e.data.message);
        }
        else {
        }
        break;
    }
    default:
        break
    }
};



 

//==============================================================================
//  wsc_connector
//==============================================================================
function wsc_connector(server_ip, server_port)
{	
	// Create websocket
	var wsc_url  = server_ip + ":" + server_port;
	var wsc_sock =new WebSocket(wsc_url);
	
    //---------------------------------
    //  wsc_sock.onopen
    //---------------------------------
    wsc_sock.onopen = function() {
        postMessage({message: 'ws_on_opened'});
    }

	//---------------------------------
    //  wsc_sock.onclose
    //---------------------------------
	wsc_sock.onclose = function(e) {
		postMessage({message: 'ws_on_closed'});
	}	
	
	//---------------------------------
    //  wsc_sock.onmessage
    //---------------------------------
	wsc_sock.onmessage = function(e) {
		console.log('on message:'+e.data);
		if (e.data.length == 4 && e.data == "PONG")	{
		    return;
		}
		postMessage({message: 'ws_on_message', data: e.data});
	}	

	//---------------------------------
    //  send
    //---------------------------------
    function send(data)
    {
        if (wsc_sock.readyState != 1) { // 1=open
			return;
		}  
		
		try {
			wsc_sock.send(data);
		} catch(e) {
			return;
		} 
    }
    
    //---------------------------------
    //  close
    //---------------------------------
    function close()
    {
	    try {
			wsc_sock.close();
		} catch(e) {
		}
	}
	
	//--------------------------------------------------------------------------
    //  connector_function
    //--------------------------------------------------------------------------
	function connector_function() {
	}
	return {
		send    : send,
		close   : close
	};
}
		
