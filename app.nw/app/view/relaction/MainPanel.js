Ext.define('RelationTool.view.relaction.MainPanel', {
    extend: 'Ext.panel.Panel',
    alias:'widget.mainpanel',
    layout: 'fit',

    requires: [
    ],

    initComponent: function() {
        var me = this;
        //alert(1);
        Ext.apply(me, {
            title: '数据相关测试',
            bodyPadding: 15,
            layout: 'fit',
            defaults: {
                labelAlign: 'top'
            },

            // The fields

            items:[
                {
                    xtype:'form',
                    defaultType: 'textfield',
                    //height:100,
                    //layout:'fit',
                    defaults: {
                        border: false,
                        flex:1,
                        layout: 'fit'
                    },
                    buttonAlign : 'center',
                    bodyStyle: 'padding:5px 5px 0',
                    fieldDefaults: {

                        msgTarget: 'side'
                    },
                    items:[
                        {
                            fieldLabel: '配置文件地址',
                            name: 'filename',
                            height:40,
                            anchor: '100%',
                            value:localStorage.filepath?localStorage.filepath:'/home/jack/soft/lumprj/sample.config',
                            allowBlank: false
                        },
                        {
                            xtype:'textarea',
                            grow:false,
                            autoScroll:true,
                            itemId:'status-results',
                            anchor: '100%',
                            fieldLabel: '相关运行状态'

                        }
                    ],
                    buttons:[
                        {
                            text:'相关分析',
                            action:'relation_begin'
                        }
                    ]
                }



            ]
        });
        me.callParent(arguments);
    }
});