<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { studentStore } from '$lib/stores/students.svelte.ts';
	import { GROUP_MEMBER_ROLES } from '$lib/constants';
	import type { GroupMember } from '../../types';

	// Using the new $props rune
	const {
		groupId = '',
		members = [],
		isLoading = false,
	} = $props<{
		groupId: string;
		members: GroupMember[];
		isLoading: boolean;
	}>();

	// State with explicit type declarations
	let selectedRole: string = $state(GROUP_MEMBER_ROLES.STUDENT);
	let searchQuery: string = $state('');
	let searchResults: any[] = $state([]);
	let error: string | null = $state(null);
	let isSearching: boolean = $state(false);
	let isAdding: boolean = $state(false);

	const dispatch = createEventDispatcher();

	async function searchUsers() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		error = null;

		try {
			// Determine which API to call based on the selected role
			const endpoint =
				selectedRole === GROUP_MEMBER_ROLES.STUDENT
					? '/api/students?search='
					: '/api/teachers?search=';

			const response = await fetch(`${endpoint}${encodeURIComponent(searchQuery)}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to search users');
			}

			const data = await response.json();

			// Filter out users who are already members
			const existingUserIds = members
			  .filter(m => selectedRole === GROUP_MEMBER_ROLES.TEACHER ? m.user_id : m.student_id)
			  .map(m => selectedRole === GROUP_MEMBER_ROLES.TEACHER ? m.user_id : m.student_id);
			  
			searchResults = data.filter((user) => !existingUserIds.includes(user.id));
		} catch (err) {
			console.error('Error searching users:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to search users';
			}
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function handleSearchChange() {
		if (searchQuery.length >= 2) {
			searchUsers();
		} else {
			searchResults = [];
		}
	}

	async function addMember(userId: string) {
		isAdding = true;
		error = null;

		try {
			// Properly format the payload based on member type
			const payload = {
				role: selectedRole,
			};
			
			if (selectedRole === GROUP_MEMBER_ROLES.TEACHER) {
				payload['user_id'] = userId;
			} else {
				payload['student_id'] = userId;
			}
			
			dispatch('addMember', {
				groupId,
				...payload,
			});

			// Clear search after adding
			searchQuery = '';
			searchResults = [];
		} catch (err) {
			console.error('Error adding member:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to add member';
			}
		} finally {
			isAdding = false;
		}
	}

	async function removeMember(memberId: string) {
		try {
			dispatch('removeMember', {
				groupId,
				memberId,
			});
		} catch (err) {
			console.error('Error removing member:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to remove member';
			}
		}
	}

	// Reactive declarations with $effect
	$effect(() => {
		if (searchQuery.length >= 2) {
			searchUsers();
		} else {
			searchResults = [];
		}
	});
</script>

<!-- HTML template remains mostly unchanged, just add the correct member filtering -->
<div class="member-manager my-6">
	<h3 class="text-lg font-medium mb-4">Group Members</h3>

	{#if error}
		<div class="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
			{error}
		</div>
	{/if}

	<div class="add-member bg-gray-50 p-4 rounded-lg mb-6">
		<h4 class="text-sm font-medium text-gray-700 mb-3">Add New Member</h4>

		<div class="flex items-center mb-4">
			<div class="w-32 mr-4">
				<label for="role-select" class="sr-only">Select Role</label>
				<select
					id="role-select"
					bind:value={selectedRole}
					class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value={GROUP_MEMBER_ROLES.STUDENT}>Student</option>
					<option value={GROUP_MEMBER_ROLES.TEACHER}>Teacher</option>
				</select>
			</div>

			<div class="flex-1 relative">
				<label for="search-users" class="sr-only">Search Users</label>
				<input
					id="search-users"
					type="text"
					bind:value={searchQuery}
					oninput={handleSearchChange}
					placeholder={`Search for ${selectedRole === GROUP_MEMBER_ROLES.STUDENT ? 'students' : 'teachers'}...`}
					class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				/>
				{#if isSearching}
					<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
						<span class="loading loading-spinner loading-xs text-gray-400"></span>
					</div>
				{/if}
			</div>
		</div>

		{#if searchResults.length > 0}
			<div class="search-results border rounded-md max-h-64 overflow-y-auto">
				<ul class="divide-y divide-gray-200">
					{#each searchResults as user (user.id)}
						<li class="p-2 hover:bg-gray-50 flex justify-between items-center">
							<span>
								{user.first_name}
								{selectedRole === GROUP_MEMBER_ROLES.STUDENT
									? user.last_initial
									: user.last_name || ''}
							</span>
							<button
								onclick={() => addMember(user.id)}
								disabled={isAdding}
								class="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
							>
								Add
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{:else if searchQuery.length >= 2 && !isSearching}
			<p class="text-sm text-gray-500">No results found.</p>
		{/if}
	</div>

	<div class="current-members">
		{#if members.length === 0 && !isLoading}
			<p class="text-sm text-gray-500">No members in this group yet.</p>
		{:else}
			<div class="mb-4">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Teachers</h4>
				<ul class="border rounded-md divide-y divide-gray-200">
					{#each members.filter((m) => m.role === GROUP_MEMBER_ROLES.TEACHER) as member (member.id)}
						<li class="p-3 flex justify-between items-center">
							<span>
								{member.first_name}
								{member.last_name || ''}
							</span>
							<button
								onclick={() => removeMember(member.id)}
								class="text-sm text-red-600 hover:text-red-800"
							>
								Remove
							</button>
						</li>
					{:else}
						<li class="p-3 text-sm text-gray-500">No teachers in this group.</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="text-sm font-medium text-gray-700 mb-2">Students</h4>
				<ul class="border rounded-md divide-y divide-gray-200">
					{#each members.filter((m) => m.role === GROUP_MEMBER_ROLES.STUDENT) as member (member.id)}
						<li class="p-3 flex justify-between items-center">
							<span>
								{member.first_name}
								{member.last_initial || ''}
							</span>
							<button
								onclick={() => removeMember(member.id)}
								class="text-sm text-red-600 hover:text-red-800"
							>
								Remove
							</button>
						</li>
					{:else}
						<li class="p-3 text-sm text-gray-500">No students in this group.</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if isLoading}
			<div class="flex justify-center py-4">
				<span class="loading loading-spinner loading-md text-indigo-600"></span>
			</div>
		{/if}
	</div>
</div>
