Ext.Loader.setPath({
    
    'Ext.ux':'extjs4.2.1/ux',
   
});



Ext.application({
    
    name: 'RelationTool',

    appFolder: 'app',

    controllers: [
        'Relaction'
    ],
    autoCreateViewport: true,
    launch: function() {



    }
});