//##############################################################################
//
//			sp_sdk.js
//
//											Softphone SDK
//                                          for CTIBridge 3.7
//                                          Edit by Lee eon woo
//	
//											Hansol Inticube Co., Ltd.
//											All rights reserved.
//
//##############################################################################





//==============================================================================
//  pause
//==============================================================================
function pause(number_ms) {
    var now = new Date();
    var exit_time = now.getTime() + number_ms;

    while (true) {
        now = new Date();
        if (now.getTime() > exit_time) {
			return;
		}
    }
}

//==============================================================================
//  get_packet_time
//==============================================================================
function get_packet_time()
{
    var d = new Date();

    var s = leading_zeros(d.getFullYear(), 4) +
            leading_zeros(d.getMonth() + 1, 2) +
            leading_zeros(d.getDate(), 2) +
            leading_zeros(d.getHours(), 2) +
            leading_zeros(d.getMinutes(), 2) +
            leading_zeros(d.getSeconds(), 2);

    return s;
}

//==============================================================================
//  get_packet_field
//==============================================================================
function get_packet_field(str_field, len_field)
{
    var diff = len_field - str_field.length;
    var blank = " ";
               
    for(var i=0; i<diff ; i++) {
        str_field = str_field + blank;
    }
    return str_field;
}
 

//==============================================================================
//  leading_zeros
//==============================================================================
function leading_zeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++) {
        	zero += '0';
		}
    }
    return zero + n;
}

//==============================================================================
//  pad
//==============================================================================
function pad(num, len) {
    return ("0" + num).slice(len == undefined ? -2 : -len)
}



//==============================================================================
//  log_time
//==============================================================================
function log_time()
{
	var now = new Date();
	var date_string =	leading_zeros(now.getHours(),2) +
						":" + leading_zeros(now.getMinutes(),2) +
						":" + leading_zeros(now.getSeconds(),2) +
						"." + leading_zeros(now.getMilliseconds(), 3);

    return date_string;						
}
		
				