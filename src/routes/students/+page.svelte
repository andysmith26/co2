<script>
	import StudentList from '$lib/components/StudentList.svelte';
</script>

<div class="container">
	<h1>Students</h1>
	<StudentList />
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: bold;
		margin-bottom: 1.5rem;
	}
</style>
