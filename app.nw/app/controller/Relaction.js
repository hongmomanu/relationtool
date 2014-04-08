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
           }

        });

    },
    appedtext:function(text,resultpanel,isoneline){
        if(!isoneline)resultpanel.setValue(resultpanel.getValue()+'->'+text+"\n");
        else resultpanel.setValue(resultpanel.getValue()+text);

    },
    appedhtml:function(html,content,resultpanel,allhtml){
        html.append(content);
        resultpanel.setValue('<div>'+allhtml.html()+'</div>');
    },
    importdata_begin:function(title,filepath,resultpanel,callback){
        var params={
            paths:filepath
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
            me.appedtext("样本站台:"+res.sstation,resultpanel);
            me.appedtext("事件站台:"+res.rstation,resultpanel);
            me.appedtext("相关性:"+relactions,resultpanel);
            me.appedtext("最大值:"+Ext.max(relactions),resultpanel);

        };
        var failFunc = function (form, action) {
            Ext.TaskManager.stop(task);
            me.appedtext("\n",resultpanel,true);
            me.appedtext(title+'失败',resultpanel);
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
        var successFunc = function (forms, action) {
            me.appedtext('数据配置文件加载成功',resultpanel);
            var files_str=[];
            for(var i=0;i<action.result.msg.earthquicks.length;i++){
                files_str.push(action.result.msg.earthquicks[i].data);
            }

            function relationcallback(){
                for(var i=0;i<action.result.msg.earthquicks.length;i++){
                    Ext.each(action.result.msg.earthquicks[i].stations,function(item){
                       me.relations_begin('开始相关分析'+item.sstation+"/BHZ",item,resultpanel,"/BHZ");
                       me.relations_begin('开始相关分析'+item.sstation+"/BHN",item,resultpanel,"/BHN");
                       me.relations_begin('开始相关分析'+item.sstation+"/BHE",item,resultpanel,"/BHE");
                    });
                }
            }
            //relationcallback();
            function datacallback(){
                me.importdata_begin("开始导入地震数据",files_str.join(","),resultpanel,relationcallback);
            }
            me.importdata_begin("开始导入样本数据",action.result.msg.samples,resultpanel,datacallback);

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
