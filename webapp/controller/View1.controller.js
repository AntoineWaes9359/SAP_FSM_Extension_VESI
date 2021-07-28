sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/coresystems/fsm-shell"
], function (Controller) {
	"use strict";

	return Controller.extend("testTree.testTree.controller.View1", {
		onInit: function () {
			const oView = this.getView();
			 const { ShellSdk, SHELL_EVENTS } = FSMShell;

	        const shellSdk = ShellSdk.init(parent, '*');
	
	        shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, {
	            clientIdentifier: 'fsm-demo-plugin',
	        });
	        
	        shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, (event) => {
	            const {
	            	cloudHost,
	                account,
	                accountId,
	                company,
	                companyId,
	                user,
	                userId,
	                selectedLocale,
	            } = JSON.parse(event);
	
	           /* oView.byId("account").setTitle(account);
	            oView.byId("accountID").setTitle(accountId);
	            oView.byId("company").setTitle(company);
	            oView.byId("companyID").setTitle(companyId);
	            oView.byId("user").setTitle(user);
	            oView.byId("userID").setTitle(userId);
	            oView.byId("selLocale").setTitle(selectedLocale);*/
	            
	            this._getEqData(cloudHost);
	        });
		},
		
		_getEqData: function(sCloudHost){
			//const queryFitter = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}";
	        const querySite = "{\"query\": \"SELECT eq.name AS 'Name', eq.type AS 'Type', eq.id as 'UUID' FROM Equipment eq WHERE eq.type = 'Site'\"}";
	        //var sQuery = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}"
	        
	        fetch(`https://${cloudHost}/api/query/v1?dtos=ReservedMaterial.19;Item.21;Warehouse.15;Material.21;Activity.37;ServiceCall.26&account=${account}&company=${company}`, {
	          headers,
	          method: "POST",
	          body: querySite
	        })
	        .then(response => response.json())
            .then(function (json) {
            	console.log(json);
            })
		} 
	});
});