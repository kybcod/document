//##############################################################################
//
//          wse_event.js
//
//                                          BridgeW Event Handler
//                                          for CTIBridge 3.7x
//                                          Edit by Lee eon woo
//
//                                          Hansol Inticube Co., Ltd.
//                                          All rights reserved.
//
//##############################################################################


//==============================================================================
// Define event code
//==============================================================================
// SVC_CODE_EVT_SVC_INITIATED       = 401;
// SVC_CODE_EVT_DELIVERED           = 402;
// SVC_CODE_EVT_FAILED              = 403;
// SVC_CODE_EVT_ESTABLISHED         = 404;
// SVC_CODE_EVT_CALL_CLEARED        = 405;
// SVC_CODE_EVT_HELD                = 406;
// SVC_CODE_EVT_RETRIEVED           = 407;
// SVC_CODE_EVT_CONFERENCED         = 408;
// SVC_CODE_EVT_TRANSFERRED         = 409;
// SVC_CODE_EVT_TRANSFER_CLEARED    = 410;
// SVC_CODE_EVT_CONSULT_CLEARED     = 411;
// SVC_CODE_EVT_ABANDON_CLEARED     = 412;
// SVC_CODE_EVT_IVR_CLEARED         = 413;
// SVC_CODE_EVT_MONITOR_END         = 414;
// SVC_CODE_EVT_DIVERTED            = 415;
// SVC_CODE_EVT_DELIVERED_OUT       = 416;
// SVC_CODE_EVT_NETWORK_REACHED     = 417;
// SVC_CODE_EVT_ORIGINATED          = 418;
// SVC_CODE_EVT_PASS_SEND           = 419;
//------------------------------------------------------------------------------

var wse_callid1_                = 0;
var wse_callid2_                = 0;



//==============================================================================
//  wse_event_handler
//==============================================================================
function wse_event_handler(json_evt)
{

    disp_call_status(json_evt.WSK_EVENT.svc_key);

    switch(json_evt.WSK_EVENT.svc_key) {
        case SVC_KEY_EVT_SVC_INITIATED         : on_event_svc_initiated(json_evt);        break;
        case SVC_KEY_EVT_DELIVERED             : on_event_delivered(json_evt);            break;
        case SVC_KEY_EVT_FAILED                : on_event_failed(json_evt);               break;
        case SVC_KEY_EVT_ESTABLISHED           : on_event_established(json_evt);          break;
        case SVC_KEY_EVT_CALL_CLEARED          : on_event_call_cleared(json_evt);         break;
        case SVC_KEY_EVT_HELD                  : on_event_held(json_evt);                 break;
        case SVC_KEY_EVT_RETRIEVED             : on_event_retrieved(json_evt);            break;
        case SVC_KEY_EVT_CONFERENCED           : on_event_conferenced(json_evt);          break;
        case SVC_KEY_EVT_TRANSFERRED           : on_event_transferred(json_evt);          break;
        case SVC_KEY_EVT_TRANSFER_CLEARED      : on_event_transfer_cleared(json_evt);     break;
        case SVC_KEY_EVT_CONSULT_CLEARED       : on_event_consult_cleared(json_evt);      break;
        case SVC_KEY_EVT_ABANDON_CLEARED       : on_event_abandon_cleared(json_evt);      break;
        case SVC_KEY_EVT_IVR_CLEARED           : on_event_ivr_cleared(json_evt);          break;
        case SVC_KEY_EVT_MONITOR_END           : on_event_monitor_end(json_evt);          break;
        case SVC_KEY_EVT_DIVERTED              : on_event_diverted(json_evt);             break;
        case SVC_KEY_EVT_DELIVERED_OUT         : on_event_delivered_out(json_evt);        break;
        case SVC_KEY_EVT_NETWORK_REACHED       : on_event_network_reached(json_evt);      break;
        case SVC_KEY_EVT_ORIGINATED            : on_event_originated(json_evt);           break;
        case SVC_KEY_EVT_PASS_SEND             : on_event_pass_send(json_evt);            break;
        case SVC_KEY_EVT_CUSTOMER_CLEARED      : on_event_customer_cleared(json_evt);     break;
        case SVC_KEY_EVT_DROP_SOCKET           : on_event_drop_socket(json_evt);          break;


        // Connection
        case SVC_KEY_EVT_RECONNECT_SERVER      : on_event_reconnect_server(json_evt);     break;
        case SVC_KEY_EVT_RECONNECT_SUCCESS     : on_event_reconnect_success(json_evt);    break;
        case SVC_KEY_EVT_RECONNECT_PROCESS     : on_event_reconnect_process(json_evt);    break;
        case SVC_KEY_EVT_RECONNECT_FAILURE     : on_event_reconnect_failure(json_evt);    break;
        default: break;
    }
}



