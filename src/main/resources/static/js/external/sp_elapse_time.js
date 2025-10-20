//##############################################################################
//
//			sp_elapse_time.js
//
//											Web Worker for Elapse Time
//                                          for CTIBridge 3.7
//                                          Edit by Lee eon woo
//	
//											Hansol Inticube Co., Ltd.
//											All rights reserved.
//
//##############################################################################


var start_time_ = new Date();


//==============================================================================
//  onmessage
//============================================================================== 
onmessage = function(e) {
    var data = e.data;
    switch (data.command) {
        case "elapse_start":
        {
            start_time_   = new Date();
            break
        }
            
        case "elapse_stop":
        {
            break
        }
        
        default:
            logDisplay(3, "unknown command: " + data.command);
            break
    }
};


//==============================================================================
//  get_elapsed_time
//============================================================================== 
/*function get_elapsed_time()
{
    var cur_time        = new Date();
//console.log("cur_time:"+cur_time+" , start_time:"+start_time_);    
    var elapse_sec      = parseInt((cur_time.getTime() - start_time_)/1000);
        
    var elapse_min      = parseInt(elapse_sec / 60);  
    var num_hour        = parseInt(elapse_min / 60); 
    var num_min         = elapse_min % 60; 
    var num_sec         = elapse_sec % 60; 

    var time_format     = ( (num_hour < 10) ? "0" : "" ) + num_hour + ":" + ( (num_min < 10) ? "0" : "" ) + num_min + ":" + ( (num_sec < 10) ? "0" : "" ) + num_sec; 
   // var time_format     =  elapse_sec;
    postMessage({
        message : 'elapse_time',
        data    : time_format
    });
 }*/
 
 //setInterval(get_elapsed_time, 1000);