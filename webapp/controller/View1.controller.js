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
				var oInitFunction = {
					property: initializeRefreshTokenStrategy
				};

				oInitFunction['property'](shellSdk, auth);

				this._getEqData(cloudHost, account, company);

			});
		},
		onSelectEq: function (oEvent) {
			const {
				ShellSdk,
				SHELL_EVENTS
			} = FSMShell;
			var oTreeTable = this.byId("equipTable");
			var iIndex = oTreeTable.getSelectedIndices()[0];
			var sEqID = oTreeTable.getRows()[iIndex].getBindingContext("eqModel").getObject().id;
			console.log(sEqID)
				// Init ShellSDk
			const shellSdk = ShellSdk.init(window.parent, '*');
			shellSdk.emit(SHELL_EVENTS.Version1.TO_APP, {
				id: 'addEquipmentId',
				payload: {
					id: sEqID
				}
			});
		},

		_getStructureOfEquip: function (json) {
			// structure org Site-Batiment-Etage-Local-Equipement
			//var oEquipmentNonSortedModel = new JSONModel();
			// oEquipmentNonSortedModel.loadData("test/mockdata/SiteEquipment.json").then(function () {
			var aSites, aBatiments, aEtages, aLocaux, aEquipments, aSitesStruct, aBatimentsStruct, aEtagesStruct, aLocauxStruct,
				aEquipmentsStruct, aAllEquipments;
			if (json.data.length > 0) {
				aSites = json.data.filter(function (oEq) {
					return oEq.eq.type === "Site";
				});
				//test
				console.log(aSites);
				aBatiments = json.data.filter(function (oEq) {
					return oEq.eq.type === "Batiment";
				});
				//test
				console.log(aBatiments);
				aEtages = json.data.filter(function (oEq) {
					return oEq.eq.type === "Etage";
				});
				//test
				console.log(aEtages);
				aLocaux = json.data.filter(function (oEq) {
					return oEq.eq.type === "Local";
				});
				//test
				console.log(aLocaux);
				aEquipments = json.data.filter(function (oEq) {
					return oEq.eq.type === "Equipement";
				});
			}
			//formatter the array by removing 'eq' before searching the children
			if (aSites.length > 0) {
				aSitesStruct = aSites.map(function (oSite) {
					return oSite.eq;
				});
			}
			console.log(aSitesStruct);
			if (aBatiments.length > 0) {
				aBatimentsStruct = aBatiments.map(function (oBat) {
					return oBat.eq;
				});
			}
			console.log(aBatimentsStruct);
			if (aEtages.length > 0) {
				aEtagesStruct = aEtages.map(function (oEtage) {
					return oEtage.eq;
				});
			}
			console.log(aEtagesStruct);
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
			aAllEquipments = {
				"equipments": aSitesStruct
			};
			var oSiteEquipment = new JSONModel();
			if (this.getView().getModel("eqModel")) {
				this.getView().getModel("eqModel").setData(aAllEquipments);
			} else {
				oSiteEquipment.setData(aAllEquipments);
				this.getView().setModel(oSiteEquipment, "eqModel");
			}
			// }.bind(this));
		},

		_getEqData: function (sCloudHost, sAccount, sCompany) {

			const headers = {
				'Content-Type': 'application/json',
				'X-Client-ID': 'fsm-extension-sample',
				'X-Client-Version': '1.0.0',
				'Authorization': `bearer ${sessionStorage.getItem('token')}`,
			};
		
			const querySite =
				"{\"query\": \"select eq.id, eq.code, eq.name, eq.parentId, eq.type from Equipment eq where eq.type is not null and eq.type in ('Site', 'Batiment', 'Etage', 'Local', 'Equipement') \"}";
			//var sQuery = "{\"query\": \"SELECT it.externalId AS 'externalID', it.name AS 'name' , SUM(mat.quantity) as 'FitterQty' FROM Material mat JOIN Activity ac ON mat.object.objectId=ac.id JOIN ServiceCall sc ON sc.id=ac.object.objectId JOIN Item it ON mat.item = it.id JOIN Person pers ON pers.id = mat.createPerson WHERE sc.id =\'" + scID + "\' AND pers.externalResource = FALSE GROUP BY externalID, name\"}"
			fetch(`https://${sCloudHost}/api/query/v1?dtos=Equipment.22&account=${sAccount}&company=${sCompany}`, {
					headers,
					method: "POST",
					body: querySite
				})
				.then(response => response.json())
				.then(function (json) {
					console.log(json);
					this._getStructureOfEquip(json);
					/*var oViewModel = new JSONModel({
						equipments: json.data,
					});
					this.getView().setModel(oViewModel, "eqModel");*/
				}.bind(this))
		}
	});
});