//==============================================================================
//  get_channel_name
//==============================================================================
function get_channel_name(channel_type)
{
    var channel_name    = "";

    switch(channel_type) {
        case CHANNEL_TYPE_EXTENSION     : channel_name = "내선";                break;
        case CHANNEL_TYPE_IVR           : channel_name = "IVR";                 break;
        case CHANNEL_TYPE_PDS           : channel_name = "PDS";                 break;
        case CHANNEL_TYPE_CALLBACK      : channel_name = "콜백";                break;
        case CHANNEL_TYPE_VOIP          : channel_name = "멀티미디어(VoIP)";    break;
        case CHANNEL_TYPE_CHAT          : channel_name = "멀티미디어(Chat)";    break;
        case CHANNEL_TYPE_EMAIL         : channel_name = "멀티미디어(Email)";   break;
        case CHANNEL_TYPE_BRANCH        : channel_name = "지점";                break;
        case CHANNEL_TYPE_DID           : channel_name = "직통";                break;
        case CHANNEL_TYPE_VDN           : channel_name = "그룹";                break;
        case CHANNEL_TYPE_CONSULTATION  : channel_name = "호전환";              break;
        default                         : channel_name = "";                    break;
    }
    return channel_name;
}

//==============================================================================
//  get_direct_name
//==============================================================================
function get_direct_name(direct_type)
{
    var direct_name    = "";

    switch(direct_type) {
        case DIRECT_TYPE_IN             : direct_name = "인바운드";             break;
        case DIRECT_TYPE_OUT            : direct_name = "아웃바운드";           break;
        default                         : direct_name = "";                     break;
    }
    return direct_name;
}










//==============================================================================
//  on_event_svc_initiated
//==============================================================================
function on_event_svc_initiated(json_evt)
{
    var callid = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<SvcInitiated> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<SvcInitiated> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<SvcInitiated> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}

//----------------------------------------------------------------------
//  Originated Event
//----------------------------------------------------------------------
function on_event_originated(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<Originated> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<Originated> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<Originated> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}



//----------------------------------------------------------------------
//  on_event_delivered_out
//----------------------------------------------------------------------
function on_event_delivered_out(json_evt)
{
    var callid = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<DeliveredOut> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<DeliveredOut> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<DeliveredOut> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}



//----------------------------------------------------------------------
//  Network Reached Event
//----------------------------------------------------------------------
function on_event_network_reached(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

  if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<NetworkReached> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<NetworkReached> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<NetworkReached> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}


//----------------------------------------------------------------------
//  on_event_failed
//----------------------------------------------------------------------
function on_event_failed(json_evt)
{
    var callid = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<Failed> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<Failed> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<Failed> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}

//----------------------------------------------------------------------
//  on_event_established
//----------------------------------------------------------------------
function on_event_established(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<Established> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<Established> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<Established> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}



//----------------------------------------------------------------------
//  Held Event
//----------------------------------------------------------------------
function on_event_held(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

   if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<Held> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<Held> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<Held> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}

//----------------------------------------------------------------------
//  Retrieved Event
//----------------------------------------------------------------------
function on_event_retrieved(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

   if (wse_callid1_ == 0) {
        wse_callid1_ = callid;
        disp_log("<Retrieved> CID=" + wse_callid1_);
    }
    else if(wse_callid1_ == callid) {
        disp_log("<Retrieved> CID=" + wse_callid1_);
    }
    else {
        wse_callid2_ = callid;
        disp_log("<Retrieved> CID=" + wse_callid1_ + ", 2nd_CID=" + wse_callid2_);
    }
}








//==============================================================================
//  on_event_delivered
//==============================================================================
function on_event_delivered(json_evt)
{
    var callid = json_evt.WSK_EVENT.callid;

    wse_callid1_ = callid;
    wse_callid2_ = 0;
    disp_log("<Delivered IN> CID=" + wse_callid1_ + ", ANI=" + json_evt.WSK_EVENT.ani);


    // Set popup data
    document.getElementById("p_channel").value      = get_channel_name(json_evt.WSK_EVENT.channel_type);
    document.getElementById("p_direct").value       = get_direct_name(json_evt.WSK_EVENT.direct_type);
    document.getElementById("p_ani").value          = json_evt.WSK_EVENT.ani;
    document.getElementById("p_inbound_data").text  = json_evt.WSK_EVENT.inbound_data;

}

