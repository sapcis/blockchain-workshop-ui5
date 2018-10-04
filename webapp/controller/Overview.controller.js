sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("sap.ui.demo.basicTemplate.controller.TilePanel", {

        onShipmentListPress: function (oEvent) {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("shipmentList");
        },

        onShipmentNewPress: function (oEvent) {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("shipmentNew");
        },
    });
});