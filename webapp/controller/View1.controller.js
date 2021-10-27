sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"testTree/testTree/model/formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/coresystems/fsm-shell"
], function (JSONModel, formatter, Controller, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("testTree.testTree.controller.View1", {
		formatter: formatter,

		onInit: function () {
			this._getStructureOfEquipMockData();
			const oView = this.getView();
			this.sEquipID = "";
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
		onSelectEq: function () {
			if (this.sEquipID.length !== 0) {
				var sEqID = this.sEquipID;
				const {
					ShellSdk,
					SHELL_EVENTS
				} = FSMShell;
				const shellSdk = ShellSdk.init(window.parent, '*');
				shellSdk.emit(SHELL_EVENTS.Version1.TO_APP, {
					id: 'addEquipmentId',
					payload: {
						id: sEqID
					}
				});
			}
		},
		onSelectOneSite: function (oEvt) {
			var aIndices, iRow, sPath, oSelected, sEquipID;
			aIndices = oEvt.getParameter("rowIndices");
			iRow = aIndices.length === 1 ? aIndices[0] : aIndices[1];
			sPath = this.byId("equipTable").getContextByIndex(iRow).sPath;
			oSelected = this.getView().getModel("eqModel").getProperty(sPath);
			this.setEquipID(oSelected.id);
		},
		onCustomTableFilter: function (oEvent) {
			oEvent.preventDefault();
			const oTable = this.byId("equipTable");
			oTable.getColumns().forEach(function (oEl) {
				oEl.setFiltered(false);
			});
			oEvent.getParameter("column").setFiltered(true);
			//////format full json to add site name to each level
			//var oEqModel = this.getView().getModel("eqModel");
			//var aList = oEqModel.getData().equipments;
			
			
			
			/*this.fnAddParentNameToChildren = function(oParent){
				this.iCurrentIndex = 0;
				if(this.bEnd){
					this.sParentName = "";
					this.bEnd = false; 
				}
				if(oParent && oParent.children && oParent.children.length > 0){
					this.iChildrenNumber = oParent.children.length;
					if(!this.sParentName){
						this.sParentName = ""
					}
					this.sParentName += oParent.name;
					oParent.children.forEach(function(oCurrentChild, index){
						this.iCurrentIndex = index;
						oCurrentChild.nameForFilter = this.sParentName;
						
						this.fnAddParentNameToChildren(oCurrentChild);
					}.bind(this))	
				} else if(!oParent.children && this.iCurrentIndex === this.iChildrenNumber){
					var bEnd = true;	
				}
			};
			
			aList.forEach(function(oCurrentParent){
				this.sParentName = ""
				this.fnAddParentNameToChildren(oCurrentParent);
			}.bind(this));*/
			
			//////
			this._oTableFilterName = new Filter("name"/*oEvent.getParameter("column").getFilterProperty()*/, FilterOperator.Contains, oEvent.getParameter(
				"value"));
			this._oTableFilterNameForFilter = new Filter("nameForFilter"/*oEvent.getParameter("column").getFilterProperty()*/, FilterOperator.Contains, oEvent.getParameter(
				"value"));
			var aFilters = [];
			aFilters.push(this._oTableFilterName);
			aFilters.push(this._oTableFilterNameForFilter);
			
			var oFinalFilter = new Filter({
				filters: aFilters,
				and: false
			});
			
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(oFinalFilter);
		},
		setEquipID: function (sEquipID) {
			this.sEquipID = sEquipID;
		},
		
		_getStructureOfEquipMockData: function(){
			var oSiteEquipment = new JSONModel();
			oSiteEquipment.loadData("test/mockdata/SiteEquipmentSorted.json");
			if(this.getView().getModel("eqModel")){
				this.getView().getModel("eqModel").setData(oSiteEquipment.getData());
			}else{
				this.getView().setModel(oSiteEquipment, "eqModel");
			}
				//test with mock data, block comment temporaily
		},
		
		_getStructureOfEquip: function (json) {
			// structure org Site-Batiment-Etage-Local-Equipement
			var aSites, aBatiments, aEtages, aLocaux, aEquipments, aSitesStruct, aBatimentsStruct, aEtagesStruct, aLocauxStruct,
				aEquipmentsStruct, aAllEquipments;
			if (json.data.length > 0) {
				aSites = json.data.filter(function (oEq) {
					return oEq.eq.type === "Site";
				});
				aBatiments = json.data.filter(function (oEq) {
					return oEq.eq.type === "Batiment";
				});
				aEtages = json.data.filter(function (oEq) {
					return oEq.eq.type === "Etage";
				});
				aLocaux = json.data.filter(function (oEq) {
					return oEq.eq.type === "Local";
				});
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

			if (aSitesStruct && aSitesStruct.length > 0 && aBatimentsStruct && aBatimentsStruct.length > 0) {
				aSitesStruct.forEach(function (oSite) {
					oSite.children = [];
					var aChildrenBatiment = aBatimentsStruct.filter(function (oBatiment) {
						return oBatiment.parentId === oSite.id;
					});
					oSite.children = aChildrenBatiment;
				});
			}
			if (aSitesStruct && aSitesStruct.length > 0 && aBatimentsStruct && aBatimentsStruct.length > 0 && aEtagesStruct && aEtagesStruct.length >
				0) {
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
			if (aSitesStruct && aSitesStruct.length > 0 && aBatimentsStruct && aBatimentsStruct.length > 0 && aEtagesStruct && aEtagesStruct.length >
				0 && aLocauxStruct && aLocauxStruct.length > 0) {
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
			if (aSitesStruct && aSitesStruct.length > 0 && aBatimentsStruct && aBatimentsStruct.length > 0 && aEtagesStruct && aEtagesStruct.length >
				0 && aLocauxStruct && aLocauxStruct.length > 0 &&
				aEquipmentsStruct && aEquipmentsStruct.length > 0) {
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
			
			//BEGIN - ADD NBO 27/10/2021
			this.fnAddParentNameToChildren = function(oParent){
				this.iCurrentIndex = 0;
				if(oParent && oParent.children && oParent.children.length > 0){
					this.iChildrenNumber = oParent.children.length;
					if(!this.sParentName){
						this.sParentName = ""
					}
					this.sParentName += oParent.name;
					oParent.children.forEach(function(oCurrentChild, index){
						this.iCurrentIndex = index;
						oCurrentChild.nameForFilter = this.sParentName;
						
						this.fnAddParentNameToChildren(oCurrentChild);
					}.bind(this))	
				}
			};
			
			aSitesStruct.forEach(function(oCurrentParent){
				this.sParentName = ""
				this.fnAddParentNameToChildren(oCurrentParent);
			}.bind(this));
			//END - ADD NBO 27/10/2021
			
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