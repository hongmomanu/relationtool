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
            layout: 'anchor',
            defaults: {
                labelAlign: 'top',
                anchor: '100%'
            },

            // The fields

            items:[
                {
                    xtype:'form',
                    defaultType: 'textfield',
                    defaults: {
                        border: false,
                        flex:1,
                        layout: 'anchor'
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
                            anchor: '100%',
                            height:"100%",
                            value:'/home/jack/soft/lumprj/sample.config',
                            allowBlank: false
                        }
                    ],
                    buttons:[
                        {
                            text:'相关分析',
                            action:'relation_begin'
                        }
                    ]
                },
                {
                    //xtype:'htmleditor',
                    xtype:'textarea',
                    grow:false,
                    enableFont : false,
                    enableLinks:false,
                    enableFormat :false,
                    enableFontSize :false,
                    enableColors :false,
                    enableAlignments  :false,
                    shrinkWrap:3,
                    enableLists   :false,
                    enableSourceEdit    :false,
                    minHeight:500,
                    autoHeight: "auto",
                    autoWidth: "auto",
                    itemId:'status-results',
                    anchor: '100%',

                    fieldLabel: '相关运行状态'

                }


            ]
        });
        me.callParent(arguments);
    }
});