//##############################################################################
//
//			sp_packet.js
//
//											Softphone packet
//                                          for CTIBridge 3.7
//                                          Edit by Lee eon woo
//	
//											Hansol Inticube Co., Ltd.
//											All rights reserved.
//
//##############################################################################




//------------------------------------------------------------------------------
//  Channel Type
//------------------------------------------------------------------------------
const CHANNEL_TYPE_UNDEFINED            = "00";
const CHANNEL_TYPE_EXTENSION            = "02";
const CHANNEL_TYPE_IVR				    = "03";
const CHANNEL_TYPE_PDS				    = "04";
const CHANNEL_TYPE_CALLBACK			    = "05";
const CHANNEL_TYPE_VOIP				    = "06";
const CHANNEL_TYPE_CHAT				    = "07";
const CHANNEL_TYPE_EMAIL			    = "08";
const CHANNEL_TYPE_BRANCH			    = "09";
const CHANNEL_TYPE_DID				    = "10";
const CHANNEL_TYPE_VDN				    = "11";
const CHANNEL_TYPE_CONSULTATION		    = "12";

//------------------------------------------------------------------------------
//  Direct Type
//------------------------------------------------------------------------------
const DIRECT_TYPE_UNDEFINED		        = "00";
const DIRECT_TYPE_IN				    = "03";
const DIRECT_TYPE_OUT				    = "05";




//------------------------------------------------------------------------------
//  Packet Key
//------------------------------------------------------------------------------
const PACKET_KEY_AGT_SERVICE            = "AGT_SERV";
const PACKET_KEY_CTI_EVENT		        = "CTI_EVNT";

const SVC_TYPE_COMMON                   = 1;
const SVC_TYPE_CALL_MAKE                = 2;
const SVC_TYPE_CALL_CONSULTATION        = 3;   
const SVC_TYPE_PASSWORD                 = 4; 

//------------------------------------------------------------------------------
//  Packet Length
//------------------------------------------------------------------------------
const PACKET_LENGTH_AGT_COMMON          = "0120";
const PACKET_LENGTH_AGT_MAKE            = "0140";
const PACKET_LENGTH_AGT_MAKE_UUI        = "0236";
const PACKET_LENGTH_AGT_CONSULT		    = "0481";
const PACKET_LENGTH_AGT_PASSWORD	    = "0220";

const PK_LEN_AGT_COMMON                 = 120;
const PK_LEN_AGT_MAKE                   = 140;
const PK_LEN_AGT_MAKE_UUI               = 236;
const PK_LEN_AGT_CONSULT                = 481;
const PK_LEN_AGT_PASSWORD               = 220;


const PK_LEN_EVT_BASIC                  = "0106";
const PK_LEN_EVT_EXTEND                 = "0475";
const PK_LEN_EVT_PASSWORD               = "0217";

//------------------------------------------------------------------------------
//  Length of Packet field(request)
//------------------------------------------------------------------------------
const PK_LEN_FLAG                       = 1;

const PK_LEN_PACKET_KEY                 = 8;
const PK_LEN_LENGTH                     = 4;	
const PK_LEN_RESULT_CODE                = 5;
const PK_LEN_TR_CODE                    = 10;
const PK_LEN_TIME                       = 14;
const PK_LEN_SVC_KEY                    = 8;
const PK_LEN_SVC_CODE                   = 3;
const PK_LEN_STATION                    = 10;
const PK_LEN_AGENTID                    = 10;
const PK_LEN_EXTRA                      = 10;
const PK_LEN_STATUS                     = 2;
const PK_LEN_RES_COMMON                 = 41;
const PK_LEN_ERROR_MSG                  = 20;
const PK_LEN_AUX_REASON                 = 2;

const PK_LEN_DEST                       = 20;
const PK_LEN_INBOUND_DATA               = 200;
const PK_LEN_CONSULT_DATA               = 100;
const PK_LEN_PW_TYPE                    = 2;
const PK_LEN_PW_DATA                    = 100;
const PK_LEN_QUE_TIME                   = 6;

const PK_LEN_SERVER_ID                  = 6;

//------------------------------------------------------------------------------
//  Length of Packet field(event)
//------------------------------------------------------------------------------
const PK_LEN_RES_BASIC                  = 29;

