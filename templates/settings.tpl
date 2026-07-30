<div
	id="compilatioSettingsPanelRoot"
	data-api-url="{$compilatioSettingsApiUrl|escape}"
	data-csrf-token="{$compilatioCsrfToken|escape}"
></div>

<script>
	(function () {ldelim}
		function mountCompilatioSettingsPanel() {ldelim}
			var target = document.getElementById('compilatioSettingsPanelRoot');

			if (!target || target.dataset.mounted === 'true') {ldelim}
				return;
			{rdelim}

			if (!window.pkp || !window.pkp.pkpCreateVueApp || !window.mountCompilatioSettingsApp) {ldelim}
				window.setTimeout(mountCompilatioSettingsPanel, 100);
				return;
			{rdelim}

			window.mountCompilatioSettingsApp(target);
			target.dataset.mounted = 'true';
		{rdelim}

		mountCompilatioSettingsPanel();
	{rdelim})();
</script>
