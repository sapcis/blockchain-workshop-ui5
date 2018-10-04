sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, History, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.demo.basicTemplate.controller.ShipmentNew", {

        onInit: function () {
            let oModel = new JSONModel("mockdata/NewShipment.json");
            this.getView().setModel(oModel);
            this.getView().bindElement("/");

            this.accessToken = this.getOwnerComponent().getModel("token").getData().accessToken;
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("overview", {}, true);
            }
        },

        onShipmentNewPress: function () {
            let oModel = this.getView().getModel();

            let option = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.accessToken,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: oModel.getJSON()
            };

            let funcChaincode = "/blockchain_service" +
                '/chaincodes/6dcd0e92-e811-4d33-8c3f-234aaf65d8d5-demo-perishable-net/latest/' + oModel.getProperty('/id');

            sap.ui.core.BusyIndicator.show();
            fetch(funcChaincode, option)
                .then(response => {
                    const msgSuccess = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("successNewPage");
                    const msgError = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("errorNewPage");
                    (response.status === 201) ? MessageToast.show(msgSuccess) : MessageToast.show(msgError);
                    sap.ui.core.BusyIndicator.hide();
                })
                .catch(err => {
                    sap.ui.core.BusyIndicator.hide();
                    console.error(err.message);
                    MessageBox.error(err.message);
                });
        }
    });
});