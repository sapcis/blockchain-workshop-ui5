sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, History) {
    "use strict";

    return Controller.extend("sap.ui.demo.basicTemplate.controller.ShipmentList", {

        onInit: function () {
            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");

            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("shipmentList").attachPatternMatched(this._onObjectMatched, this);

        },

        _onObjectMatched: function () {
            this.accessToken = this.getOwnerComponent().getModel("token").getData().accessToken;
            let option = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken,
                    'Content-Type': 'application/json; charset=utf-8'
                },
            };

            let funcChaincode = "/blockchain_service" +
                '/chaincodes/6dcd0e92-e811-4d33-8c3f-234aaf65d8d5-demo-perishable-net/latest/shipments';

            fetch(funcChaincode, option)
                .then(response => response.json())
                .then(json => {
                    const oShipmentModel = new JSONModel(json);
                    sap.ui.getCore().setModel(oShipmentModel);
                    this.getView().setModel(oShipmentModel, "shipment");
                })
                .catch(err => {
                    const msgError = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("errorListPage");
                    MessageBox.error(msgError);
                    console.error(err.message);
                });

        },

        onFilterShipments: function (oEvent) {

            const aFilter = [];
            const sQuery = oEvent.getParameter("query");
            if (sQuery) {
                aFilter.push(new Filter("Product", FilterOperator.Contains, sQuery));
            }

            const oList = this.byId("shipmentList");
            const oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
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

        onShipmentDetailsPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("shipmentDetails", {
                id: oItem.getBindingContext("shipment").getPath().substr(1)
            });
        },

        changeStatusPress: function (oEvent) {
            // добавьте фрагмент Popover на View и откройте его
            if (!this._oPopover) {
                this._oPopover = new sap.ui.xmlfragment("sap.ui.demo.basicTemplate.fragment.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            // delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopover.openBy(oButton);
            });

        },

        sendStatus: function (Event) {
            // считать статус, который = тексту кнопки
            // проверить,  была ли выбрана запись в таблице
            // если да, то необходимо достать id поставки из строки (используя метод getSelectedContexts()[0].getPath() у m.table и getProperty(sPath) у json модели)
            // запросить подтверждение действия с помощью MessageBox
            // если ОК - отправить запрос на изменение статуса -> вызов функции sendStatusRequest
            let that = this;
            let sStatus = Event.getSource().getText();
            let sRow = this.getView().byId("shipmentList").getSelectedItem();
            if (sRow === null) {
                MessageBox.error("Пожалуйста, выберите запись");
            } else {
                debugger;
                let sPath = this.getView().byId("shipmentList").getSelectedContexts()[0].getPath();
                let oShipment = this.getView().getModel("shipment").getProperty(sPath);
                let shipmentId = oShipment.ID;
                MessageBox.warning("Вы уверены, что хотите поменять статус у поставки № " + shipmentId + " на " + sStatus + "?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oEvent) {
                        if (oEvent === MessageBox.Action.OK) {
                            that.getView().setBusy(true);
                            that.sendStatusRequest(shipmentId, sStatus);
                        }
                    }
                });
            }
        },

        sendStatusRequest: function (shipmentId, status) {
            // небходимо сделать запрос PUT в HL сервис, указывая следующие параметры:
            let option = {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    id: shipmentId,
                    newstatus: status
                }),
            };

            let funcChaincode = "/blockchain_service" +
                '/chaincodes/6dcd0e92-e811-4d33-8c3f-234aaf65d8d5-demo-perishable-net/latest/' + shipmentId + '/status/' + status;

            fetch(funcChaincode, option)
                .then(response => {
                    this.getView().setBusy(false);
                    this._onObjectMatched();
                })
                .catch(err => {
                    this.getView().setBusy(false);
                    const msgError = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("errorListPage");
                    MessageBox.error(msgError);
                    console.error(err.message);
                });
        }

    });
});