const PK_LEN_CALLID                     = 5;
const PK_LEN_CHANNEL_TYPE               = 2;
const PK_LEN_DIRECT_TYPE                = 2;
const PK_LEN_TRUNK_GROUP                = 3;
const PK_LEN_TRUNK_MEMBER               = 3;
const PK_LEN_SPLIT                      = 6;
const PK_LEN_UCID                       = 20;
const PK_LEN_DNIS                       = 20;
const PK_LEN_ANI                        = 20;
const PK_LEN_UUI_DATA                   = 96;
const PK_LEN_RES_EXTEND                 = 20;
const PK_LEN_CALLINF_RES                = 20;

const PK_LEN_SMALL_DNIS                 = 10;
const PK_LEN_COUNT                      = 3;



//------------------------------------------------------------------------------
// The position of Event packet     
//  Websocket   
//------------------------------------------------------------------------------
// Basic event
const POS_PK_EVT_PACKET_KEY         = 0;
const POS_PK_EVT_LENGTH             = POS_PK_EVT_PACKET_KEY     + PK_LEN_PACKET_KEY;
const POS_PK_EVT_RESULT_CODE        = POS_PK_EVT_LENGTH         + PK_LEN_LENGTH;
const POS_PK_EVT_SVC_KEY            = POS_PK_EVT_RESULT_CODE    + PK_LEN_RESULT_CODE;
const POS_PK_EVT_SVC_CODE           = POS_PK_EVT_SVC_KEY        + PK_LEN_SVC_KEY;
const POS_PK_EVT_TIME               = POS_PK_EVT_SVC_CODE       + PK_LEN_SVC_CODE       + PK_LEN_FLAG;
const POS_PK_EVT_STATION            = POS_PK_EVT_TIME           + PK_LEN_TIME           + PK_LEN_FLAG;
const POS_PK_EVT_AGENTID            = POS_PK_EVT_STATION        + PK_LEN_STATION        + PK_LEN_FLAG;
const POS_PK_EVT_CALLID             = POS_PK_EVT_AGENTID        + PK_LEN_AGENTID        + PK_LEN_FLAG;
const POS_PK_EVT_CHANNEL_TYPE       = POS_PK_EVT_CALLID         + PK_LEN_CALLID         + PK_LEN_FLAG;
const POS_PK_EVT_DIRECT_TYPE        = POS_PK_EVT_CHANNEL_TYPE   + PK_LEN_CHANNEL_TYPE   + PK_LEN_FLAG;
const POS_PK_EVT_RES_BASIC          = POS_PK_EVT_DIRECT_TYPE    + PK_LEN_DIRECT_TYPE;

// Extend event
const POS_PK_EVT_UCID               = POS_PK_EVT_RES_BASIC      + PK_LEN_RES_BASIC      + PK_LEN_FLAG;
const POS_PK_EVT_DNIS               = POS_PK_EVT_UCID           + PK_LEN_UCID           + PK_LEN_FLAG;
const POS_PK_EVT_ANI                = POS_PK_EVT_DNIS           + PK_LEN_DNIS           + PK_LEN_FLAG;
const POS_PK_EVT_QUE_TIME           = POS_PK_EVT_ANI            + PK_LEN_ANI;
const POS_PK_EVT_INBOUND_DATA       = POS_PK_EVT_QUE_TIME       + PK_LEN_QUE_TIME;
const POS_PK_EVT_CONSULT_DATA       = POS_PK_EVT_INBOUND_DATA   + PK_LEN_INBOUND_DATA;

// Password event
const POS_PK_EVT_PW_IVR             = POS_PK_EVT_RES_BASIC      + PK_LEN_RES_BASIC      + PK_LEN_FLAG;
const POS_PK_EVT_PW_DATA            = POS_PK_EVT_PW_IVR         + PK_LEN_STATION;



