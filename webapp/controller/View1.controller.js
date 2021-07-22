sap.ui.define([
	"sap/ui/core/mvc/Controller"/*,
	"sap/coresystems/fsm-shell"*/
], function (Controller) {
	"use strict";

	return Controller.extend("testTree.testTree.controller.View1", {
		onInit: function () {
		/*	const oView = this.getView();
			 const { ShellSdk, SHELL_EVENTS } = FSMShell;

	        const shellSdk = ShellSdk.init(parent, '*');
	
	        shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, {
	            clientIdentifier: 'fsm-demo-plugin',
	        });
	        
	         shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, (event) => {
            const {
                account,
                accountId,
                company,
                companyId,
                user,
                userId,
                selectedLocale,
            } = JSON.parse(event);

            oView.byId("account").setTitle(account);
            oView.byId("accountID").setTitle(accountId);
            oView.byId("company").setTitle(company);
            oView.byId("companyID").setTitle(companyId);
            oView.byId("user").setTitle(user);
            oView.byId("userID").setTitle(userId);
            oView.byId("selLocale").setTitle(selectedLocale);
        });*/
		}
	});
});