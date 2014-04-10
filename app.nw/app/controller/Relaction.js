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
    relations_begin:function(title,params,resultpanel,type){

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
            Ext.each(res.relations,function(item){
                relactions.push(item.toFixed(2));
            });
            //me.appedtext("样本站台:"+res.sstation,resultpanel,true);
            //me.appedtext("事件站台:"+res.rstation,resultpanel);
            //me.appedtext("相关性:"+relactions,resultpanel,true);
            me.appedtext("最大值:"+Ext.max(Ext.Array.map(relactions,function(str,index,array){ //根据返回值组成数组
                return Math.abs(str);
            })),resultpanel,true);
            me.appedtext("\n",resultpanel,true);
            me.caculate= me.caculate+1;

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
    relation_begin:function(btn){

        var me=this;
        var form =btn.up('form');
        var params={};
        var url="realstream/toolconfig";
        var resultpanel=form.up('panel').down('#status-results');
        resultpanel.setValue("");
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
                                       for(var i=0;i<action.result.msg.stations.length;i++){
                                           var station=action.result.msg.stations[i];

                                           var item={};
                                           item.sstation=station;
                                           item.rstation=station;
                                           item.stime=action.result.msg.stime;
                                           item.rtime=action.result.msg.rtime;
                                           item.second=action.result.msg.second;
                                           item.move=action.result.msg.move;
                                           me.relations_begin('开始相关分析'+station+"/BHZ",item,resultpanel,"/BHZ");
                                           me.relations_begin('开始相关分析'+station+"/BHN",item,resultpanel,"/BHN");
                                           me.relations_begin('开始相关分析'+station+"/BHE",item,resultpanel,"/BHE");
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