/* ActiveX
//------------------------------------------------------------------------------
// The position of Event packet        
//------------------------------------------------------------------------------
// Basic event
const POS_PK_EVT_SVC_KEY                = 0;
const POS_PK_EVT_SVC_CODE               = POS_PK_EVT_SVC_KEY        + PK_LEN_SVC_KEY;
const POS_PK_EVT_TIME                   = POS_PK_EVT_SVC_CODE       + PK_LEN_SVC_CODE       + PK_LEN_FLAG;
const POS_PK_EVT_STATION                = POS_PK_EVT_TIME           + PK_LEN_TIME           + PK_LEN_FLAG;
const POS_PK_EVT_AGENTID                = POS_PK_EVT_STATION        + PK_LEN_STATION        + PK_LEN_FLAG;
const POS_PK_EVT_CALLID                 = POS_PK_EVT_AGENTID        + PK_LEN_AGENTID        + PK_LEN_FLAG;
const POS_PK_EVT_CHANNEL_TYPE           = POS_PK_EVT_CALLID         + PK_LEN_CALLID         + PK_LEN_FLAG;
const POS_PK_EVT_DIRECT_TYPE            = POS_PK_EVT_CHANNEL_TYPE   + PK_LEN_CHANNEL_TYPE   + PK_LEN_FLAG;
const POS_PK_EVT_RES_BASIC              = POS_PK_EVT_DIRECT_TYPE    + PK_LEN_DIRECT_TYPE;

// Extend event
const POS_PK_EVT_UCID                   = POS_PK_EVT_RES_BASIC      + PK_LEN_RES_BASIC      + PK_LEN_FLAG;
const POS_PK_EVT_DNIS                   = POS_PK_EVT_UCID           + PK_LEN_UCID           + PK_LEN_FLAG;
const POS_PK_EVT_ANI                    = POS_PK_EVT_DNIS           + PK_LEN_DNIS           + PK_LEN_FLAG;
const POS_PK_EVT_QUE_TIME               = POS_PK_EVT_ANI            + PK_LEN_ANI;
const POS_PK_EVT_INBOUND_DATA           = POS_PK_EVT_QUE_TIME       + PK_LEN_QUE_TIME;
const POS_PK_EVT_CONSULT_DATA           = POS_PK_EVT_INBOUND_DATA   + PK_LEN_INBOUND_DATA;

// Password event
const POS_PK_EVT_PW_IVR                 = POS_PK_EVT_RES_BASIC      + PK_LEN_RES_BASIC      + PK_LEN_FLAG;
const POS_PK_EVT_PW_DATA                = POS_PK_EVT_PW_IVR         + PK_LEN_STATION;
*/


//------------------------------------------------------------------------------
//  SVC CODE & KEY (Agent Status)
//------------------------------------------------------------------------------
const SVC_CODE_SET_LOGIN                = 101;
const SVC_KEY_SET_LOGIN				    = "A_LOGIN_";

const SVC_CODE_SET_LOGOUT               = 102;
const SVC_KEY_SET_LOGOUT			    = "A_LOGOUT";

const SVC_CODE_SET_READY                = 103;
const SVC_KEY_SET_READY				    = "A_SETRDY";

const SVC_CODE_SET_AUX                  = 104;
const SVC_KEY_SET_AUX				    = "A_SETAUX";

const SVC_CODE_SET_ACW                  = 105;
const SVC_KEY_SET_ACW				    = "A_SETACW";

const SVC_CODE_SESSION_LOGIN            = 106;
const SVC_KEY_SESSION_LOGIN			    = "A_SESSIO";


//-------------------------------------------------------------
//	[1xx] IPT Set Function
//	2018.04.04
//-------------------------------------------------------------
const SVC_CODE_SET_IPT_LOGIN            = 111;
const SVC_KEY_SET_IPT_LOGIN	            = "I_LOGIN_";
const SVC_CODE_SET_IPT_LOGOUT           = 112;
const SVC_KEY_SET_IPT_LOGOUT            = "I_LOGOUT";
const SVC_CODE_SET_IPT_READY            = 113;
const SVC_KEY_SET_IPT_READY             = "I_SETRDY";
const SVC_CODE_SET_IPT_AUX              = 114;
const SVC_KEY_SET_IPT_AUX               = "I_SETAUX";
const SVC_CODE_SET_IPT_ACW              = 115;
const SVC_KEY_SET_IPT_ACW               = "I_SETACW";



//------------------------------------------------------------------------------
//  SVC CODE & KEY (Call Control)
//------------------------------------------------------------------------------
const SVC_CODE_CALL_MAKE                = 201;
const SVC_KEY_CALL_MAKE				    = "A_MAKECL";

const SVC_CODE_CALL_ANSWER              = 202;
const SVC_KEY_CALL_ANSWER			    = "A_ANSWER";

const SVC_CODE_CALL_CLEAR               = 203;
const SVC_KEY_CALL_CLEAR		        = "A_CLEAR_";

const SVC_CODE_CALL_HOLD                = 204;
const SVC_KEY_CALL_HOLD				    = "A_HOLDCL";

const SVC_CODE_CALL_RETRIEVE            = 205;
const SVC_KEY_CALL_RETRIEVE			    = "A_RETRIE";

const SVC_CODE_CALL_CONSULTATION        = 206;
const SVC_KEY_CALL_CONSULTATION		    = "A_CONSUL";

