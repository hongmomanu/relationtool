Ext.define('RelationTool.view.Viewport', {
    extend: 'Ext.container.Viewport',
    alias:'widget.viewport',
    layout: 'fit',

    requires: [
    ],
    listeners: {
        show: function(panel) {
            //this.fireEvent('gridshowfresh',this);
            //alert("fired");
        }
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {

            layout: 'fit',
            items: [
                {
                    xtype: 'mainpanel'

                }
            ]
        });
        me.callParent(arguments);
    }
});