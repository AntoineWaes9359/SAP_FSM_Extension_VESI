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
			const {
				ShellSdk,
				SHELL_EVENTS
			} = FSMShell;

			const shellSdk = ShellSdk.init(parent, '*');

			shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, {
				clientIdentifier: 'fsm-demo-plugin',
				auth: {
					response_type: 'token' // request a user token within the context
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

				//test with mock data, block comment temporaily
				//Refresh token
				/*function initializeRefreshTokenStrategy(shellSdk, auth) {
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
				}*/
				//this._initializeRefreshTokenStrategy(shellSdk, auth);
				//this.initializeRefreshTokenStrategy(shellSdk, auth)
				/*var oInitFunction = {
					property : initializeRefreshTokenStrategy
				};
				
				oInitFunction['property'](shellSdk, auth);
				
				
	            this._getEqData(cloudHost, account, company);*/
				//test with mock data, block comment temporaily

			});
		},
		
		_getStructureOfEquip: function () {
			//test with algorithm for the structure Site-Batiment-Etage-Local-Equipement
			var oEquipmentNonSortedModel = new JSONModel();
			oEquipmentNonSortedModel.loadData("test/mockdata/SiteEquipment.json").then(function () {
				var aSites, aBatiments, aEtages, aLocaux, aEquipments, aSitesStruct, aBatimentsStruct, aEtagesStruct, aLocauxStruct,
					aEquipmentsStruct, aAllEquipments;
				//2nd algo start (to be completed)
				/*if (oEquipmentNonSortedModel.getData().data.length > 0) {
					var aEquipData = oEquipmentNonSortedModel.getData().data.map(function(oEquip){
						return oEquip.eq;
					})
				}
				var aParentData = aEquipData.filter(function(oEquip){return oEquip.parentId === null; });
				var aChildrenData = aEquipData.filter(function(oEquip){return oEquip.parentId !== null; });*/
				//with fnRecursive
				//2nd algo end
				//1st algo start
				if (oEquipmentNonSortedModel.getData().data.length > 0) {
					aSites = oEquipmentNonSortedModel.getData().data.filter(function (oEq) {
						return oEq.eq.type === "Site";
					});
					aBatiments = oEquipmentNonSortedModel.getData().data.filter(function (oEq) {
						return oEq.eq.type === "Batiment";
					});
					aEtages = oEquipmentNonSortedModel.getData().data.filter(function (oEq) {
						return oEq.eq.type === "Etage";
					});
					aLocaux = oEquipmentNonSortedModel.getData().data.filter(function (oEq) {
						return oEq.eq.type === "Local";
					});
					aEquipments = oEquipmentNonSortedModel.getData().data.filter(function (oEq) {
						return oEq.eq.type === "Equipement";
					});
				}
				//formatter the array by removing 'eq' before searching the children
				if (aSites.length > 0) {
					aSitesStruct = aSites.map(function (oSite) {
						return oSite.eq;
					});
				}
				if (aBatiments.length > 0) {
					aBatimentsStruct = aBatiments.map(function (oBat) {
						return oBat.eq;
					});
				}
				if (aEtages.length > 0) {
					aEtagesStruct = aEtages.map(function (oEtage) {
						return oEtage.eq;
					});
				}
				if (aLocaux.length > 0) {
					aLocauxStruct = aLocaux.map(function (oLocal) {
						return oLocal.eq;
					});
				}
				if (aEquipments.length > 0) {
					aEquipmentsStruct = aEquipments.map(function (oEq) {
						return oEq.eq;
					});
				}

				if (aSitesStruct.length > 0 && aBatimentsStruct.length > 0) {
					aSitesStruct.forEach(function (oSite) {
						oSite.children = [];
						var aChildrenBatiment = aBatimentsStruct.filter(function (oBatiment) {
							return oBatiment.parentId === oSite.id;
						});
						oSite.children = aChildrenBatiment;
					});
				}
				if (aSitesStruct.length > 0 && aBatimentsStruct.length > 0 && aEtagesStruct.length > 0) {
					aSitesStruct.forEach(function (oSite) {
						if (oSite.children && oSite.children.length > 0) {
							oSite.children.forEach(function (oBatiment) {
								oBatiment.children = [];
								var aChildrenEtages = aEtagesStruct.filter(function (oEtage) {
									return oEtage.parentId === oBatiment.id;
								});
								oBatiment.children = aChildrenEtages;
							});
						}
					});
				}
				if (aSitesStruct.length > 0 && aBatimentsStruct.length > 0 && aEtagesStruct.length > 0 && aLocauxStruct.length > 0) {
					aSitesStruct.forEach(function (oSite) {
						if (oSite.children && oSite.children.length > 0) {
							oSite.children.forEach(function (oBatiment) {
								if (oBatiment.children && oBatiment.children.length > 0) {
									oBatiment.children.forEach(function (oEtage) {
										oEtage.children = [];
										var aChildrenLocaux = aLocauxStruct.filter(function (oLocal) {
											return oLocal.parentId === oEtage.id;
										});
										oEtage.children = aChildrenLocaux;
									});
								}
							});
						}
					});
				}
				if (aSitesStruct.length > 0 && aBatimentsStruct.length > 0 && aEtagesStruct.length > 0 && aLocauxStruct.length > 0 &&
					aEquipmentsStruct.length > 0) {
					aSitesStruct.forEach(function (oSite) {
						if (oSite.children && oSite.children.length > 0) {
							oSite.children.forEach(function (oBatiment) {
								if (oBatiment.children && oBatiment.children.length > 0) {
									oBatiment.children.forEach(function (oEtage) {
										if (oEtage.children && oEtage.children.length > 0) {
											oEtage.children.forEach(function (oLocal) {
												oLocal.children = [];
												var aChildrenEquip = aEquipmentsStruct.filter(function (oEquip) {
													return oEquip.parentId === oLocal.id;
												});
												oLocal.children = aChildrenEquip;
											});
										}
									});
								}
							});
						}
					});
				} 
				//1st algo end
				aAllEquipments = {
					"equipments": aSitesStruct
				};
				//before the data binding with json model, we'll need all the types of equipments
				var oSiteEquipment = new JSONModel();
				if (this.getView().getModel("eqModel")) {
					this.getView().getModel("eqModel").setData(aAllEquipments);
				} else {
					oSiteEquipment.setData(aAllEquipments);
					this.getView().setModel(oSiteEquipment, "eqModel");
				}
			}.bind(this));
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

		_getEqData: function (sCloudHost, sAccount, sCompany) {

			const headers = {
				'Content-Type': 'application/json',
				'X-Client-ID': 'fsm-extension-sample',
				'X-Client-Version': '1.0.0',
				'Authorization': `bearer ${sessionStorage.getItem('token')}`,
			};
			//const queryFitter = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}";
			const querySite =
				"{\"query\": \"SELECT eq.name AS 'Name', eq.type AS 'Type', eq.id as 'UUID', eq.parentId as 'Parent' FROM Equipment eq WHERE eq.type = 'Site'\"}";
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