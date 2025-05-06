<script lang="ts">
	import { page } from '$app/state';
	import { groupStore } from '$lib/stores/groups.svelte.ts';
	import GroupForm from '$lib/components/Groups/GroupForm.svelte';
	import MemberManager from '$lib/components/Groups/MemberManager.svelte';

	// State with explicit type declarations
	let isEditing: boolean = $state(false);
	let showDeleteConfirm: boolean = $state(false);
	let error: string | null = $state(null);

	// Get the group ID from the route params
	const groupId = $derived(page.params.groupId);

	// References to store values
	const group = $derived(groupStore.getGroupById(groupId));
	const members = $derived(groupStore.getGroupMembers());
	const loading = $derived(groupStore.loading);
	const membersLoading = $derived(groupStore.membersLoading);
	const storeError = $derived(groupStore.error);

	// Lifecycles
	$effect(() => {
		if (groupId) {
			// Fetch data when component loads or groupId changes
			groupStore.fetchGroups();
			groupStore.fetchGroupMembers(groupId);
		}
	});

	$effect(() => {
		// Propagate store error to local state
		if (storeError) {
			error = storeError;
		}
	});

	// Event handlers
	async function handleUpdateGroup(event) {
		try {
			const { name, description } = event.detail;
			await groupStore.updateGroup(groupId, name, description);
			isEditing = false;
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to update group';
			}
			console.error('Error updating group:', err);
		}
	}

	function handleCancelEdit() {
		isEditing = false;
	}

	async function handleDelete() {
		try {
			await groupStore.deleteGroup(groupId);
			// Navigate back to groups listing after deletion
			window.location.href = '/groups';
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to delete group';
			}
			console.error('Error deleting group:', err);
			showDeleteConfirm = false;
		}
	}

	async function handleAddMember(event) {
		try {
			const { userId, role } = event.detail;
			await groupStore.addMemberToGroup(groupId, userId, role);
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to add member to group';
			}
			console.error('Error adding member:', err);
		}
	}

	async function handleRemoveMember(event) {
		try {
			const { memberId } = event.detail;
			await groupStore.removeMemberFromGroup(groupId, memberId);
			error = null;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to remove member from group';
			}
			console.error('Error removing member:', err);
		}
	}
</script>

<svelte:head>
	<title>{group ? group.name : 'Group Details'}</title>
</svelte:head>

<div class="group-details container mx-auto px-4 py-8">
	<div class="mb-6">
		<a href="/groups" class="text-indigo-600 hover:text-indigo-800"> &larr; Back to Groups </a>
	</div>

	{#if error}
		<div class="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
			{error}
		</div>
	{/if}

	{#if loading && !group}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg text-indigo-600"></span>
		</div>
	{:else if !group}
		<div class="text-center py-12 bg-gray-50 rounded-lg">
			<h3 class="text-lg font-medium text-gray-700 mb-2">Group Not Found</h3>
			<p class="text-gray-500 mb-6">
				The group you're looking for may have been deleted or does not exist.
			</p>
			<a
				href="/groups"
				class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
			>
				Return to Groups
			</a>
		</div>
	{:else}
		{#if isEditing}
			<div class="mb-6">
				<GroupForm {group} on:submit={handleUpdateGroup} on:cancel={handleCancelEdit} />
			</div>
		{:else}
			<div class="flex justify-between items-start mb-6">
				<div>
					<h1 class="text-2xl font-bold">{group.name}</h1>
					{#if group.description}
						<p class="text-gray-600 mt-2">{group.description}</p>
					{/if}
					<p class="text-sm text-gray-500 mt-2">
						Created on {new Date(group.created_at).toLocaleDateString()}
					</p>
				</div>

				<div class="flex gap-2">
					<button
						onclick={() => (isEditing = true)}
						class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
					>
						Edit Group
					</button>

					{#if !showDeleteConfirm}
						<button
							onclick={() => (showDeleteConfirm = true)}
							class="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-50"
						>
							Delete
						</button>
					{:else}
						<div class="bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-3">
							<span class="text-sm text-red-800">Confirm deletion?</span>
							<button
								onclick={handleDelete}
								class="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
							>
								Yes, Delete
							</button>
							<button
								onclick={() => (showDeleteConfirm = false)}
								class="px-3 py-1 bg-white text-gray-700 text-sm border rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="bg-white shadow rounded-lg p-6">
			<MemberManager
				{groupId}
				{members}
				isLoading={membersLoading}
				on:addMember={handleAddMember}
				on:removeMember={handleRemoveMember}
			/>
		</div>
	{/if}
</div>
