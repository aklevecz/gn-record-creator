<script>
	import { page } from '$app/state';
</script>

<div class="text-lg">
	<div class="p-4">
		<h1 class="mb-4 text-xl">There was an error on the server while trying to get your submission 😭</h1>
		<div>User session: {page.data.session}</div>
		<div>Submission id: {page.params.id}</div>
	</div>
	<div class="p-4">
		<div>{page.error?.message}</div>
		<div>{page.status}</div>
	</div>
</div>
