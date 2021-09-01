sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"testTree/testTree/model/formatter",
	"sap/ui/core/mvc/Controller",
	"sap/coresystems/fsm-shell"
], function (JSONModel, formatter, Controller) {
	"use strict";

	return Controller.extend("testTree.testTree.controller.View1", {
		formatter: formatter,
		
		onInit: function () {
			/*test mode with mock data */
			this._getStructureOfEquip();
			/*test mode with mock data */
			const oView = this.getView();
			const { ShellSdk, SHELL_EVENTS } = FSMShell;

	        const shellSdk = ShellSdk.init(parent, '*');
			
	        shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, {
	            clientIdentifier: 'fsm-demo-plugin',
			    auth: {
			      response_type: 'token'  // request a user token within the context
			    }
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
	                auth,
	            } = JSON.parse(event);
				
				
	           /* oView.byId("account").setTitle(account);
	            oView.byId("accountID").setTitle(accountId);
	            oView.byId("company").setTitle(company);
	            oView.byId("companyID").setTitle(companyId);
	            oView.byId("user").setTitle(user);
	            oView.byId("userID").setTitle(userId);
	            oView.byId("selLocale").setTitle(selectedLocale);*/
	            
	            //Refresh token
				function initializeRefreshTokenStrategy(shellSdk, auth) {
				  shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, (event) => {
				    sessionStorage.setItem('token', event.access_token);
				    setTimeout(() => fetchToken(), (event.expires_in * 1000) - 5000);
				  });
				  function fetchToken() {
				    shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
				      response_type: 'token' // request a user token within the context
				    });
				  }
				  sessionStorage.setItem('token', auth.access_token);
				  setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
				}
				//this._initializeRefreshTokenStrategy(shellSdk, auth);
				//this.initializeRefreshTokenStrategy(shellSdk, auth)
				var oInitFunction = {
					property : initializeRefreshTokenStrategy
				};
				
				oInitFunction['property'](shellSdk, auth);
				
				
	            this._getEqData(cloudHost, account, company);
	            
	            
	        });
		},
		/*test mode with mock data to get the hierarchy of equipments*/
		_getStructureOfEquip: function(){
			var oSiteEquipment = new JSONModel();
			oSiteEquipment.loadData("test/mockdata/SiteEquipmentSorted.json");
			if(this.getView().getModel("eqModel")){
				this.getView().getModel("eqModel").setData(oSiteEquipment.getData());
			}else{
				this.getView().setModel(oSiteEquipment, "eqModel");
			}
		},
		
		/*_initializeRefreshTokenStrategy: function(shellSdk, auth){
			shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, (event) => {
			    sessionStorage.setItem('token', event.access_token);
			    setTimeout(() => fetchToken(), (event.expires_in * 1000) - 5000);
			  });
			  function fetchToken() {
			    shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
			      response_type: 'token' // request a user token within the context
			    });
			  }
			  sessionStorage.setItem('token', auth.access_token);
			  setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
		},*/
		
		_getEqData: function(sCloudHost, sAccount, sCompany){
			
			
				
			const headers = {
			    'Content-Type': 'application/json',
			    'X-Client-ID': 'fsm-extension-sample',
			    'X-Client-Version': '1.0.0',
			    'Authorization': `bearer ${sessionStorage.getItem('token')}`,
			 };
			//const queryFitter = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}";
	        const querySite = "{\"query\": \"SELECT eq.name AS 'Name', eq.type AS 'Type', eq.id as 'UUID', eq.parentId as 'Parent' FROM Equipment eq WHERE eq.type = 'Site'\"}";
	        //var sQuery = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}"
	        
	        //fetch(`https://${sCloudHost}/api/query/v1?dtos=ReservedMaterial.19;Item.21;Warehouse.15;Material.21;Activity.37;ServiceCall.26&account=${sAccount}&company=${sCompany}`, {
	        fetch(`https://${sCloudHost}/api/query/v1?dtos=Equipment.22&account=${sAccount}&company=${sCompany}`, {
	          headers,
	          method: "POST",
	          body: querySite
	        })
	        .then(response => response.json())
            .then(function (json) {
            	console.log(json);
            	///
            	var oViewModel = new JSONModel({
					equipments: json.data,
				});
				this.getView().setModel(oViewModel, "eqModel");
            }.bind(this))
		} 
	});
});