const SVC_CODE_CALL_CONFERENCE          = 207;
const SVC_KEY_CALL_CONFERENCE		    = "A_CONFER";

const SVC_CODE_CALL_TRANSFER            = 208;
const SVC_KEY_CALL_TRANSFER			    = "A_TRANSF";

const SVC_CODE_CALL_RECONNECT           = 209;
const SVC_KEY_CALL_RECONNECT		    = "A_RECONN";

// 2022.07.09
const SVC_CODE_CALL_ALTERNATE			= 210;
const SVC_KEY_CALL_ALTERNATE			= "A_ALTERN";

const SVC_CODE_CALL_BLIND_TRANSFER      = 211;
const SVC_KEY_CALL_BLIND_TRANSFER	    = "A_BLTRAN";

const SVC_CODE_PASS_ASK				    = 214;
const SVC_KEY_PASS_ASK				    = "A_PW_ASK";

const SVC_CODE_PASS_CANCEL				= 218;
const SVC_KEY_PASS_CANCEL			    = "A_PW_CAN";

/*
const SVC_CODE_QRY_ACD_SPLIT            = 301;
const SVC_CODE_QRY_AGENT_STATE          = 302;
const SVC_CODE_QRY_DEVICE_INFO          = 303;
 */
 

/*

const SVC_KEY_CALL_ALTERNATE	        = "A_ALTERN"

const SVC_KEY_CALL_SSCONFER			    = "A_SCONFR"
const SVC_KEY_SEND_DTMF_TONE		    = "A_SDDTMF"


const SVC_KEY_PASS_REGISTER			    = "A_PW_REG"
const SVC_KEY_PASS_CHANGE			    = "A_PW_CHA"
const SVC_KEY_PASS_GET				    = "A_PW_GET"
const SVC_KEY_AGT_RESERVED1			    = "A_RESER1"
const SVC_KEY_AGT_RESERVED2			    = "A_RESER2"
const SVC_KEY_CALL_CONSULTATION_UUI	    = "A_CONUUI"
*/


//------------------------------------------------------------------------------
//  2018.04.05 
//------------------------------------------------------------------------------
const SVC_CODE_CALL_MAKE_UUI            = 240;
const SVC_KEY_CALL_MAKE_UUI				= "A_MAKUUI";
const SVC_CODE_SET_FWD					= 241;
const SVC_KEY_SET_FWD					= "A_SETFWD";
const SVC_CODE_CANCEL_FWD				= 242;
const SVC_KEY_CANCEL_FWD				= "A_CANFWD";




//------------------------------------------------------------------------------
//  SVC CODE & KEY(Event)
//------------------------------------------------------------------------------
const SVC_CODE_EVT_SVC_INITIATED        = 401;
const SVC_CODE_EVT_DELIVERED		    = 402;
const SVC_CODE_EVT_FAILED			    = 403;
const SVC_CODE_EVT_ESTABLISHED		    = 404;
const SVC_CODE_EVT_CALL_CLEARED		    = 405;
const SVC_CODE_EVT_HELD				    = 406;
const SVC_CODE_EVT_RETRIEVED		    = 407;
const SVC_CODE_EVT_CONFERENCED		    = 408;
const SVC_CODE_EVT_TRANSFERRED		    = 409;
const SVC_CODE_EVT_TRANSFER_CLEARED	    = 410;
const SVC_CODE_EVT_CONSULT_CLEARED	    = 411;
const SVC_CODE_EVT_ABANDON_CLEARED	    = 412;
const SVC_CODE_EVT_IVR_CLEARED		    = 413;
const SVC_CODE_EVT_MONITOR_END		    = 414;
const SVC_CODE_EVT_DIVERTED			    = 415;
const SVC_CODE_EVT_DELIVERED_OUT	    = 416;
const SVC_CODE_EVT_NETWORK_REACHED	    = 417;
const SVC_CODE_EVT_ORIGINATED		    = 418;
const SVC_CODE_EVT_PASS_SEND		    = 419;
const SVC_CODE_EVT_CUSTOMER_CLEARED     = 420;
const SVC_CODE_EVT_DROP_SOCKET          = 501;

