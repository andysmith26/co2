<style>
	.content {
		padding: 0; /* Remove padding since main layout handles spacing */
	}
</style>

<script lang="ts">
	let { data } = $props();
</script>

<main class="content">
	<slot />
</main>
