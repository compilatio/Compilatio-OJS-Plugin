<div id="compilatioSettingsPanelRoot"></div>

<script>
	(function () {ldelim}
		function mountCompilatioSettingsPanel() {ldelim}
			var target = document.getElementById('compilatioSettingsPanelRoot');

			if (!target || target.dataset.mounted === 'true') {ldelim}
				return;
			{rdelim}

			if (!window.pkp || !window.pkp.pkpCreateVueApp || !window.CompilatioSettingsPanel) {ldelim}
				window.setTimeout(mountCompilatioSettingsPanel, 100);
				return;
			{rdelim}

			target.dataset.mounted = 'true';
			window.pkp.pkpCreateVueApp(window.CompilatioSettingsPanel).mount(target);
		{rdelim}

		mountCompilatioSettingsPanel();
	{rdelim})();
</script>