const SVC_KEY_EVT_SVC_INITIATED		    = "E_SVCINI";
const SVC_KEY_EVT_DELIVERED			    = "E_DELIVE";
const SVC_KEY_EVT_FAILED			    = "E_FAILED";
const SVC_KEY_EVT_ESTABLISHED		    = "E_ESTABL";
const SVC_KEY_EVT_CALL_CLEARED		    = "E_CALCLR";
const SVC_KEY_EVT_HELD				    = "E_HELDCL";
const SVC_KEY_EVT_RETRIEVED			    = "E_RETRIE";
const SVC_KEY_EVT_CONFERENCED		    = "E_CONFER";
const SVC_KEY_EVT_TRANSFERRED		    = "E_TRANSF";
const SVC_KEY_EVT_TRANSFER_CLEARED	    = "E_TRACLR";
const SVC_KEY_EVT_CONSULT_CLEARED	    = "E_CONCLR";
const SVC_KEY_EVT_ABANDON_CLEARED	    = "E_ABACLR";
const SVC_KEY_EVT_IVR_CLEARED		    = "E_IVRCLR";
const SVC_KEY_EVT_MONITOR_END		    = "E_MONEND";
const SVC_KEY_EVT_DIVERTED			    = "E_DIVERT";
const SVC_KEY_EVT_DELIVERED_OUT		    = "E_DEL_OU";
const SVC_KEY_EVT_NETWORK_REACHED	    = "E_NETWOR";
const SVC_KEY_EVT_ORIGINATED		    = "E_ORIGNI";
const SVC_KEY_EVT_PASS_SEND			    = "E_SENDPW";
const SVC_KEY_EVT_CUSTOMER_CLEARED      = "E_CUSCLR";
const SVC_KEY_EVT_DROP_SOCKET           = "E_SOCKDP";

//------------------------------------------------------------------------------
//  SVC CODE & KEY(Kepco)
//------------------------------------------------------------------------------
const SVC_CODE_EVT_RECONNECT_SUCCESS    = 505;
const SVC_KEY_EVT_RECONNECT_SUCCESS     = "E_CON_OK";

const SVC_CODE_EVT_RECONNECT_PROCESS    =  506;
const SVC_KEY_EVT_RECONNECT_PROCESS     = "E_REPROC";

const SVC_CODE_EVT_RECONNECT_FAILURE    = 507;
const SVC_KEY_EVT_RECONNECT_FAILURE     = "E_CON_FA";

const SVC_CODE_EVT_RECONNECT_SERVER     = 508;
const SVC_KEY_EVT_RECONNECT_SERVER      = "E_RECONN";



//==============================================================================
//  get_common_packet
//==============================================================================
function get_common_packet(p_svc_key, p_svc_code, station, agentid, extra, reason_code, reserved)
{
    var p_result_code   = get_packet_field("",          PK_LEN_RESULT_CODE);
    var p_time          = get_packet_time();
    var p_station       = get_packet_field(station,     PK_LEN_STATION);
    var p_agentid       = get_packet_field(agentid,     PK_LEN_AGENTID);
    var p_extra         = get_packet_field(extra,       PK_LEN_EXTRA);
    var p_status        = get_packet_field(reason_code, PK_LEN_STATUS);
    var p_reserved      = get_packet_field(reserved,    PK_LEN_RES_COMMON);
               
    var common_packet   = PACKET_KEY_AGT_SERVICE +
                          PACKET_LENGTH_AGT_COMMON + 
                          p_result_code +
                          p_svc_key +
                          p_svc_code +
                          "m" + p_time +
                          "s" + p_station +
                          "a" + p_agentid +
                          "e" + p_extra +
                          "u" + p_status +
                          p_reserved;
                          
    return common_packet;           
} 

//==============================================================================
//  get_make_packet
//==============================================================================
function get_make_packet(p_svc_key, p_svc_code, station, agentid, dest_no)
{
    var p_result_code   = get_packet_field("",          PK_LEN_RESULT_CODE);
    var p_time          = get_packet_time();
    var p_station       = get_packet_field(station,     PK_LEN_STATION);
    var p_agentid       = get_packet_field(agentid,     PK_LEN_AGENTID);
    var p_extra         = get_packet_field("",          PK_LEN_EXTRA);
    var p_status        = get_packet_field("",          PK_LEN_STATUS);
    var p_reserved      = get_packet_field("",          PK_LEN_RES_COMMON);
    
    // MakeDest
    var p_dest          = get_packet_field(dest_no,     PK_LEN_DEST);
     
    var make_packet     = PACKET_KEY_AGT_SERVICE +
                          PACKET_LENGTH_AGT_MAKE + 
                          p_result_code +
                          p_svc_key +
                          p_svc_code +
                          "m" + p_time +
                          "s" + p_station +
                          "a" + p_agentid +
                          "e" + p_extra +
                          "u" + p_status +
                          p_reserved +
                          p_dest;
    return make_packet;           
} 


