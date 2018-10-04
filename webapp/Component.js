sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, MessageBox, JSONModel) {
    "use strict";

    return UIComponent.extend("sap.ui.demo.basicTemplate.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            let serviceKey = {
                    serviceUrl: 'https://hyperledger-fabric.cfapps.eu10.hana.ondemand.com/api/v1',
                    oAuth: {
                        clientId: 'sb-09a89eaf-5e24-40b4-bef6-7152d1e723d0!b5710|na-420adfc9-f96e-4090-a650-0386988b67e0!b1836',
                        clientSecret: 'TG7u1oIN9yqiFru92vLuNmRFFEI=',
                        url: 'https://i070933trial.authentication.eu10.hana.ondemand.com',
                        identityZone: 'i070933trial'
                    }
                },
                option = {
                    headers: {
                        'Authorization': `Basic ${btoa(serviceKey.oAuth.clientId + ':' + serviceKey.oAuth.clientSecret)}`
                    }
                };

            fetch(serviceKey.oAuth.url + '/oauth/token?grant_type=client_credentials', option)
                .then(response => response.json())
                .then(json => {
                    const accessToken = json.access_token;
                    const serviceUrl = serviceKey.serviceUrl;
                    const oModel = new JSONModel({ accessToken, serviceUrl });
                    this.setModel(oModel, "token");
                })
                .catch( () => {
                    MessageBox.error("Can't get access token");
                });

            this.getRouter().initialize();
        }
    });
});