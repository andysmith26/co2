<style>
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
	}

	:global(.protected-layout) {
		display: block !important; /* Override flex from parent layout */
		min-height: 100vh;
		width: 100%;
	}

	:global(.sidebar) {
		display: none !important; /* Hide the sidebar */
	}

	:global(.content) {
		width: 100%;
		padding: 0.5rem !important; /* Minimal padding */
	}
</style>

<!-- Override the protected layout just for the projects page -->
<slot />