//==============================================================================
//  get_make_packet
//==============================================================================
function get_make_uui_packet(p_svc_key, p_svc_code, station, agentid, dest_no, uui_data)
{
    var p_result_code   = get_packet_field("",          PK_LEN_RESULT_CODE);
    var p_time          = get_packet_time();
    var p_station       = get_packet_field(station,     PK_LEN_STATION);
    var p_agentid       = get_packet_field(agentid,     PK_LEN_AGENTID);
    var p_extra         = get_packet_field("",          PK_LEN_EXTRA);
    var p_status        = get_packet_field("",          PK_LEN_STATUS);
    var p_reserved      = get_packet_field("",          PK_LEN_RES_COMMON);
    
    // MakeDest
    var p_dest          = get_packet_field(dest_no,     PK_LEN_DEST);
    var p_uui_data      = get_packet_field(uui_data,    PK_LEN_UUI_DATA);
     
    var make_uui_packet = PACKET_KEY_AGT_SERVICE +
                          PACKET_LENGTH_AGT_MAKE_UUI + 
                          p_result_code +
                          p_svc_key +
                          p_svc_code +
                          "m" + p_time +
                          "s" + p_station +
                          "a" + p_agentid +
                          "e" + p_extra +
                          "u" + p_status +
                          p_reserved +
                          p_dest +
                          p_uui_data;
    return make_uui_packet;           
} 

//==============================================================================
//  get_consult_packet
//==============================================================================
function get_consult_packet(p_svc_key, p_svc_code, station, agentid, consult_dest, consult_ani, consult_ucid, inbound_data, consult_data)
{
    var p_result_code   = get_packet_field("",          PK_LEN_RESULT_CODE);
    var p_time          = get_packet_time();
    var p_station       = get_packet_field(station,     PK_LEN_STATION);
    var p_agentid       = get_packet_field(agentid,     PK_LEN_AGENTID);
    var p_extra         = get_packet_field("",          PK_LEN_EXTRA);
    var p_status        = get_packet_field("",          PK_LEN_STATUS);
    var p_reserved      = get_packet_field("",          PK_LEN_RES_COMMON);
    
    // ConsultData
    var p_dest          = get_packet_field(consult_dest,PK_LEN_DEST);
    var p_ani           = get_packet_field(consult_ani, PK_LEN_ANI);
    var p_ucid          = get_packet_field(consult_ucid,PK_LEN_UCID);
    var p_inbound_data  = get_packet_field(inbound_data,PK_LEN_INBOUND_DATA);
    var p_consult_data  = get_packet_field(consult_data,PK_LEN_CONSULT_DATA);
    
    var consult_packet  = PACKET_KEY_AGT_SERVICE +
                          PACKET_LENGTH_AGT_CONSULT + 
                          p_result_code +
                          p_svc_key +
                          p_svc_code +
                          "m" + p_time +
                          "s" + p_station +
                          "a" + p_agentid +
                          "e" + p_extra +
                          "u" + p_status +
                          p_reserved +
                          p_dest +
                          "A" + p_ani +
                          p_ucid +
                          p_inbound_data +
                          p_consult_data;
                          
    return consult_packet;           
}


//==============================================================================
//  get_password_packet
//==============================================================================
function get_password_packet(p_svc_key, p_svc_code, station, agentid, group, pw_control, pw_data)
{
    var p_result_code   = get_packet_field("",          PK_LEN_RESULT_CODE);
    var p_time          = get_packet_time();
    var p_station       = get_packet_field(station,     PK_LEN_STATION);
    var p_agentid       = get_packet_field(agentid,     PK_LEN_AGENTID);
    var p_extra         = get_packet_field(group,       PK_LEN_EXTRA);           // Group
    var p_status        = get_packet_field(pw_control,  PK_LEN_STATUS);             // Password Control
    var p_reserved      = get_packet_field("",          PK_LEN_RES_COMMON);
    
    // PW Data
    var p_pw_data       = get_packet_field(pw_data,     PK_LEN_PW_DATA);

    var password_packet = PACKET_KEY_AGT_SERVICE +
                          PACKET_LENGTH_AGT_PASSWORD + 
                          p_result_code +
                          p_svc_key +
                          p_svc_code +
                          "m" + p_time +
                          "s" + p_station +
                          "a" + p_agentid +
                          "e" + p_extra +
                          "u" + p_status +
                          p_reserved +
                          p_pw_data;
                    
    return password_packet;           
}


