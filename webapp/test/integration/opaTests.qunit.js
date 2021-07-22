/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"testTree/testTree/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});