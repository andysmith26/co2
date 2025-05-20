<!-- src/lib/components/Groups/MemberManager.svelte -->
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
	let allStudents: any[] = $state([]);
	let error: string | null = $state(null);
	let isSearching: boolean = $state(false);
	let isLoadingAll: boolean = $state(false);
	let isAdding: boolean = $state(false);
	let showAllStudents: boolean = $state(false);
	let viewMode: 'search' | 'all' = $state('search');
	let currentPage: number = $state(1);
	let totalPages: number = $state(1);
	let totalStudents: number = $state(0);
	let studentsPerPage: number = $state(20);

	const dispatch = createEventDispatcher();

	// Load all students when view mode changes to 'all'
	$effect(() => {
		if (viewMode === 'all' && selectedRole === GROUP_MEMBER_ROLES.STUDENT) {
			loadAllStudents();
		}
	});

	async function searchUsers() {
		if (!searchQuery.trim() && viewMode === 'search') {
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
			const results = selectedRole === GROUP_MEMBER_ROLES.STUDENT ? data.students || data : data;

			// Filter out users who are already members
			const existingUserIds = members.map((m) => m.user_id);
			searchResults = results.filter((user) => !existingUserIds.includes(user.id));
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

	async function loadAllStudents(page = 1) {
		isLoadingAll = true;
		error = null;
		currentPage = page;

		try {
			const response = await fetch(
				`/api/students?all=false&page=${page}&limit=${studentsPerPage}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to load students');
			}

			const data = await response.json();
			
			// Filter out users who are already members
			const existingUserIds = members.map((m) => m.user_id);
			allStudents = (data.students || []).filter((user) => !existingUserIds.includes(user.id));
			
			// Update pagination info
			if (data.pagination) {
				totalPages = data.pagination.pages;
				totalStudents = data.pagination.total;
			}
		} catch (err) {
			console.error('Error loading all students:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to load students';
			}
			allStudents = [];
		} finally {
			isLoadingAll = false;
		}
	}

	function handleSearchChange() {
		if (searchQuery.length >= 2 || viewMode === 'all') {
			searchUsers();
		} else {
			searchResults = [];
		}
	}

	function toggleViewMode() {
		viewMode = viewMode === 'search' ? 'all' : 'search';
		if (viewMode === 'all') {
			loadAllStudents();
		}
	}

	async function addMember(userId: string) {
		isAdding = true;
		error = null;

		try {
			dispatch('addMember', {
				groupId,
				userId, // This matches what handleAddMember expects
				role: selectedRole,
			});

			// Clear search after adding
			searchQuery = '';
			searchResults = [];
			
			// Refresh the student list if in "all" view
			if (viewMode === 'all') {
				setTimeout(() => {
					loadAllStudents(currentPage);
				}, 300); // Give time for the server to process the addition
			}
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
			
			// Refresh the student list if in "all" view
			if (viewMode === 'all') {
				setTimeout(() => {
					loadAllStudents(currentPage);
				}, 300); // Give time for the server to process the removal
			}
		} catch (err) {
			console.error('Error removing member:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Failed to remove member';
			}
		}
	}

	// Handle pagination
	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		loadAllStudents(page);
	}

	// Reactive declarations with $effect
	$effect(() => {
		if (searchQuery.length >= 2 && viewMode === 'search') {
			searchUsers();
		} else if (viewMode === 'search') {
			searchResults = [];
		}
	});
	
	// Handle role change
	$effect(() => {
		// Reset view when switching roles
		viewMode = 'search';
		searchQuery = '';
		searchResults = [];
		allStudents = [];
	});
</script>

<div class="member-manager my-6">
	<h3 class="text-lg font-medium mb-4">Group Members</h3>

	{#if error}
		<div class="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
			{error}
			<button class="float-right font-bold" on:click={() => (error = null)}>×</button>
		</div>
	{/if}

	<div class="add-member bg-gray-50 p-4 rounded-lg mb-6">
		<h4 class="text-sm font-medium text-gray-700 mb-3">Add New Member</h4>

		<div class="flex flex-wrap items-center mb-4 gap-2">
			<div class="w-full sm:w-auto">
				<label for="role-select" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
				<select
					id="role-select"
					bind:value={selectedRole}
					class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				>
					<option value={GROUP_MEMBER_ROLES.STUDENT}>Student</option>
					<option value={GROUP_MEMBER_ROLES.TEACHER}>Teacher</option>
				</select>
			</div>

			{#if selectedRole === GROUP_MEMBER_ROLES.STUDENT}
				<div class="w-full sm:w-auto flex-1 flex items-end">
					<div class="tabs tabs-boxed bg-white w-full">
						<button 
							class={`tab ${viewMode === 'search' ? 'tab-active' : ''}`} 
							on:click={() => (viewMode = 'search')}
						>
							Search
						</button>
						<button 
							class={`tab ${viewMode === 'all' ? 'tab-active' : ''}`}
							on:click={() => (viewMode = 'all')}
						>
							View All Students
						</button>
					</div>
				</div>
			{:else}
				<!-- For teachers, we only have the search option -->
				<div class="w-full sm:flex-1">
					<label for="search-users" class="block text-sm font-medium text-gray-700 mb-1">Search Teachers</label>
					<div class="relative">
						<input
							id="search-users"
							type="text"
							bind:value={searchQuery}
							on:input={handleSearchChange}
							placeholder="Search for teachers..."
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
						{#if isSearching}
							<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
								<span class="loading loading-spinner loading-xs text-gray-400"></span>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		{#if selectedRole === GROUP_MEMBER_ROLES.STUDENT && viewMode === 'search'}
			<div class="relative mb-4">
				<label for="search-students" class="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
				<input
					id="search-students"
					type="text"
					bind:value={searchQuery}
					on:input={handleSearchChange}
					placeholder="Search for students..."
					class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				/>
				{#if isSearching}
					<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
						<span class="loading loading-spinner loading-xs text-gray-400"></span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Search Results -->
		{#if viewMode === 'search' && searchResults.length > 0}
			<div class="search-results border rounded-md max-h-64 overflow-y-auto">
				<h5 class="p-2 bg-gray-100 text-sm font-medium">Search Results</h5>
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
								on:click={() => addMember(user.id)}
								disabled={isAdding}
								class="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
							>
								Add
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{:else if viewMode === 'search' && searchQuery.length >= 2 && !isSearching}
			<p class="text-sm text-gray-500">No results found.</p>
		{/if}

		<!-- All Students View -->
		{#if viewMode === 'all' && selectedRole === GROUP_MEMBER_ROLES.STUDENT}
			<div class="all-students border rounded-md">
				<h5 class="p-2 bg-gray-100 text-sm font-medium">All Available Students</h5>
				
				{#if isLoadingAll}
					<div class="flex justify-center py-8">
						<span class="loading loading-spinner loading-md text-indigo-600"></span>
					</div>
				{:else if allStudents.length === 0}
					<p class="text-sm text-gray-500 p-4 text-center">
						No available students found. All students may already be members of this group.
					</p>
				{:else}
					<ul class="divide-y divide-gray-200 max-h-64 overflow-y-auto">
						{#each allStudents as student (student.id)}
							<li class="p-2 hover:bg-gray-50 flex justify-between items-center">
								<span>{student.first_name} {student.last_initial}</span>
								<button
									on:click={() => addMember(student.id)}
									disabled={isAdding}
									class="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
								>
									Add
								</button>
							</li>
						{/each}
					</ul>
					
					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="flex justify-center items-center p-2 bg-gray-50 border-t">
							<div class="join">
								<button 
									class="join-item btn btn-sm" 
									disabled={currentPage === 1}
									on:click={() => goToPage(1)}
								>
									«
								</button>
								<button 
									class="join-item btn btn-sm" 
									disabled={currentPage === 1}
									on:click={() => goToPage(currentPage - 1)}
								>
									‹
								</button>
								<button class="join-item btn btn-sm">
									Page {currentPage} of {totalPages}
								</button>
								<button 
									class="join-item btn btn-sm" 
									disabled={currentPage === totalPages}
									on:click={() => goToPage(currentPage + 1)}
								>
									›
								</button>
								<button 
									class="join-item btn btn-sm" 
									disabled={currentPage === totalPages}
									on:click={() => goToPage(totalPages)}
								>
									»
								</button>
							</div>
						</div>
					{/if}
				{/if}
			</div>
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
								on:click={() => removeMember(member.id)}
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
								on:click={() => removeMember(member.id)}
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
