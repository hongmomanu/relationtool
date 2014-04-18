/**
 * Created with IntelliJ IDEA.
 * User: jack
 * Date: 13-12-17
 * Time: 下午3:05
 * To change this template use File | Settings | File Templates.
 */
Ext.define('RelationTool.controller.Relaction', {
    extend: 'Ext.app.Controller',
    views: [
         'relaction.MainPanel'
    ],
    models: [

    ],
    stores: [

    ],

    init: function() {
        Ext.Ajax.timeout=3600000;
        this.control({
           'mainpanel button[action=relation_begin]':{
               click: this.relation_begin
           },
            'mainpanel':{
                afterlayout: this.layoutfunc

            }

        });

    },
    layoutfunc:function(panel){
        var textarea=panel.down('#status-results');
        textarea.setHeight(panel.getHeight()-160);
        $('#chart_div').height(panel.getHeight()-160);

    },
    appedtext:function(text,resultpanel,isoneline){
        if(!isoneline)resultpanel.setValue(resultpanel.getValue()+'->'+text+"\n");
        else resultpanel.setValue(resultpanel.getValue()+text);

        resultpanel.selectText(resultpanel.getValue().length-1,resultpanel.getValue().length);
        resultpanel.getEl().down('textarea').dom.scrollTop=99999;

    },
    appedhtml:function(html,content,resultpanel,allhtml){
        html.append(content);
        resultpanel.setValue('<div>'+allhtml.html()+'</div>');

    },
    importdata_begin:function(title,filepath,resultpanel,callback,type){
        var params={
            paths:filepath,
            type:type
        };
        var me=this;
        me.appedtext(title,resultpanel);
        var task={
         run: function(){
             me.appedtext(".",resultpanel,true)
         },
         interval: 500
         }
         Ext.TaskManager.start(task);
        var successFunc = function (response, action) {
            Ext.TaskManager.stop(task);
            me.appedtext("\n",resultpanel,true);
            me.appedtext(title+'成功',resultpanel);
            if(callback)callback();

        };
        var failFunc = function (form, action) {
            Ext.TaskManager.stop(task);
            me.appedtext("\n",resultpanel,true);
            me.appedtext(title+'失败',resultpanel);
        };
        CommonFunc.ajaxSend(params,'realstream/makesamplescache',successFunc,failFunc,'GET');


    },
    relations_begin:function(title,params,resultpanel,type,totalname){

        var me=this;
        me.appedtext(title,resultpanel);
        var task={
            run: function(){
                me.appedtext(".",resultpanel,true)
            },
            interval: 500
        }
        Ext.TaskManager.start(task);
        var successFunc = function (response, action) {

            Ext.TaskManager.stop(task);

            me.appedtext("\n",resultpanel,true);
            me.appedtext(title+'成功',resultpanel);
            var res=Ext.JSON.decode(response.responseText);
            var relactions=[];
            var rtime=res.rtime;
            var stime=res.stime;

            Ext.each(res.relations,function(item){
                relactions.push(item.toFixed(2));
            });
            //me.appedtext("样本站台:"+res.sstation,resultpanel,true);
            //me.appedtext("事件站台:"+res.rstation,resultpanel);
            //me.appedtext("相关性:"+relactions,resultpanel,true);
            var max_index=0;
            var max_data=0;


            for(var i=0;i<relactions.length;i++){
                var item_data=Math.abs(relactions[i]);
                if(item_data>max_data){
                    max_data=item_data;
                    max_index=i;
                }
            }

            me.appedtext("最大值:"+max_data,resultpanel,true);
            me.appedtext("\n",resultpanel,true);
            function call_back(){
                me.caculate= me.caculate+1;
            }
            //rtime= Ext.Date.add(new Date(rtime),Ext.Date.HOUR,8);
            //stime= Ext.Date.add(new Date(stime),Ext.Date.HOUR,8);
            params.rtime=rtime;
            params.stime=stime;
            me.make_chart(1,params.rtime,params.second,
                params.rstation+type,max_index,totalname,call_back,params.stime,relactions,res.rate);



        };
        var failFunc = function (form, action) {
            Ext.TaskManager.stop(task);
            me.appedtext("\n",resultpanel,true);
            me.appedtext(title+'失败',resultpanel);
            me.caculate= me.caculate+1;
        };

        var param={};
        for (var item in params){
            param[item]=params[item];
        }
        param.rstation=param.rstation+type;
        param.sstation=param.sstation+type;
        CommonFunc.ajaxSend(param,'realstream/realstreamrelations',successFunc,failFunc,'GET');


    },
    make_chart:function(type,time,second,station,max_index,chartname,callback,timesample,relactions,rate){
        var me=this;
        var params={};
        //time=time.replace("T"," ");
        if(type==0){
            params.time=time;

        }else{
            var a= Ext.Date.add(new Date(time),Ext.Date.MILLI,max_index*Math.abs(rate));
            params.time=Ext.util.Format.date(a,'Y-m-d H:i:s.u');
            params.timesample=Ext.util.Format.date(timesample,'Y-m-d H:i:s.u');
        }
        params.second=second;
        params.type=type;
        params.station=station;

        var successFunc = function (response, action) {
            var data=Ext.JSON.decode(response.responseText).result;
            var datasample=Ext.JSON.decode(response.responseText).result1;
            var maxdata=Ext.max(Ext.Array.map(data,function(item){
                return Math.abs(item);
            }));
            var maxsampledata=Ext.max(Ext.Array.map(datasample,function(item){
                return Math.abs(item);
            }));

            var res = [];
            var ressample=[];
            var resrelactions=[];


            for (var i = 0; i < data.length; i++) {
                res.push([i, data[i]/maxdata]);
                ressample.push([i,datasample[i]/maxsampledata]);
            }
            for(var i=0;i<relactions.length;i++){
                resrelactions.push([i,relactions[i]]);

            }

            var id=chartname+"chart"+station.replace("/","-");
            var idrelactions=id+"relactions";
            $('#chart_div').append('<div id="'+id+'" style="height: 120px;"></div>');
            $('#chart_div').append('<div id="'+idrelactions+'" style="height: 120px;"></div>');
            var plot = $.plot("#"+id, [
                { label:chartname+station, data: res, color: 'green' },
                { label:'样本数据：'+station, data: ressample, color: 'red' }
            ], {
                series: {
                    shadowSize: 0
                },
                yaxis: {
                },
                xaxis: {
                    show: false
                }
            });
            var plot_relation = $.plot("#"+idrelactions, [
                { label:'滑动相关性：'+station, data: resrelactions, color: 'blue' }
            ], {
                series: {
                    shadowSize: 0
                },
                yaxis: {
                },
                xaxis: {
                    show: true
                }
            });
            if(callback)callback();


        };
        var failFunc = function (form, action) {

        };
        CommonFunc.ajaxSend(params,'realstream/samplescachedetail',successFunc,failFunc,'GET');


    },
    relation_begin:function(btn){

        var me=this;
        var form =btn.up('form');
        var params={};
        var url="realstream/toolconfig";
        var resultpanel=form.up('panel').down('#status-results');
        resultpanel.setValue("");
        $('#chart_div').html('');
        localStorage.filepath=form.getValues().filename;
        var successFunc = function (forms, action) {
            me.appedtext('数据配置文件加载成功',resultpanel);
            var files_str=[];
            for(var i=0;i<action.result.msg.earthquicks.length;i++){
                files_str.push(action.result.msg.earthquicks[i].data);
            }

            /*function relationcallback(){

                for(var i=0;i<action.result.msg.earthquicks.length;i++){
                    Ext.each(action.result.msg.earthquicks[i].stations,function(item){
                       me.relations_begin('开始相关分析'+item.sstation+"/BHZ",item,resultpanel,"/BHZ");
                       me.relations_begin('开始相关分析'+item.sstation+"/BHN",item,resultpanel,"/BHN");
                       me.relations_begin('开始相关分析'+item.sstation+"/BHE",item,resultpanel,"/BHE");
                    });
                }
            }*/

            //relationcallback();
            function datacallback(){
               /* for(var n=0;n<action.result.msg.stations.length;n++){
                    me.make_chart(0,action.result.msg.stime,action.result.msg.second,
                        action.result.msg.stations[n].name+"/"+action.result.msg.stations[n].type+"HZ",0,"样本数据");
                    me.make_chart(0,action.result.msg.stime,action.result.msg.second,
                        action.result.msg.stations[n].name+"/"+action.result.msg.stations[n].type+"HE",0,"样本数据");
                    me.make_chart(0,action.result.msg.stime,action.result.msg.second,
                        action.result.msg.stations[n].name+"/"+action.result.msg.stations[n].type+"HN",0,"样本数据");
                }*/

                me.caculate=0;
                me.earthindex=0;
                var task={
                    run: function(){
                        //console.log(me.caculate);
                        if(me.caculate==(action.result.msg.stations.length*3)&&me.earthindex==files_str.length){
                            Ext.TaskManager.stop(task);

                            me.appedtext("恭喜,数据相关分析完成！",resultpanel);
                            Ext.Msg.alert("成功提示", "恭喜,数据相关分析完成!");

                        }

                        if((me.caculate==(action.result.msg.stations.length*3)||me.earthindex==0)
                            &&me.earthindex<files_str.length){
                            me.caculate=0;
                            //console.log("earthindex"+me.earthindex);

                            me.importdata_begin("开始导入地震数据"+action.result.msg.earthquicks[me.earthindex].name,files_str[me.earthindex],resultpanel,
                                (function(index){
                                   return  function a(){
                                       var timespan={};
                                       for(var i=0;i<action.result.msg.stations.length;i++){
                                           timespan[action.result.msg.stations[i].name]=(new Date(action.result.msg.stations[i].stime)).getTime();
                                       }

                                       for(var i=0;i<action.result.msg.stations.length;i++){
                                           var station=action.result.msg.stations[i].name;
                                           var station_type=action.result.msg.stations[i].type;
                                           var stime=action.result.msg.stations[i].stime;
                                           var second=action.result.msg.stations[i].second;
                                           var rtime_p=action.result.msg.earthquicks[index].rtime;
                                           var station_p=action.result.msg.earthquicks[index].station;

                                           var rtime=station_p==station?rtime_p:
                                               Ext.util.Format.date(Ext.Date.add((new Date (rtime_p)),Ext.Date.MILLI,
                                                   (timespan[station]-timespan[station_p])),'Y-m-d H:i:s.u')

                                           var item={};
                                           item.sstation=station;
                                           item.rstation=station;
                                           //item.stime=action.result.msg.stime;
                                           //item.rtime=action.result.msg.rtime;
                                           //item.second=action.result.msg.second;
                                           item.stime=stime;
                                           item.rtime=rtime;
                                           item.second=second;
                                           item.move=action.result.msg.move;

                                           me.relations_begin('开始相关分析'+station+"/"+station_type+"HZ",item,
                                               resultpanel,"/"+station_type+"HZ",action.result.msg.earthquicks[index].name);
                                           me.relations_begin('开始相关分析'+station+"/"+station_type+"HN",item,
                                               resultpanel,"/"+station_type+"HN",action.result.msg.earthquicks[index].name);
                                           me.relations_begin('开始相关分析'+station+"/"+station_type+"HE",item,
                                               resultpanel,"/"+station_type+"HE",action.result.msg.earthquicks[index].name);
                                       }

                                    }

                                })(me.earthindex),1);
                            me.earthindex=me.earthindex+1;
                        }
                    },
                    interval: 500
                }
                Ext.TaskManager.start(task);
                //me.importdata_begin("开始导入地震数据",files_str[0],resultpanel,relationcallback,1);
                //me.importdata_begin("开始导入地震数据",files_str.join(","),resultpanel,relationcallback,1);


            }
            me.importdata_begin("开始导入样本数据",action.result.msg.samples,resultpanel,datacallback,0);

        };

        var failFunc = function (forms, action) {
            if(action.response.status==200){
                Ext.Msg.alert("加载配置文件成功", action.result.msg);
            }else{
                Ext.Msg.alert("加载配置文件失败", "找不到服务");
            }


        };
        CommonFunc.formSubmit(form, params, url, successFunc, failFunc,"",null);


    }


});