//----------------------------------------------------------------------
//  Transferred Event
//----------------------------------------------------------------------
function on_event_transferred(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    wse_callid1_    = callid;
    wse_callid2_    = 0;

    disp_log("<Transferred> CID=" + wse_callid1_);
}


//----------------------------------------------------------------------
//  Consult Cleared Event
//----------------------------------------------------------------------
function on_event_consult_cleared(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;
    wse_callid2_    = 0;

    disp_log("<ConsultCleared> CID=" + wse_callid1_+ ", 2nd_CID=" + callid);
}






//----------------------------------------------------------------------
//  (Password)IVR Cleared Event
//----------------------------------------------------------------------
function on_event_ivr_cleared(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    wse_callid2_    = 0;

    disp_log("<IVRCleared> CID=" + wse_callid1_ + ", 2nd_CID=" + callid);
}






//----------------------------------------------------------------------
//  Conferenced Event
//----------------------------------------------------------------------
function on_event_conferenced(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    if (wse_callid1_ != 0 && wse_callid2_ == callid) {
        wse_callid1_    = wse_callid2_;
        wse_callid2_    = 0;
        disp_log("<Conferenced> CID=" + wse_callid1_);
    }

}




//----------------------------------------------------------------------
//  on_event_call_cleared
//----------------------------------------------------------------------
function on_event_call_cleared(json_evt)
{
    disp_log("<CallCleared> CID=" + json_evt.WSK_EVENT.callid);

    wse_callid1_ = 0;
    wse_callid2_ = 0;

}

//----------------------------------------------------------------------
//  Transfer Cleared Event
//----------------------------------------------------------------------
function on_event_transfer_cleared(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    wse_callid1_    = 0;
    wse_callid2_    = 0;

    disp_log("<TransferCleared> CID=" + callid);
}


//----------------------------------------------------------------------
//  Abandon Cleared Event
//----------------------------------------------------------------------
function on_event_abandon_cleared(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    wse_callid1_    = 0;
    wse_callid2_    = 0;

    disp_log("<AbandonCleared> CID=" + callid);
}

//----------------------------------------------------------------------
//  Diverted Event
//----------------------------------------------------------------------
function on_event_diverted(json_evt)
{
    var callid  = json_evt.WSK_EVENT.callid;

    wse_callid1_    = 0;
    wse_callid2_    = 0;

    disp_log("<Diverted> CID=" + callid);
}


//----------------------------------------------------------------------
//  Monitor End  Event
//----------------------------------------------------------------------
function on_event_monitor_end(json_evt)
{
    disp_log("<MonitorEnded>");
}



//----------------------------------------------------------------------
//  Password Send Event
//----------------------------------------------------------------------
function on_event_pass_send(json_evt)
{
    disp_log("<PassSend> CID=" + json_evt.WSK_EVENT.callid);
}





//----------------------------------------------------------------------
//  Reconnect Server Event
//----------------------------------------------------------------------
function on_event_reconnect_server(json_evt) {
    disp_log("<Reconnect Server>(" + json_evt.WSK_EVENT.res_basic + ")");
}


//----------------------------------------------------------------------
//  Reconnect Success Event
//----------------------------------------------------------------------
function on_event_reconnect_success(json_evt) {
    disp_log("<Reconnect Success>");
}

//----------------------------------------------------------------------
//  Reconnect process Event
//----------------------------------------------------------------------
function on_event_reconnect_process(json_evt) {
    disp_log("<Reconnect Process> Try=" + json_evt.WSK_EVENT.try_count);
}

//----------------------------------------------------------------------
//  Reconnect Failure Event
//----------------------------------------------------------------------
function on_event_reconnect_failure(json_evt) {
    disp_log("<Reconnect Failure> Try=" + json_evt.WSK_EVENT.try_count + ", Limit=" + json_evt.WSK_EVENT.limit_count);
}



//----------------------------------------------------------------------
//  Drop Session Event
//----------------------------------------------------------------------
function on_event_drop_socket(json_evt) {
    disp_log("<Connection dropped!>");
}


