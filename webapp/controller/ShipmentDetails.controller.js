sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function(Controller, History, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.demo.walkthrough.controller.Detail", {

		onInit: function() {
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("shipmentDetails").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function(oEvent) {
			this.accessToken = this.getOwnerComponent().getModel("token").getData().accessToken;
			const sPath = "/" + oEvent.getParameter("arguments").id;
			const _oModel = sap.ui.getCore().getModel();
			this.getView().setModel(_oModel, "shipment");
			this.getView().bindElement({
				path: sPath,
				model: "shipment"
			});

			let option = {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer ' + this.accessToken,
					'Content-Type': 'application/json; charset=utf-8'
				},
			};

			let funcChaincode = "/blockchain_service" +
				'/chaincodes/6dcd0e92-e811-4d33-8c3f-234aaf65d8d5-demo-perishable-net/latest/' +
				this.getView().byId("shipmentId").getText() +
				'/history/temp';

			console.log(funcChaincode);
			fetch(funcChaincode, option)
				.then(response => {
					console.dir(response);
					return response.json();
				})
				.then(json => {
					console.log(json);

					for (var i = 0; i < json.values.length; i++) {
						let _date = new Date(json.values[i].timestamp);
						json.values[i].timestamp = _date;
					}
					const _oLogsModel = new JSONModel(json);
					this.getView().setModel(_oLogsModel, "logs");
				})
				.catch(err => console.error(err.message));
		},

		onNavBack: function() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
		},

		formatStatus: function(type) {
			switch (type) {
				case "created":
					return "None";
				case "in_transit":
					return "Warning";
				case "arrived":
					return "Success";
			}
		},

	});
});